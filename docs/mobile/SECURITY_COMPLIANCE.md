# Security, privacy, and compliance

Trading journals hold **sensitive behavioral and financial performance data**. Treat accordingly.

## Data classification

| Data | Sensitivity | Storage v1 |
|------|-------------|------------|
| Email / auth | PII | Supabase Auth |
| Trade notes, P&L | High | jsonb snapshot |
| Mood / psychology | High | jsonb snapshot |
| Screenshots | High | Not in mobile v1 (future Storage) |
| Broker API keys | Critical | Web UI only; never in mobile v1 |

## Client rules (enforced)

- Only `SUPABASE_ANON_KEY` in mobile `.env`
- Never ship service role or Gemini keys in Flutter
- RLS on all user tables

## RLS (current)

`trader_snapshots`: user can CRUD **own** `user_id` only.

See migration: [`supabase/migrations/20260321000000_trader_snapshots.sql`](../../supabase/migrations/20260321000000_trader_snapshots.sql)

## User rights (target)

| Right | Status |
|-------|--------|
| Export my data | TBD — JSON export from snapshot |
| Delete account | TBD — Auth delete + cascade |
| Privacy policy accurate | Update web copy (cloud sync disclosed) |

## AI features

- All LLM calls **server-side** (web `/api/parse-trade`)
- No user A's data in prompts for user B
- Log redaction in Edge Functions

## Compliance baseline

- Not a registered investment advisor — disclaimer in app and store listing
- GDPR-style: privacy policy, consent, data export/delete path
- App Store "no financial advice" positioning in review notes

## Operational security

- Rotate keys if exposed in chat or public repo
- 2FA on Supabase, Apple, Google developer accounts
- Signing keys in CI secrets only (Codemagic / GitHub)

## Incident response (minimal)

1. Revoke leaked key in Supabase dashboard
2. Force session refresh / password reset if auth affected
3. Status communication if prolonged outage
