# Data model plan — snapshot today, normalized tomorrow

## Current state (v1 — shipped)

Single jsonb document per user. **No separate trade/journal tables** in Postgres for app data.

**Pros:** Fast MVP, perfect parity with web, one debounced upsert.  
**Cons:** Harder analytics at SQL level, merge conflicts, large payloads over time.

## Future normalized schema (candidate tables)

Answer these before migrating (see [MASTER_QUESTIONS.md](./MASTER_QUESTIONS.md) §6):

| Table | Purpose |
|-------|---------|
| `users` / profiles | Extends auth.users (display, preferences) |
| `trades` | Core journal rows |
| `trade_legs` | Multi-leg / options |
| `psychology_entries` | Pre/post mood, tilt |
| `journals` / `observations` | Free-form diary |
| `rules` | User rules |
| `playbooks` / `setups` | Strategy templates |
| `tags` | Trade tags |
| `daily_logs` | Aggregated day grades |
| `imports` | CSV/broker import jobs |
| `subscriptions` | Plan entitlements |
| `notifications` | Scheduled reminders |

## Modeling questions

- Separate **positions** vs **executions**?
- Options multi-leg structure in `trade_legs`?
- Screenshots: `storage.objects` + `trade_assets` join table?
- Denormalized `daily_summary` for dashboard speed?
- Materialized views for weekly/monthly reports?

## Migration strategy (when needed)

1. Dual-write: snapshot + normalized tables behind feature flag
2. Backfill job from existing `trader_snapshots.data`
3. Read path switches per feature (Journal first, then Analytics)
4. Deprecate snapshot only when web + mobile both migrated

## RLS principle

Every user-owned row: `auth.uid() = user_id` (or equivalent). Admin tables separate policy.

## Index candidates (post-normalization)

- `trades(user_id, date DESC)`
- `psychology_entries(user_id, created_at DESC)`
- `daily_logs(user_id, date)` unique

## Decision log

| Date | Decision |
|------|----------|
| 2026-03 | Stay on jsonb for v1 mobile launch |
| TBD | Normalize when trade count / analytics queries justify ops cost |
