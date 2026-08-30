# ARTÉVO — Vercel Deployment: Final Clean Configuration

## Read this first: the notices in the Vercel screenshot

The screenshot shows **`Deployment completed`**. Those notices were warnings,
not a failed deployment. They have now been removed from application
configuration:

| Prior notice | Cause | Resolution in this repository |
| --- | --- | --- |
| `Provided memory setting in vercel.json is ignored` | `functions.*.memory` is not supported with Active CPU billing | Removed every `memory` line and all custom function configuration from `vercel.json` |
| `allow-scripts … sharp` | `sharp` is an optional internal dependency of Next.js, not ARTÉVO code | Removed direct `sharp`; browser-side WebP compression replaces it; `package.json` now explicitly sets `allowScripts.sharp: false` |
| `allow-scripts … esbuild / unrs-resolver` | Came from `drizzle-kit` and ESLint build-only tooling | Removed unused `drizzle-kit`, `eslint`, and `eslint-config-next` dependencies from the deployment graph |
| `@/components/... Module not found` | Turbopack used an incorrect repo subdirectory root | Fixed by pinning `turbopack.root` in `next.config.ts`; verified with a clean subdirectory build |

The only package that can still appear in a package manager report is
Next.js’s internal optional `sharp` dependency. It is **explicitly denied**
through `allowScripts.sharp: false`, is not used by ARTÉVO, and will not run.
Do not add `dangerously-allow-all-scripts` or globally approve scripts.

## If Vercel says Ready but the website preview says “This page couldn’t load”

That means the build completed, but a runtime request crashed. The most common
cause is a missing, local-only, or unreachable `DATABASE_URL`. This codebase now
handles that professionally:

- Public pages render fallback ARTÉVO catalog content instead of crashing.
- `/admin` opens with a safe dashboard shell and fallback sample data.
- `/api/health` returns a live status message even before the database is connected.
- Once a valid managed PostgreSQL URL is added, the app creates its tables and syncs live data automatically.

Also remove any accidental uploaded screenshots from `public/uploads/` before
pushing. The repository keeps only `public/uploads/.gitkeep`; live uploads are
stored by the app flow, not committed screenshots.

---

## Required Vercel settings

In **Vercel → Project → Settings → General**:

| Setting | Value |
| --- | --- |
| Framework Preset | `Next.js` |
| Root Directory | The folder that contains this project’s `package.json` |
| Node.js Version | `22.x` — pinned to avoid automatic future major Node upgrades |
| Build Command | Leave unset — Vercel automatically runs `npm run build` |
| Install Command | Leave unset — Vercel automatically runs `npm install` |

The final `vercel.json` is deliberately minimal:

```json
{ "$schema": "https://openapi.vercel.sh/vercel.json", "framework": "nextjs" }
```

Do not add `memory`, `build.env`, `outputDirectory`, a custom `installCommand`,
or legacy `@secret-name` references.

The project intentionally uses `"engines": { "node": "22.x" }` instead of an
open-ended range like `>=20.19.0`. This prevents Vercel from automatically
moving the deployment to a future Node major version before the app is tested
against it.

---

## Environment variables

In **Vercel → Project → Settings → Environment Variables**, add these for both
**Production** and **Preview**:

| Name | Value | Required |
| --- | --- | --- |
| `DATABASE_URL` | Your managed PostgreSQL URL (Neon, Supabase, Vercel Postgres, Railway, etc.) | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL, for example `https://artevo.vercel.app` | Recommended |
| `ARTEVO_SKIP_SEED` | `1` only if you want a blank catalog on first launch | Optional |

### Never use the local development database URL on Vercel

This will not work in Vercel:

```text
postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Use your cloud database provider’s TLS-enabled connection string. ARTÉVO
automatically enables SSL for a non-local production URL.

---

## Fresh PostgreSQL deployment

No Vercel build migration command is needed.

On the first runtime request, ARTÉVO safely runs `CREATE TABLE IF NOT EXISTS`
for its complete PostgreSQL schema, then seeds sample catalog content only when
the catalog is empty. The operation is idempotent and concurrency-safe at the
application level.

- To keep the provided demo artwork: do not set `ARTEVO_SKIP_SEED`.
- To launch with no demo content: set `ARTEVO_SKIP_SEED=1`, then add artwork in
  `/admin`.

---

## Image uploads on Vercel

The upload flow is Vercel safe and no longer relies on server-native image
libraries:

1. Admin selects JPG, PNG, or WebP from Artwork Manager.
2. The browser strips metadata, limits the long edge to 2,400 px, and converts
   the image to WebP at 82% quality before it is uploaded.
3. On Vercel, the compressed image is returned as a data URI and stored with
   the artwork in PostgreSQL. It survives serverless restarts and redeploys.
4. In local development, it is also saved under `public/uploads/`.

The compressed upload guardrail is 5 MB.

---

## GitHub upload checklist

If GitHub shows **“Something went wrong, and we can’t process that file”**, the problem is usually one of these:

- Dragging generated folders like `.next/` or `node_modules/` into GitHub.
- Uploading private/local files like `.env`.
- Uploading runtime artwork/screenshot files from `public/uploads/`.
- Uploading too many nested files through the GitHub web uploader at once.

This project has been reduced and cleaned for GitHub/Vercel. The deployable source set is kept **under 80 files** when generated/private files are excluded.

### Do not upload these

```text
node_modules/
.next/
.vercel/
.env
next-env.d.ts
tsconfig.tsbuildinfo
public/uploads/*   except public/uploads/.gitkeep
```

Use Git commit/push whenever possible instead of GitHub drag-and-drop. If using the web uploader, upload the project folder contents in small groups and confirm the files above are not selected.

## Deploy checklist

1. Commit and push **all** updated source files, especially:
   - `next.config.ts`
   - `vercel.json`
   - `package.json` and `package-lock.json`
   - `.nvmrc`
   - `src/db/bootstrap.ts`
   - `src/app/api/upload/route.ts`
2. In Vercel, confirm the project **Root Directory** points to the folder with
   `package.json`.
3. Add `DATABASE_URL`.
4. Go to **Deployments → Redeploy** and enable **Redeploy without Build Cache**
   once. This clears the old `vercel.json` memory warning from cache.
5. Verify these endpoints:
   - `/api/health` → `{ "ok": true }`
   - `/admin` → dashboard loads
   - `/artwork` → public catalog loads
6. Upload a small JPG/PNG/WebP in `/admin → Artwork Manager` and save it.

---

## Business reference

**ARTÉVO Nigeria Limited**  
Ibadan, Oyo State, Nigeria · Established 2026  
Email: mobolajiolakunle8@gmail.com  
WhatsApp: 0903 019 2034  
Currency: Nigerian Naira (₦ / NGN)
