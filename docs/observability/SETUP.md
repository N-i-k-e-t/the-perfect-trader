# One-shot Sentry + staging Supabase setup

Automates what requires API tokens. Without tokens, only partial setup (Vercel `APP_ENV`, deploy) is possible.

## Quick finish (5 min)

1. **Copy template**

   ```powershell
   copy docs\observability\env.observability.example .env.observability
   ```

2. **Fill tokens**

   | Key | Get from |
   |-----|----------|
   | `SUPABASE_ACCESS_TOKEN` | [Supabase Account → Access Tokens](https://supabase.com/dashboard/account/tokens) |
   | `SENTRY_AUTH_TOKEN` | [Sentry → User Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/) (scopes: `project:write`, `org:read`) |
   | `SENTRY_ORG` | Your Sentry org slug (URL: `sentry.io/organizations/<slug>/`) |
   | `SENTRY_TEAM` | Usually same as `SENTRY_ORG` |

3. **Run**

   ```powershell
   npm run setup:observability
   ```

This will:

- Create Supabase project `perfect-trader-staging` (if missing)
- Push migrations to staging
- Create Sentry project `perfect-trader-web` (if missing)
- Set Vercel env vars (Production + Preview)
- Deploy production

Credentials are saved to `.env.observability.local` (gitignored).

## Already done without tokens

- `NEXT_PUBLIC_APP_ENV=production` on Vercel Production
- Sentry SDK deployed to https://the-perfect-trader.vercel.app (inactive until DSN is set)

## Manual alternative

See [SENTRY.md](./SENTRY.md) and [../supabase/STAGING_PROJECT.md](../supabase/STAGING_PROJECT.md).
