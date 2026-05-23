# Supabase project reference (safe)

Project **`firqlsjixojnrofycwbs`** — Tokyo (`ap-northeast-1`).

| Item | Value |
|------|--------|
| Dashboard | https://supabase.com/dashboard/project/firqlsjixojnrofycwbs |
| API URL | https://firqlsjixojnrofycwbs.supabase.co |
| Project ref | `firqlsjixojnrofycwbs` |

## Secrets & full reference

Keys, service role, JWT JWKS, and connection strings are in:

**`docs/SUPABASE_PROJECT.local.md`** (gitignored — local only)

Environment variables for the app: **`.env.local`** (gitignored)

## Connect & schema

Step-by-step: **[CONNECT.md](./CONNECT.md)**

**Staging (separate project):** **[STAGING_PROJECT.md](./STAGING_PROJECT.md)** — env template: [`docs/env-staging.example`](../env-staging.example)

One-shot SQL (dashboard): **[APPLY_SCHEMA.sql](./APPLY_SCHEMA.sql)**

```bash
supabase login
supabase link --project-ref firqlsjixojnrofycwbs
npm run db:push
```

See [DATABASE.md](../DATABASE.md) for full workflow.
