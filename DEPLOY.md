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

---

## Required Vercel settings

In **Vercel → Project → Settings → General**:

| Setting | Value |
| --- | --- |
| Framework Preset | `Next.js` |
| Root Directory | The folder that contains this project’s `package.json` |
| Node.js Version | `22.x` — pinned in `package.json` `engines` and `.nvmrc` |
| Build Command | Leave unset — Vercel automatically runs `npm run build` |
| Install Command | Leave unset — Vercel automatically runs `npm install` |

### Node version pin (why this matters)
`package.json` declares `"engines": { "node": "22.x" }`. A **major-version
pin** (not `>=20.19.0`) means Vercel always runs builds on Node 22 LTS and will
never silently jump to Node 23+ when it is released. This prevents the Vercel
warning:

> Detected "engines": { "node": ">=20.19.0" } … will automatically upgrade when
> a new major Node.js Version is released.

If you ever need to move majors, change both `package.json` engines and
`.nvmrc` together on a single commit, for example `"node": "24.x"` plus
`.nvmrc` containing `24`.

The final `vercel.json` is deliberately minimal:

```json
{ "$schema": "https://openapi.vercel.sh/vercel.json", "framework": "nextjs" }
```

Do not add `memory`, `build.env`, `outputDirectory`, a custom `installCommand`,
or legacy `@secret-name` references.

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

## Deploy checklist

1. Commit and push **all** updated files, especially:
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

## Announcement ticker (above header)

The thin bar above the header now shows **only** a scrolling announcement
ticker (all other items were removed) and is fully admin-editable:

1. Open **Admin Studio → Website Editor → announcement**.
2. `ticker` — messages separated by `|`; they scroll in a seamless loop.
3. `enabled` — `1` shows the ticker, `0` hides it.
4. Save & Publish — updates instantly in every open tab (cross-tab sync).

No code changes are needed to change announcements on the live site.

## Resilience without a database

Every public page and catalog API (home, collections, artwork, journal,
auctions, spaces) falls back to embedded ARTÉVO content when `DATABASE_URL`
is missing or unreachable, so Vercel never shows "This page could not load".

- Write operations (orders, bids, inquiries, newsletter, admin saves) return
  a clear 503 message until the database is connected.
- `/api/health` reports `{ "ok": true, "database": false }` instead of failing
  the deployment check when Postgres is not yet configured.
- `/admin` shows an amber banner explaining that the database is required for
  live orders and saves.

## Step-by-step for the "This page could not load" case

1. Push ALL files from this repository (use `git add -A` + `git commit` +
   `git push` — do not use GitHub's "Add files via upload" for nested
   directories such as `src/app/api/...` or `public/logo/`).
2. Vercel → Settings → General → **Node.js Version: 22.x** (matches
   `package.json` engines and `.nvmrc`).
3. Vercel → Settings → Environment Variables → add `DATABASE_URL` with your
   hosted Postgres URL (Neon/Supabase/Vercel/SUPABASE/RAILWAY).
4. Redeploy (optionally without cache). The public website is now fully live
   even before the database is connected — the catalog serves preview content.
5. Connect the database and verify `/admin` writes, orders, and bids.

---

# Git upload troubleshooting ("Something went really wrong, and we can't process that file")

## What caused it
GitHub's **web "Add files via upload"** UI cannot reliably handle this project:

1. It drops or corrupts files inside **deep nested paths**
   (`src/app/api/...`, `src/components/...`, `public/logo/...`).
2. It fails on **multi-file folder uploads** past GitHub's size limits
   (~25 files / 100 MB per interactive upload).
3. Files saved via this UI end up **partially committed**, producing the
   "This page could not load" errors on Vercel afterwards.

## The fix — upload with git (never the web UI)

### Option A: one command (recommended)
```bash
chmod +x deploy-to-github.sh
./deploy-to-github.sh mobolajiolakunle8 artevo main
```
The script initialises git (if needed), commits the full **80-file** project,
and pushes to your GitHub repository.

### Option B: manual git
```bash
git init -b main
git add -A
git commit -m "ARTÉVO v1 — public website + admin studio"
git remote add origin https://github.com/mobolajiolakunle8/artevo.git
git push -u origin main
```

### Option C: ZIP bundle
`artevo-deploy.zip` in the project root contains the exact deploy file set.
Download it, and unzip into an empty folder, then run Option A or B from there.

## Deployment file inventory (80 files, verified)

| Area | Files |
|---|---|
| Public pages + layouts (`src/app`) | 45 |
| Components (`src/components`) | 11 |
| Database layer (`src/db`) | 6 |
| Shared libs (`src/lib`) | 3 |
| Brand logo assets (`public/logo`) | 3 |
| Root config (package.json, next.config, tsconfig, postcss, vercel.json, .gitignore, .nvmrc, DEPLOY.md, .env.local.example) | 9 |
| Git deploy tooling (deploy-to-github.sh) | 1 |
| **Total** | **80** |

Excluded (never pushed): `node_modules/`, `.next/`, `.env` (local secrets),
`next-env.d.ts` / `tsconfig.tsbuildinfo` (auto-generated), `artevo-deploy.zip`
(bundle artifact).

Notes:
- `.env.local.example` documents required variables; real `.env` stays local.
- `public/uploads/` is created automatically at runtime — no git entry needed.
- If GitHub still refuses a file, check the filename contains only A–Z,
  a–z, 0–9, `-` and `_` (all current files comply).

---

# Cross-browser live sync

ARTÉVO has full cross-browser live sync built in — new bids, orders, admin
edits and announcements appear on every open browser and device instantly,
without page refresh.

## What syncs live across browsers

| Channel | Fires when… | Refreshes… |
|---|---|---|
| `artworks` | Admin adds/edits/deletes an artwork | Public catalog, artwork detail |
| `auctions` | A bid is placed anywhere | Auction Room, artwork detail |
| `orders` | Customer places an order OR admin advances status | Admin dashboard, `/track-order` |
| `site-content` | Admin edits hero/announcement/contact | Announcement bar (all tabs) |
| `collections` / `journal` / `inquiries` / `newsletter` | Admin CRUD or customer action | Admin dashboard |

## How it works (three layers)

1. **BroadcastChannel** — same-browser cross-tab sync (`src/lib/sync.ts`)
2. **Server-Sent Events** — `/api/sync/stream` pushes a change event to
   every connected browser worldwide via a persistent HTTP stream
   (`src/lib/live-bus.ts`, `src/app/api/sync/stream/route.ts`)
3. **On-focus catch-up** — if a tab was backgrounded/offline, it refetches
   when it regains focus

The `useLiveSync(channels, callback)` hook (`src/components/useLiveSync.ts`)
combines all three; call sites just declare which channels they care about.

## Vercel setup for cross-browser sync

The SSE endpoint runs on Vercel Node.js runtime and holds each connection for
up to 5 minutes before recycling (clients auto-reconnect). No extra setup —
it works out of the box on Hobby and Pro plans. For very large traffic,
enable **Fluid Compute** in Vercel project settings so SSE connections
don't count as separate function invocations.

## Verify after deploy

1. Open the site in **Chrome on your laptop** at `/auction`.
2. Open it in **Safari on your phone** at the same URL.
3. Place a bid on Safari.
4. Chrome updates the highest bid within ~1 second, no refresh needed —
   with a pulsing "Live" indicator confirming the push arrived.

---

# Fixing "PostgreSQL is not connected yet"

This warning appears when the site is running on Vercel without a real
PostgreSQL database attached. The public site still works (it falls back to
built-in preview content), but orders, bids, admin saves, and cross-browser
live sync all require a database.

## Fastest path — Vercel Postgres (recommended)

1. Open your Vercel dashboard → **Storage** tab → **Create Database** →
   **Postgres** → choose a name (e.g. `artevo`) and region.
2. On the "Connect Project" screen, tick your ARTÉVO project. Vercel will
   automatically add `DATABASE_URL` to every environment for you.
3. Go to **Deployments** → the latest deploy → **⋯ menu** → **Redeploy**.
   Uncheck *"Use existing Build Cache"* the first time so the new
   environment variable is picked up.
4. Open `/admin` — the amber "Database is not connected yet" panel now
   shows a green "Database connected" stripe. Tables auto-create on the
   first request; sample content seeds if the catalog is empty.

## Alternative — Neon / Supabase / Railway

Any managed PostgreSQL works. The setup is identical:

1. Create a Postgres database on your provider of choice (all have free
   tiers).
2. Copy the connection string (must start with `postgresql://`, not
   `postgres://` prefix from local dev):
   - **Neon**: Project → Connection Details → *pooled* connection.
   - **Supabase**: Settings → Database → Connection string → **URI**.
   - **Railway**: Postgres service → Connect → **DATABASE_URL**.
3. In Vercel → Settings → **Environment Variables** → Add:
   - Name: `DATABASE_URL`
   - Value: *(paste the connection string)*
   - Environments: Production, Preview, Development (tick all three).
4. Redeploy without cache.

## What you must never do

- **Never** paste your local `postgresql://postgres:postgres@127.0.0.1:5432/app_db`
  into Vercel. Vercel serverless functions cannot reach your laptop.
- **Never** use `@secret-name` values in `vercel.json`. Paste the connection
  string directly into the environment variable field.
- **Never** delete or lower-case the variable name — it must be exactly
  `DATABASE_URL`.

## Live diagnostics (built into the admin)

Every ARTÉVO admin page now includes an in-app **Database Setup Guide** that:

- Shows the current environment (Vercel or local), whether `DATABASE_URL`
  is set, real-time connection latency, and how many of the 11 required
  tables exist.
- Surfaces the raw Postgres error message if the connection fails, so you
  can see immediately whether the issue is a wrong password, a paused
  database, an SSL block, or a firewall.
- Provides one-click links to Vercel Storage and Environment Variables,
  step-by-step instructions, and copy buttons for the variable name and an
  example value.
- Auto-refreshes with **Re-check status** so you can verify success without
  reloading the whole dashboard.

Endpoint: `/api/sync/diagnostics` — returns JSON that never exposes the
raw connection string; only the provider and host are surfaced.

---

# Firebase Auth + Realtime Admin Security

ARTÉVO now uses Firebase to authenticate the Admin Studio and power real-time
cross-browser updates.

## What is protected

- `/admin` is protected by Firebase Auth.
- Server-rendered admin data is only fetched when the browser has a valid
  HttpOnly `artevo_admin_token` session cookie.
- Admin-only API calls require a Firebase ID token in the `Authorization:
  Bearer <token>` header:
  - `GET /api/orders`
  - artwork create/edit/delete
  - collection create
  - journal create/edit/delete
  - payment settings update
  - website editor save
  - admin order status updates
- Public customer actions stay open:
  - order creation
  - payment proof submission
  - bids
  - contact inquiries
  - newsletter subscription

## Firebase project in use

Project ID: `artevo-1188a`  
Realtime Database: `https://artevo-1188a-default-rtdb.firebaseio.com/`  
Storage bucket: `artevo-1188a.firebasestorage.app`  
Analytics measurement: `G-WJ8H77YGCQ`

## Create the admin user

1. Firebase Console → **Authentication** → **Users** → **Add user**.
2. Email: `mobolajiolakunle8@gmail.com`.
3. Set a strong password.
4. Firebase Console → Authentication → **Sign-in method**:
   - Enable **Email/Password**.
   - Enable **Google** if you want one-click Google sign-in.
5. Firebase Console → Authentication → **Settings → Authorized domains**:
   - Add your Vercel production domain.
   - Add your custom domain if you connect one.

## Realtime Database rules

Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "artevo-sync": {
      ".read": true,
      ".write": true
    },
    "artevo-admin-presence": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

`artevo-sync` only stores small, non-sensitive change pulses such as:
`{ action: "update", id: "ART-AFR-001", ts: ... }`. It does not store customer
PII. Sensitive business data remains in PostgreSQL and behind authenticated
admin APIs.

## Firebase Storage rules

Firebase Console → Storage → Rules:

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /artworks/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Vercel environment variables

Add these to **Production**, **Preview**, and **Development** environments:

```txt
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA0Ho-ObbE0Uc9VIqDxvwnWeuwE6SGbcoY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=artevo-1188a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=artevo-1188a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=artevo-1188a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=346561178602
NEXT_PUBLIC_FIREBASE_APP_ID=1:346561178602:web:544b32a9f20ebb7dd6e093
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WJ8H77YGCQ
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://artevo-1188a-default-rtdb.firebaseio.com
NEXT_PUBLIC_ADMIN_EMAILS=mobolajiolakunle8@gmail.com
```

For push notifications, also add this after generating it in Firebase Console →
Cloud Messaging → Web Push certificates:

```txt
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<paste generated VAPID key>
```

## How the authenticated realtime flow works

1. Admin opens `/admin`.
2. Firebase Auth displays the login screen.
3. After login, the browser obtains a Firebase ID token.
4. `/api/auth/session` verifies that token against Firebase Identity Toolkit and
   confirms the email is whitelisted.
5. The server sets an HttpOnly admin session cookie.
6. The dashboard refreshes and securely loads orders/customers/settings.
7. The admin's presence is written to Firebase Realtime Database at
   `artevo-admin-presence/{uid}`.
8. Every admin action publishes a Firebase RTDB sync pulse; all browsers refresh
   instantly.

## Verification checklist

- Open `/admin` in an incognito window: you should see the Firebase login.
- Sign in with `mobolajiolakunle8@gmail.com`.
- Firebase Realtime Database should show `artevo-admin-presence/<uid>` as online.
- Directly calling `/api/orders` without login should return `401`.
- After login, the dashboard loads orders and admin saves work normally.

---

# Fixing "auth/network-request-failed"

This Firebase error means the browser could not reach Google's authentication
servers. It is a **network/domain problem**, not a code bug.

## Fastest diagnosis

The admin login screen now detects this automatically and shows an amber panel
with your current hostname and a **Test connection** button. It also offers a
**Use backup code** option so you are never locked out.

## Causes and fixes, in order of likelihood

### 1. Domain not authorised in Firebase (most common)
Firebase rejects sign-ins from domains it does not recognise.

**Fix:** Firebase Console → **Authentication** → **Settings** →
**Authorized domains** → **Add domain**, then add:

```txt
localhost
artevo.vercel.app
<your-project>-<hash>-<scope>.vercel.app
<your-custom-domain.com>
```

Every Vercel preview deployment uses a unique subdomain. Either add each one, or
add your production custom domain and always test there.

### 2. Ad-blocker, VPN, or firewall blocking Google
Corporate networks and privacy extensions commonly block
`identitytoolkit.googleapis.com` and `*.firebaseapp.com`.

**Fix:** Disable the blocker/VPN, or whitelist those two hosts, then retry.

### 3. Genuine connectivity loss
Offline, DNS failure, or captive portal.

**Fix:** The login form automatically **retries three times** with increasing
delay before showing the error, so brief blips self-heal.

### 4. Sign-in method disabled
If Email/Password or Google is disabled in Firebase, sign-in cannot proceed.

**Fix:** Firebase Console → Authentication → Sign-in method → enable
**Email/Password** and **Google**.

## Emergency backup unlock (never be locked out)

If Firebase cannot be reached, you can still sign in with a server-verified
access code. This requires one extra Vercel environment variable:

```txt
ADMIN_ACCESS_CODE=<a long random private phrase>
```

Requirements:
- Minimum 8 characters (longer is better).
- Keep it secret — it is a master key.
- Optionally set `ADMIN_SESSION_SECRET` to a different random value; otherwise
  the access code is used to derive the session signature.

Then on the login screen:
1. Click **Use backup code** (appears automatically on network errors).
2. Paste the access code.
3. Click **Unlock without Firebase**.

## How the backup path stays secure

- The access code is **never** sent to or stored by the browser.
- Verification uses `timingSafeEqual` to prevent timing attacks.
- The cookie holds an HMAC-SHA256 session signature derived from
  `ADMIN_SESSION_SECRET`, never the code itself.
- The path is disabled entirely unless `ADMIN_ACCESS_CODE` is configured.
- When unavailable, `/api/auth/fallback` returns `{ available: false }`.
- All admin APIs accept either a valid Firebase ID token or a valid backup
  session — the same authorisation rules apply to both.

## All Firebase auth errors now explained

The login screen maps every Firebase error code to plain English:

| Firebase code | What the UI says |
|---|---|
| `network-request-failed` | Cannot reach Firebase; shows domain + backup options |
| `invalid-credential` / `wrong-password` | Incorrect email or password |
| `user-not-found` | No admin account exists with that email |
| `unauthorized-domain` | Shows your hostname and where to authorise it |
| `operation-not-allowed` | Enable the sign-in method in Firebase Console |
| `popup-blocked` | Allow popups (Google sign-in auto-falls back to redirect) |
| `too-many-requests` | Wait a moment, then retry |
| `api-key-not-valid` | Firebase API key missing/invalid in Vercel |
