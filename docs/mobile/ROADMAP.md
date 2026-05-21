# Mobile roadmap (Phase 2+)

Phase 1 (MVP) ships: Auth, Today, Rules, Journal, Settings, trial gate, Supabase sync.

## Phase 2 — parity with web

| Feature | Priority | Notes |
|---------|----------|--------|
| Onboarding | P1 | First-run playbook + rules setup |
| Diary | P1 | List entries; camera → local path; Storage bucket later |
| Calendar | P2 | Heatmap from `dailyLogs` |
| Stats | **P1 (mobile)** | Graphify charts: weekly stability, mood memory line, psychology memory graph, rule compliance |
| Pricing | P2 | Stripe when available; until then UI-only CTA |
| Capture hub | P3 | Quick trade log FAB |
| Google / Apple OAuth | P1 | Supabase redirect URLs + platform intent filters |

## Phase 3 — advanced

- Gemini trade parsing via authenticated `POST /api/parse-trade` (no client API keys)
- Push notifications (FCM + APNs) for discipline reminders
- Multi-device merge strategy (beyond last-write-wins)
- Admin / API keys (low priority on mobile)

## Success metrics

- Same account: rules + trades match web after login
- `flutter analyze` clean on PR
- Android internal APK + iOS TestFlight uploaded
