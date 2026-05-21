# Data domains — app vs work vs thoughts vs history

**Policy (locked):** The complete **app** (identity, settings, entitlements) and **internal trader data** (execution, logs, psychology) are **logically separate**. They may share one Supabase row in v1, but must never be mixed in product copy, exports, or a future DB split.

## Four domains

| Domain | Purpose | What gets saved | Not mixed with |
|--------|---------|-----------------|----------------|
| **app** | Product account & shell | User profile, trial/Pro, UI prefs, auth identity | Trade P&L, diary scans |
| **work** | Trading execution & compliance | Rules, trades, session locks, `dailyLogs`, `analytics` | Free-form diary “thoughts” |
| **thoughts** | Reflection & psychology | Diary scans, observations, pre-session notes, `userModel`, coach/insights | Raw trade ledger (except links) |
| **history** | Immutable audit trail | Day events, sync log, grade changes over time (planned) | Editable “current” state |

## Current keys → domain (v1.1.0)

Stored in `trader_snapshots.data` (and `localStorage` `perfect_trader_data`):

### `app`

| Key | Examples |
|-----|----------|
| `user` | email, name, `isPro`, `trialStartDate` |
| `sidebarCollapsed`, `labMode` | UI state (optional to exclude from cloud later) |

### `work`

| Key | Examples |
|-----|----------|
| `rules` | Active rule set |
| `trades` | Journal trades, P&L, violations |
| `session` | `rulesLocked`, `tradesTaken`, `preSessionComplete`, baseline mood *for the session gate* |
| `dailyLogs` | Per-day discipline grades |
| `analytics` | Aggregated stats |
| `playbooks`, `marketEvents` | Setup / calendar context |

### `thoughts`

| Key | Examples |
|-----|----------|
| `diaryEntries` | Scanned pages, digitized journal |
| `observations` | Free-form notes |
| `userModel` | AI persona, weaknesses, coaching memory |
| `insights`, `coachMessages`, `riskAlerts` | Generated psychology layer |
| `session.notes` | Pre/post reflection text (not compliance counters) |

### `history` (v1.2+)

Not a separate store yet. Planned: append-only `history[]` with `{ at, type, domain, payload }` for audits and “what changed when” without overwriting thoughts or work.

## Storage today vs tomorrow

| Phase | Storage | Domains |
|-------|---------|---------|
| **v1 (live now)** | One jsonb row per user | Same keys, documented grouping above |
| **v1.2** | Optional nested shape: `data: { app, work, thoughts, history }` | Migration from flat keys |
| **v2** | Tables: `profiles`, `trades`, `psychology_entries`, `event_log` | RLS per table; mobile + web share contract |

## Sync rules

1. **Work** and **thoughts** can debounce separately in v1.2 (two timers) — today one ~1.2s upsert for all domains.
2. **Exports:** Settings should offer “export work only” vs “export thoughts only” (UI TBD).
3. **Delete account:** Wipe all four domains for `user_id`; no orphan psychology without trades.
4. **Privacy copy:** Say cloud sync stores *your* data in *your* Supabase row; domains are separated in the product model.

## Related docs

- [DATA_CONTRACT.md](../mobile/DATA_CONTRACT.md) — wire format  
- [DATA_MODEL_PLAN.md](../mobile/DATA_MODEL_PLAN.md) — normalized tables later  
- [DEVOPS_PIPELINE.md](./DEVOPS_PIPELINE.md) — deploy
