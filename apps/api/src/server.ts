import { createServer } from "node:http";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { evaluateAccess, detectRouteConflicts, buildHomeBridgePlan } from "@kinlink/shared/index";
import { parse } from "node:url";

const prisma = new PrismaClient();

const demoResourceTemplates = [
  { name: "Family Photos", publishedName: "will-photos.kin", visibility: "selected_people", type: "photos" },
  { name: "Kitchen Printer", publishedName: "printer.home.kin", visibility: "selected_people", type: "printer" },
  { name: "Media Library", publishedName: "media.kin", visibility: "workspace", type: "media" }
];

const json = (res: any, code: number, body: unknown) => {
  res.writeHead(code, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  });
  res.end(JSON.stringify(body));
};

const readBody = async (req: any): Promise<any> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const hashPassword = (password: string, salt = randomUUID()) => {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
};

const verifyPassword = (password: string, salt: string, hash: string) => {
  const check = scryptSync(password, salt, 64);
  const target = Buffer.from(hash, "hex");
  return check.length === target.length && timingSafeEqual(check, target);
};

const getSession = async (req: any) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  return prisma.apiSession.findUnique({ where: { token } });
};

const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const server = createServer(async (req, res) => {
  const url = parse(req.url || "", true);
  try {
    if (req.method === "OPTIONS") return json(res, 204, {});

    if (url.pathname === "/health") return json(res, 200, { status: "ok", service: "kinlink-api" });

    if (url.pathname === "/auth/signup" && req.method === "POST") {
      const body = await readBody(req);
      if (!body.email || !body.password || !body.name) return json(res, 400, { error: "name, email, password required" });
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) return json(res, 409, { error: "Email already registered" });
      const { salt, hash } = hashPassword(body.password);
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          avatarUrl: `salt:${salt}:hash:${hash}`
        }
      });
      return json(res, 201, { id: user.id, name: user.name, email: user.email });
    }

    if (url.pathname === "/auth/login" && req.method === "POST") {
      const body = await readBody(req);
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user || !user.avatarUrl?.startsWith("salt:")) return json(res, 401, { error: "Invalid credentials" });
      const m = user.avatarUrl.match(/^salt:(.*):hash:(.*)$/);
      if (!m || !verifyPassword(body.password || "", m[1], m[2])) return json(res, 401, { error: "Invalid credentials" });
      const session = await prisma.apiSession.create({ data: { token: randomUUID(), userId: user.id } });
      return json(res, 200, { token: session.token, user: { id: user.id, name: user.name, email: user.email } });
    }

    if (url.pathname === "/auth/me" && req.method === "GET") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return json(res, 404, { error: "User missing" });
      return json(res, 200, { user: { id: user.id, name: user.name, email: user.email }, sessionCreatedAt: session.createdAt });
    }

    if (url.pathname === "/auth/logout" && req.method === "POST") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      await prisma.apiSession.delete({ where: { token: session.token } });
      return json(res, 200, { ok: true });
    }

    if (url.pathname === "/workspace" && req.method === "POST") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const body = await readBody(req);
      const base = slugify(body.name || "family-circle");
      const workspace = await prisma.workspace.create({
        data: {
          name: body.name || "Family Circle",
          slug: `${base}-${Math.random().toString(36).slice(2, 7)}`,
          memberships: { create: [{ userId: session.userId, role: "owner" }] }
        }
      });
      await prisma.resource.createMany({
        data: demoResourceTemplates.map((r) => ({
          workspaceId: workspace.id,
          ownerUserId: session.userId,
          deviceId: null,
          type: r.type,
          name: r.name,
          description: `${r.name} shared through Kinlink`,
          icon: r.type,
          publishedName: r.publishedName,
          localTarget: "pending-agent-registration",
          visibility: r.visibility
        }))
      });
      return json(res, 201, workspace);
    }

    if (url.pathname === "/workspace/me" && req.method === "GET") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const memberships = await prisma.membership.findMany({ where: { userId: session.userId }, include: { workspace: true } });
      return json(res, 200, { workspaces: memberships.map((m) => ({ ...m.workspace, role: m.role })) });
    }

    if (url.pathname === "/invites" && req.method === "POST") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const body = await readBody(req);
      const ownerMembership = await prisma.membership.findFirst({ where: { workspaceId: body.workspaceId, userId: session.userId, role: { in: ["owner", "admin"] } } });
      if (!ownerMembership) return json(res, 404, { error: "Workspace not found or not authorized" });
      const invite = await prisma.invite.create({
        data: {
          workspaceId: body.workspaceId,
          email: body.email,
          role: body.role || "member",
          token: randomUUID(),
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
        }
      });
      return json(res, 201, invite);
    }

    if (url.pathname === "/invites/me" && req.method === "GET") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return json(res, 404, { error: "User missing" });
      const invites = await prisma.invite.findMany({ where: { email: user.email, acceptedAt: null, expiresAt: { gt: new Date() } } });
      return json(res, 200, { invites });
    }

    if (url.pathname === "/invites/accept" && req.method === "POST") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return json(res, 404, { error: "User missing" });
      const body = await readBody(req);
      const invite = await prisma.invite.findUnique({ where: { token: body.token } });
      if (!invite) return json(res, 404, { error: "Invite not found" });
      if (invite.expiresAt <= new Date()) return json(res, 410, { error: "Invite expired" });
      if (invite.email.toLowerCase() !== user.email.toLowerCase()) return json(res, 403, { error: "Invite email does not match logged-in user" });
      await prisma.membership.upsert({
        where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
        update: { role: invite.role },
        create: { id: `${invite.workspaceId}_${user.id}`, workspaceId: invite.workspaceId, userId: user.id, role: invite.role }
      });
      await prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
      return json(res, 200, { ok: true, workspaceId: invite.workspaceId });
    }

    if (url.pathname === "/resources/me" && req.method === "GET") {
      const session = await getSession(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      const memberships = await prisma.membership.findMany({ where: { userId: session.userId } });
      const workspaceIds = memberships.map((m) => m.workspaceId);
      if (!workspaceIds.length) return json(res, 200, { resources: [] });
      const resources = await prisma.resource.findMany({ where: { workspaceId: { in: workspaceIds } }, orderBy: { createdAt: "desc" } });
      return json(res, 200, { resources });
    }

    if (url.pathname === "/diagnostics/access") {
      const result = evaluateAccess(
        [{ id: "default-deny", subjectType: "membership_role", subjectIdOrValue: "guest", action: "deny", priority: 100 }],
        { userId: "demo", userRole: "guest", deviceId: "dev", resourceId: "photos", at: new Date() }
      );
      return json(res, 200, result);
    }

    if (url.pathname === "/diagnostics/home-bridge") {
      const plan = buildHomeBridgePlan({
        homeAName: (url.query.homeA as string) || "Sydney Home",
        homeBName: (url.query.homeB as string) || "Brisbane Home",
        homeACidr: (url.query.cidrA as string) || "192.168.10.0/24",
        homeBCidr: (url.query.cidrB as string) || "192.168.20.0/24",
        internetReachable: (url.query.internet as string) !== "false"
      });
      return json(res, 200, plan);
    }

    if (url.pathname === "/diagnostics/routes") {
      const conflicts = detectRouteConflicts([
        { deviceId: "home-a", cidr: "192.168.1.0/24" },
        { deviceId: "home-b", cidr: "192.168.1.0/24" }
      ]);
      return json(res, 200, conflicts);
    }

    return json(res, 404, { error: "Not found" });
  } catch (error: any) {
    return json(res, 500, { error: error?.message || "Internal server error" });
  }
});

server.listen(4000, () => {
  console.log("Kinlink API listening on :4000");
});
