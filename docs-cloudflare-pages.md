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


## Best-practice Cloudflare settings (recommended)

Use these in **Cloudflare Pages → Settings** for the `apps/web` project.

### Build & deployments

- **Production branch:** `main` (or your stable release branch)
- **Framework preset:** `None` (use explicit command below)
- **Root directory:** `apps/web`
- **Build command:** `npm run build:cf`
- **Build output directory:** `.vercel/output/static`
- **Node.js version:** `22`
- **Build system:** latest available (v2)

### Environment variables

Set for both **Production** and **Preview** environments:

If your Pages project installs production deps only, keep TypeScript build packages in the web app dependencies (`typescript`, `@types/node`, `@types/react`, `@types/react-dom`) so `next build` can type-check successfully.

- `NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.tld`

Optional hardening/ops flags you can add later:

- `NEXT_TELEMETRY_DISABLED=1`

### Compatibility/runtime

These are already captured in `apps/web/wrangler.toml`:

- `compatibility_date = "2026-03-09"`
- `compatibility_flags = ["nodejs_compat"]`
- `pages_build_output_dir = ".vercel/output/static"`

### Domains & TLS

- Attach `app.your-domain.tld` to the Pages project.
- Point API to `api.your-domain.tld` on a separate deployment target.
- Keep **Always Use HTTPS** enabled in Cloudflare.
- Keep **Automatic HTTPS Rewrites** enabled.

### Caching & security

- Start with default Cloudflare caching for HTML (no aggressive edge cache rules for dynamic app routes).
- Add a WAF managed ruleset on your API domain.
- Restrict API CORS to your app origin(s) only.
- Configure rate limits on API auth/invite endpoints.

### CI/CD operational tips

- Enable preview deployments for all PRs.
- Protect production branch with required checks.
- Keep API and web deployments versioned together in release notes.



## Troubleshooting this exact Cloudflare error

If you see:

- `It looks like you're trying to use TypeScript but do not have the required package(s) installed`
- `wrangler.toml ... does not appear to be valid ... contains the pages_build_output_dir property`

check the following:

1. Deploy from a commit that includes:
   - `apps/web/package.json` with `typescript`, `@types/node`, `@types/react`, `@types/react-dom`.
   - `apps/web/wrangler.toml` with `pages_build_output_dir = ".vercel/output/static"`.
2. In Pages, ensure **Root directory** is `apps/web`.
3. Re-run deployment after clearing build cache once.

If your deploy log still shows an older commit SHA (for example `e5b833c...`), your Pages project is building an old branch/commit. Update the production branch or trigger deploy from the latest commit.
