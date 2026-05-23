# Data inventory — Perfect Trader

## Cloud tables (Supabase)

| Table | Purpose |
|-------|---------|
| `auth.users` | Email, auth provider, `user_metadata` (name, onboarding flags) |
| `trader_snapshots` | One JSON blob per user: rules, trades, session, analytics, `userModel`, diary, etc. (v1.1.0) |
| `beta_capacity` | Beta cap config + `count_offset` for resettable signup counter |
| `user_events` | Behavioral analytics events (see `master-tracking-prompt.md`) |

## Behavioral event tracking (`user_events` table)

Added May 2026. Stores append-only interaction events from web (and future mobile) clients.

### What is collected

- Page views, navigation, feature interactions, trade/rule/session actions
- AI coaching (messages shown/dismissed, parse quality, risk alerts)
- Session engagement (time on page, scroll depth, idle, rage clicks) — **only with analytics cookie consent**
- Device/browser and approximate geo (IP-based via ipapi.co, not GPS)
- Anonymous ID (per device) and session ID (per tab)

Functional/product events (auth, trades, rules, sync) are collected to operate the service per privacy policy.

### What is NOT collected

- Passwords, tokens, or secrets in `event_properties`
- Precise GPS location
- Email addresses in event payloads (only `user_id` UUID when logged in)

### Consent

| Category | Consent required |
|----------|------------------|
| Auth, trades, rules, sync, technical | No (functional) |
| Scroll, idle, rage click, time-on-page | Yes (`analytics` cookie) |

### Retention

- **12 months** active retention, then deleted via `prune_user_events_12m()` (see `supabase/migrations/20260326000000_event_retention_cron.sql`)
- While account exists, events tied to `user_id` remain until pruning or account deletion

### User rights

- Account deletion request removes `trader_snapshots` row and `user_events` where `user_id` matches
- Export: contact support (no self-serve export yet)

### How data improves the product

- **Admin queries:** `docs/analytics/SAVED_QUERIES.sql` (DAU, funnel, AI quality)
- **userModel feedback:** Edge Function `update-user-model` adjusts tilt threshold, coach tone preference, dominant weakness from violation/dismiss patterns
- **Retention:** Client tilt warnings, streak celebrations, playbook nudges; server `retention-check` for re-engagement

## Local-only (device)

| Key | Data |
|-----|------|
| `perfect_trader_data` | App state backup |
| `pt_anonymous_id` | Anonymous analytics ID |
| `pt_session_ctx` | Session ID + sequence (sessionStorage) |
| `pt_geo` | Geo cache (sessionStorage) |
| `pt_event_queue` | Offline analytics queue |
| `pt_coach_dismiss_count` | Coach dismiss log (7d, for auto-tune) |
| `pt_nudge_playbooks_shown` | One-time playbook nudge flag |
| `pt_streak_milestones_celebrated` | Streak modal milestones already shown |
| `perfect_trader_beta_waitlist` | Waitlist emails (not synced to server yet) |
| `perfect_trader_cookie_consent` | `{ analytics: boolean, acceptedAt }` |

## Third parties

- **Supabase** — auth, DB, RLS, Edge Functions
- **Vercel** — hosting logs
- **Sentry** — error monitoring (production)
- **Google / GitHub** — OAuth identity
- **Google Gemini** — optional AI parse (when invoked)
- **ipapi.co** — session geo enrichment
- **Resend** — optional retention/report emails (Edge Functions)

See also: [Privacy Policy](/privacy), `master-tracking-prompt.md`, `data-layer-master.md`, `docs/analytics/README.md`.
