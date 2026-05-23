# Connect Supabase — firqlsjixojnrofycwbs

## 1. Environment (already wired in this repo)

| App | File | Keys |
|-----|------|------|
| Next.js web | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Flutter mobile | `mobile/.env` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |

Use the **anon JWT** (`eyJhbGci...` role `anon`) in client apps — not the service role.

The **publishable** key (`sb_publishable_...`) is for newer Supabase client SDKs; this repo uses the anon JWT for `supabase-js` and `supabase_flutter`.

**Service role** → server/scripts only (`.env.local`, never commit, never ship in mobile).

## 2. Apply database schema

### Option A — SQL Editor (no CLI login)

1. Open [SQL Editor](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/sql/new).
2. Paste contents of [`APPLY_SCHEMA.sql`](./APPLY_SCHEMA.sql).
3. Click **Run**.

### Option B — Supabase CLI (recommended for ongoing migrations)

**Full flow (login + link + push):**

```powershell
cd c:\Users\niket\Downloads\Rulesyci-main
npm run db:cloud
```

**Or step by step:**

```powershell
npx supabase login
# Create token: https://supabase.com/dashboard/account/tokens → paste with:
# npx supabase login --token sbp_xxxx

npx supabase link --project-ref firqlsjixojnrofycwbs
npm run db:push
```

**Push with DB password only (no access token):**

```powershell
$env:SUPABASE_DB_PASSWORD = "your-database-password"
npm run db:push:url
```

If you see **IPv6 is not supported**, use `npm run db:push:url` (pooler URL) instead of plain `db:push`.

## 3. Auth settings (Dashboard)

1. [Authentication → Providers](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers) — enable **Email**.
2. [URL configuration](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/url-configuration):
   - Site URL: `https://the-perfect-trader.vercel.app` (production) or `http://localhost:3000` (dev)
   - Redirect URLs (add **all**):
     - `https://the-perfect-trader.vercel.app/auth/callback`
     - `https://the-perfect-trader.vercel.app/**`
     - `http://localhost:3000/auth/callback`

## 4. Verify

**Web**

```powershell
npm run dev
```

Sign up at `/login` — data should persist in `trader_snapshots`.

**Mobile**

```powershell
cd mobile
flutter run
```

Sign up — same account should sync rules/trades with web after login.

**Table check**

Dashboard → [Table Editor](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/editor) → `trader_snapshots`.

## Schema summary

| Table | Purpose |
|-------|---------|
| `public.trader_snapshots` | One row per user; `data` jsonb holds rules, trades, session, analytics, userModel (v1.1.0) |

RLS: users can only read/write/delete their own row (`auth.uid() = user_id`).

## Security

If you pasted the **service role** key in chat or committed it, rotate it under **Settings → API** in the dashboard.
