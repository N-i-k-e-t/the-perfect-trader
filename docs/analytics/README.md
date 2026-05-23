# Analytics & data activation

After tracking is live (`user_events` rows in Supabase), use this layer to **see**, **learn**, and **act** on data.

## Phase A — Production verification

```powershell
node scripts/check-user-events.mjs
npm run health:check
```

Confirm rows appear in [Supabase → user_events](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/editor).

## Phase B — Saved SQL queries

Copy queries from [`SAVED_QUERIES.sql`](./SAVED_QUERIES.sql) into Supabase SQL Editor. Save each as `pt_<name>`.

## Phase C–E — Edge Functions

Deploy (requires [Supabase CLI](https://supabase.com/docs/guides/cli) login + project link):

```powershell
# Secrets (Dashboard → Edge Functions → Secrets or CLI)
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
# RESEND_API_KEY, RESEND_FROM, BETA_REPORT_EMAIL — for email triggers

npx supabase functions deploy update-user-model --project-ref firqlsjixojnrofycwbs
npx supabase functions deploy retention-check --project-ref firqlsjixojnrofycwbs
npx supabase functions deploy weekly-beta-report --project-ref firqlsjixojnrofycwbs
```

| Function | Purpose |
|----------|---------|
| `update-user-model` | Weekly: tune `userModel` from `user_events` → `trader_snapshots` |
| `retention-check` | Daily: find inactive users (no pre-plan 3d); optional Resend email |
| `weekly-beta-report` | Monday: aggregate metrics email to `BETA_REPORT_EMAIL` |

Optional pg_cron schedules: see `docs/supabase/RUN_CRON_AND_RETENTION.sql` or `npm run cron:generate` → `docs/supabase/APPLY_CRON_NOW.sql`.

### Resend + weekly report email

**Edge Functions read secrets from Supabase** (not Vercel):

```powershell
npx supabase secrets set RESEND_API_KEY="re_..." BETA_REPORT_EMAIL="you@email.com" --project-ref firqlsjixojnrofycwbs
# Optional verified sender:
npx supabase secrets set RESEND_FROM="Perfect Trader <onboarding@resend.dev>" --project-ref firqlsjixojnrofycwbs
```

Test immediately:

```powershell
node scripts/test-weekly-report.mjs
# Expect: "email_sent": true
```

Manual trigger in SQL Editor (use **service_role** key, not anon):

```sql
SELECT net.http_post(
  url := 'https://firqlsjixojnrofycwbs.supabase.co/functions/v1/weekly-beta-report',
  headers := jsonb_build_object(
    'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
    'Content-Type', 'application/json'
  ),
  body := '{}'::jsonb
);
```

Vercel env vars for `RESEND_*` are only needed if the **Next.js app** sends mail (not required for cron/edge).

## Phase D — Client retention (built-in)

| Trigger | Where |
|---------|--------|
| Tilt warning (2+ rule violations) | `context.tsx` → `toggleRuleViolation` |
| Streak milestone modal (3,7,14,30,50,100) | `RetentionEffects.tsx` |
| Playbook nudge (day 7+, 0 playbooks) | `/rules` banner |
| Coach tone auto-tune (5 dismisses / 7d) | `InsightCards.tsx` → `coach-tune.ts` |

## Related

- [`../DATA_INVENTORY.md`](../DATA_INVENTORY.md) — privacy / retention policy
- [`../../data-layer-master.md`](../../data-layer-master.md) — full strategic plan
