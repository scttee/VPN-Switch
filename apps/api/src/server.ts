import { createServer } from "node:http";
import { evaluateAccess, detectRouteConflicts, buildHomeBridgePlan } from "@kinlink/shared/index";
import { parse } from "node:url";

const server = createServer((req, res) => {
  const url = parse(req.url || "", true);

  if (url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "kinlink-api" }));
    return;
  }

  if (url.pathname === "/diagnostics/access") {
    const result = evaluateAccess(
      [{ id: "default-deny", subjectType: "membership_role", subjectIdOrValue: "guest", action: "deny", priority: 100 }],
      { userId: "demo", userRole: "guest", deviceId: "dev", resourceId: "photos", at: new Date() }
    );
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }


  if (url.pathname === "/diagnostics/home-bridge") {
    const plan = buildHomeBridgePlan({
      homeAName: (url.query.homeA as string) || "Sydney Home",
      homeBName: (url.query.homeB as string) || "Brisbane Home",
      homeACidr: (url.query.cidrA as string) || "192.168.10.0/24",
      homeBCidr: (url.query.cidrB as string) || "192.168.20.0/24",
      internetReachable: (url.query.internet as string) !== "false"
    });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(plan));
    return;
  }

  if (url.pathname === "/diagnostics/routes") {
    const conflicts = detectRouteConflicts([
      { deviceId: "home-a", cidr: "192.168.1.0/24" },
      { deviceId: "home-b", cidr: "192.168.1.0/24" }
    ]);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(conflicts));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(4000, () => {
  console.log("Kinlink API listening on :4000");
});
