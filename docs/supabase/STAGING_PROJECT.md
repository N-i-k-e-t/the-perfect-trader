# Staging Supabase project (separate from production)

Production and staging must **never** share the same Supabase project. Production is **`firqlsjixojnrofycwbs`** (Tokyo). Staging is a **second** project you create in the dashboard.

## 1. Create the staging project

1. [Supabase Dashboard → New project](https://supabase.com/dashboard/new)
2. Name e.g. `perfect-trader-staging`
3. Region: **ap-northeast-1** (match production) or your choice
4. Save the new **project ref** (subdomain), e.g. `abcdefghijklmnop`

## 2. Apply schema (same as production)

**Option A — SQL Editor**

1. Open `https://supabase.com/dashboard/project/<STAGING_REF>/sql/new`
2. Paste all of [`APPLY_SCHEMA.sql`](./APPLY_SCHEMA.sql)
3. Run

**Option B — CLI**

```powershell
# In repo root, after unlocking secrets or setting password:
$env:SUPABASE_PROJECT_REF_STAGING = "<your-staging-ref>"
$env:SUPABASE_DB_PASSWORD = "<staging-db-password>"
npm run db:staging:push
```

## 3. Auth URLs (staging)

**Authentication → URL configuration**

| Field | Staging value |
|--------|----------------|
| Site URL | `https://the-perfect-trader.vercel.app` (or a dedicated staging URL) |
| Redirect URLs | `http://localhost:3000/**`, `https://*.vercel.app/**` |

**Confirm email:** OFF on staging (avoids hourly email rate limits during testing). Already enabled via `mailer_autoconfirm`.

### OAuth — same apps as production (no duplicate Google app)

Staging Supabase is a **different project**, so Supabase sends a **different callback URL** to Google/GitHub. You still use the **same OAuth Client ID + Secret** as production — copied automatically when you run `npm run oauth:sync-staging`.

| Provider | New OAuth app? | What you do |
|----------|----------------|-------------|
| **Google** | **No** | Add a **second redirect URI** on your existing Google OAuth client (Google allows many). |
| **GitHub** | **Optional** | GitHub OAuth Apps allow **only one** callback URL. Same credentials work on staging Supabase, but **GitHub login on staging only works** if that URL is the staging callback — which would break production. **Recommended:** use Google + email on staging; test GitHub on production only. |
| **Email** | N/A | Works on staging with confirm email off. |

**Staging callback (add in Google Cloud only):**

```
https://bwynrefnhykwadmbzogr.supabase.co/auth/v1/callback
```

**Google (one-time, ~1 min):**

1. [Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials) → open your existing Web client (same ID as production).
2. Under **Authorized redirect URIs**, **add** the staging callback above (keep the production callback).
3. Save.

**GitHub:** Production callback stays `https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback`. No change needed unless you create a separate staging-only GitHub OAuth app (see [OAUTH_SETUP.md](./OAUTH_SETUP.md)).

**Re-sync credentials after rotating OAuth secrets:**

```powershell
npm run oauth:sync-staging
```

## 4. Environment files

| File | Use |
|------|-----|
| `.env.local` | Local dev → usually **staging** keys (safe to break) |
| `.env.production.local` | Optional: prod keys for one-off prod tests (never commit) |
| [`.env.staging.example`](../../.env.staging.example) | Template for staging keys |

Copy `.env.staging.example` values into `.env.local` when developing against staging.

## 5. Vercel environment mapping

| Vercel environment | `NEXT_PUBLIC_APP_ENV` | Supabase project |
|--------------------|------------------------|------------------|
| **Production** | `production` | `firqlsjixojnrofycwbs` |
| **Preview** (PR branches) | `staging` | Your staging ref |
| **Development** | `development` | Local or staging |

In **Vercel → Project → Settings → Environment Variables**:

**Production**

- `NEXT_PUBLIC_SUPABASE_URL` = `https://firqlsjixojnrofycwbs.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (production anon key)
- `NEXT_PUBLIC_APP_ENV` = `production`
- `SUPABASE_PROJECT_REF` = `firqlsjixojnrofycwbs`
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` = (production Sentry DSN)

**Preview**

- `NEXT_PUBLIC_SUPABASE_URL` = `https://<STAGING_REF>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (staging anon key)
- `NEXT_PUBLIC_APP_ENV` = `staging`
- `SUPABASE_PROJECT_REF` = `<STAGING_REF>`
- `SENTRY_DSN` = (optional: same Sentry project, tagged `staging` via `environment`)

Do **not** put `SUPABASE_SERVICE_ROLE_KEY` on Preview unless you need admin scripts against staging.

## 6. Verify

```powershell
# Point .env.local at staging, then:
npm run dev
npm run health:check
```

Confirm in Supabase **Table Editor** that test signups only appear in the **staging** project, not production.

## 7. npm scripts

| Command | Action |
|---------|--------|
| `npm run db:staging:push` | Push migrations to staging (`SUPABASE_PROJECT_REF_STAGING` + DB password) |
| `npm run db:staging:link` | Link CLI to staging project |

Production push remains `npm run db:push:url` or `npm run db:cloud` with production ref.
