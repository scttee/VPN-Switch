# Deploying Kinlink web UI to Cloudflare Pages

This repository is split into:
- `apps/web` (Next.js UI)
- `apps/api` (Node HTTP server)

## Will it work on Cloudflare Pages?

**Yes, for the web app (`apps/web`)** using `@cloudflare/next-on-pages`.

**Not directly for the current API server (`apps/api/src/server.ts`)** because Cloudflare Pages is not a generic long-running Node server host. You should deploy the API separately (Cloudflare Workers/Hono, Fly.io, Render, Railway, etc.), then point the web app to that API URL.

## Recommended production setup

1. Deploy `apps/web` to Cloudflare Pages.
2. Deploy `apps/api` to a server runtime (or refactor API endpoints into Workers).
3. Set `NEXT_PUBLIC_API_BASE_URL` for the frontend to your deployed API domain.
4. Keep PostgreSQL hosted externally (Neon/Supabase/RDS/etc.).

## Cloudflare Pages settings

When creating the Pages project:

- **Root directory:** `apps/web`
- **Build command:** `npm run build:cf`
- **Build output directory:** `.vercel/output/static`
- **Node version:** `22`

## Required env vars

In Cloudflare Pages project settings:

- `NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.tld`

Use `.dev.vars.example` as a local template.

## Local check commands

From repo root:

```bash
npm --workspace @kinlink/web run build:cf
npm --workspace @kinlink/web run preview:cf
```

## DNS / domains

- Attach your custom domain (e.g. `app.kinlink.com`) to Pages.
- Put API on a sibling domain (e.g. `api.kinlink.com`).
- Enable HTTPS (automatic on Cloudflare).

## Important architectural note

Kinlink's future real-time diagnostics and device status features may rely on websockets/SSE and background workers. Pages + Workers support this pattern, but your current `apps/api` should be considered a separate deploy target until migrated.
