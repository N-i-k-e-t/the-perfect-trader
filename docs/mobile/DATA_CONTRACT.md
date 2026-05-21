# Trader snapshot data contract (mobile ↔ web)

## Storage

| Layer | Location |
|-------|----------|
| Cloud | Supabase `trader_snapshots` (`user_id`, `data` jsonb, `version`, `updated_at`) |
| Web local | `localStorage` key `perfect_trader_data` (legacy `rulesci_data`) |
| Mobile local | Hive box `perfect_trader_cache`, key `perfect_trader_data` |

## Version

- Current: **`1.1.0`** (`AppConstants.dataVersion` / web `DATA_VERSION`)
- Mobile and web only hydrate when `version === 1.1.0`

## Data domains (app vs work vs thoughts vs history)

Logical separation is required even while v1 uses one jsonb document. See [../web/DATA_DOMAINS.md](../web/DATA_DOMAINS.md).

| Domain | Keys (summary) |
|--------|----------------|
| **app** | `user`, UI prefs |
| **work** | `rules`, `trades`, `session` (gates), `dailyLogs`, `analytics`, `playbooks`, `marketEvents` |
| **thoughts** | `diaryEntries`, `observations`, `userModel`, `insights`, `coachMessages`, `riskAlerts`, reflective `session.notes` |
| **history** | Planned append-only log (v1.2+) |

## Top-level `data` keys (persisted)

| Key | Type | Domain | Notes |
|-----|------|--------|--------|
| `version` | string | — | `1.1.0` |
| `user` | object | app | `email`, `name`, `isPro`, `trialStartDate`, … |
| `session` | object | work + thoughts | Compliance fields = work; `notes` = thoughts |
| `rules` | array | work | Rule objects |
| `trades` | array | work | Trade objects |
| `dailyLogs` | array | work | Daily discipline logs |
| `analytics` | object | work | Stats blob |
| `userModel` | object | thoughts | Psychology / AI memory |
| `diaryEntries` | array | thoughts | Scanned journals |
| `observations` | array | thoughts | Free-form notes |
| `insights`, `coachMessages`, `riskAlerts` | arrays | thoughts | AI layer |
| `playbooks`, `marketEvents` | arrays | work | Context |

Excluded from cloud payload on web: UI-only fields (`toasts`, `isCheckingAuth`). Mobile mirrors the same persistable subset.

## Conflict strategy (v1)

**Last-write-wins** per `user_id`. Document breaking changes here when bumping `DATA_VERSION`.

## Trial fields

- `user.trialStartDate` — ISO timestamp; 72h trial unless `user.isPro`
- Pro allowlist matches web (`allowedProEmails` in `app_constants.dart`)
