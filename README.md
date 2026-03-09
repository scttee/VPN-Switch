# Kinlink

Kinlink is a secure private overlay networking platform for households and small trusted groups. It lets people access approved resources (photos, folders, dashboards, NAS, printers, dev machines) remotely with a local-feeling experience while preserving explicit access controls.

## What this project includes

- **Monorepo scaffold** for web app, API, shared policy logic, and Go device agent.
- **Control plane**: Next.js app + Node API + Prisma/PostgreSQL schema.
- **Data plane scaffold**: WireGuard-oriented agent interfaces with mock tunnel status.
- **Security controls**: deterministic policy evaluation, invite lifecycle, route conflict detection.
- **Diagnostics-first UX**: route overlap warnings, direct-vs-relay hints, DNS health placeholders.

## Architecture overview

### Control plane
- `apps/web`: Next.js app for dashboard, people, devices, resources, policies, DNS, activity, onboarding.
- `apps/api`: Node HTTP API with health and diagnostics endpoints.
- `prisma/schema.prisma`: core entities (users, workspaces, membership, invites, devices, resources, policies, routes, DNS, sessions, audit events, recovery tokens).

### Data plane
- `agent/`: cross-platform Go daemon scaffold.
- Tunnel state is represented as direct/relay status via a mock layer.
- Intended production path: WireGuard peers, NAT traversal, relay fallback.

## Threat model (high level)

- **Assumed trusted**: workspace owners/admins and explicitly invited members.
- **Untrusted networks**: internet paths between peers; traffic must remain encrypted.
- **Controls implemented in scaffold**:
  - Least privilege policy checks.
  - Explicit allow/deny semantics with deterministic priority.
  - Invite expiration, acceptance, and revocation handling.
  - Audit/event model placeholders.
- **Out of scope in scaffold**:
  - Full cryptographic key rotation automation.
  - Production relay implementation and deep packet enforcement.


## Cloudflare Pages compatibility

If you plan to host Kinlink on Cloudflare:

- `apps/web` (Next.js) is compatible with **Cloudflare Pages** via `@cloudflare/next-on-pages`.
- `apps/api` is currently a standalone Node server and should be deployed separately (or migrated to Workers).

See `docs-cloudflare-pages.md` for exact setup steps, best-practice Pages settings, and production hardening recommendations.

## Local development

### Requirements
- Node.js 22+
- npm 10+
- Go 1.23+
- Docker (optional, for compose stack)

### Start with Docker Compose
```bash
docker compose up --build
```

### Start manually
```bash
npm install
npm run dev
```

### Run tests
```bash
npm test
npm run test:integration
```

### Seed demo data output
```bash
npm run seed
```


## Sydney ↔ Brisbane home-to-home setup

Yes—Kinlink is designed to work across cities as long as both homes have internet connectivity and enrolled agents.

Recommended setup for two homes:

1. Install one Kinlink agent in each home (always-on device such as mini PC/NAS).
2. Enroll both devices into the same trusted workspace.
3. Start with **resource publishing** (photos, NAS, dashboard, printer) using friendly DNS names.
4. Only enable **subnet routing** after checking CIDR overlap (for example avoid both homes on `192.168.1.0/24`).
5. Use diagnostics to verify direct path, with relay fallback when NAT traversal fails.

Important: Kinlink gives a local-feeling routed overlay for approved resources; it does not claim full same-Wi-Fi/layer-2 behavior across homes.


## Fast path: two-person usable flow (you + your brother)

1. Run API (`apps/api`) and web (`apps/web`).
2. You open **Onboarding Wizard** and:
   - sign up,
   - log in,
   - create workspace.
3. Copy your auth token + workspace ID.
4. Open **Invite Flow**, create invite for your brother's email, copy invite token.
5. Your brother signs up/logs in (same app), then opens **Invite Flow** and accepts invite token.
6. Both users can call `/resources/me` with their auth token to view workspace resources.

Current implementation note: API now uses Prisma models and is intended for PostgreSQL-backed persistence once `DATABASE_URL` and migrations are applied.


### Fast path improvements in this build

- Auth passwords are hashed with `scrypt` before storage.
- Auth/workspace/invite/resource flows are implemented through Prisma-backed API routes.
- Invite Flow can load pending invites for the logged-in user.
- Shared Resources page can load API-backed resources using your saved auth token.
- Invite acceptance now requires logged-in email to match invite email (safer two-person flow).
- Added `/auth/me` and `/auth/logout` for session verification and sign-out.

## Known limitations

- No full L2 LAN emulation; this project intentionally focuses on routed overlay access and explicit published resources.
- Local discovery protocols (mDNS/SSDP/broadcast) may be discovery-limited across routed overlays.
- API and UI are scaffolded for production direction but not yet feature-complete.

## Roadmap

1. Add real auth/session flows and workspace RBAC middleware.
2. Implement Prisma-backed API routes for devices/resources/policies/invites/audit.
3. Add websocket/SSE live state for tunnel health and resource reachability.
4. Add thumbnail/index jobs for photo collections.
5. Integrate real WireGuard config + relay fallback + enrollment handshake.
6. Build mobile/desktop companion flows and QR onboarding.

## Safety and product boundaries

Kinlink is designed for legitimate private networking and authorized resource sharing only. It does not spoof physical proximity and does not claim to reproduce every property of being on the same Wi-Fi.
