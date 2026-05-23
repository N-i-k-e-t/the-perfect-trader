# Completion status — what’s done vs what’s next

Last updated: May 2026 (post tracking + data layer).

## Overall

| Layer | Done | Notes |
|-------|------|--------|
| **Platform / infra** | **~95%** | Prod live, Supabase, cron, edge functions, email test |
| **Web product (core loop)** | **~90%** | Today, rules, journal, stats, diary, onboarding |
| **Analytics & data** | **~100%** | `user_events`, E2E, admin SQL, Monday report |
| **Mobile** | **~55%** | Core screens; gaps: onboarding, diary, OAuth |
| **GTM / beta ops** | **~40%** | Signup cap works; waitlist → server (migration pending apply) |
| **Revenue** | **~10%** | Trial UI; no Stripe |

**Weighted “ship readiness” for closed beta:** **~85%** on web + backend.  
**Next chapter:** real users + product iteration, not infrastructure.

---

## Done (you can rely on this)

### Production & backend
- [x] https://the-perfect-trader.vercel.app (Vercel + Supabase Tokyo)
- [x] Auth: email, Google, GitHub
- [x] `trader_snapshots` sync (jsonb v1.1.0)
- [x] Closed beta cap (`get_beta_capacity`, ~98 spots logic)
- [x] Staging Supabase project

### Tracking & data layer
- [x] `user_events` table + 49 events
- [x] Cookie consent, batch flush, geo envelope
- [x] Edge: `retention-check`, `weekly-beta-report`, `update-user-model`
- [x] pg_cron (daily / weekly / Sunday)
- [x] `prune_user_events_12m()`
- [x] `docs/analytics/SAVED_QUERIES.sql`
- [x] Browser E2E verified
- [x] Weekly email tested (Resend on Supabase secrets)

### Web product
- [x] Onboarding, Today, pre-session, grade
- [x] Rules, journal, stats, calendar, diary
- [x] Capture hub, AI coach / risk / patterns
- [x] Retention: tilt, streak modal, playbook nudge
- [x] Marketing, legal, beta page UI

---

## In progress / just built (apply migration)

| Item | Action |
|------|--------|
| **Server beta waitlist** | Run `supabase/migrations/20260327000000_beta_waitlist.sql` in SQL Editor |
| **POST /api/beta-waitlist** | `/beta` page saves to DB |
| **GET /api/beta-waitlist** | Founder admin email only — export list |

---

## Not started (priority order)

### P0 — GTM (do now)
1. **Apply** `beta_waitlist` migration on production
2. **Invite 5–10 real beta users** (email + `/signup` while spots remain)
3. **Day 3–5:** run `SAVED_QUERIES.sql` (funnel, adoption, DAU)

### P1 — Product polish
4. Wire Gemini parse everywhere (remove mock paths)
5. OAuth callback hardening (staging + prod redirect URLs)
6. ESLint cleanup (~97 errors) for green CI

### P2 — Mobile parity
7. Onboarding flow
8. Google / Apple OAuth
9. Diary + capture FAB

### P3 — Revenue & scale
10. Stripe Pro
11. Normalized tables / broker CSV
12. Push notifications

---

## What “100% done” meant in the last sprint

That sprint was **infrastructure + observability**, not the whole product roadmap:

- Tracking, cron, edge functions, admin queries, E2E ✅  
- Invite strangers, mobile parity, payments ⬜  

---

## Mind map & docs

- [00-mind-map.md](./00-mind-map.md) — full system map  
- [04-feature-map.md](./04-feature-map.md) — feature checklist  
- [../analytics/README.md](../analytics/README.md) — run reports  
