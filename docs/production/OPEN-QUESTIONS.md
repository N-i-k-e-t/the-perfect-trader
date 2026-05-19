# Open questions & decisions

Separate document for **doubts, TBDs, and decisions** not yet locked. Resolve items here, then move answers into the numbered production docs.

---

## P0 — Blocks production launch

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| Q1 | OAuth callback missing — ship OAuth? | A) Implement `/auth/callback` B) Disable OAuth buttons | **A** if Google/GitHub shown |
| Q2 | PWA icons missing | A) Add PNGs B) Remove manifest icons | **A** |
| Q3 | Privacy copy says “local only” but Supabase sync exists | A) Update privacy page B) Disable cloud | **A** |
| Q4 | Payment / Pro gate | A) Stripe B) Manual allowlist only | Decide business model |

---

## P1 — Product & UX

| # | Question | Notes |
|---|----------|-------|
| Q5 | Wire `/welcome` after onboarding or delete? | Currently orphan route |
| Q6 | Desktop: enable `Sidebar` at `md:` breakpoint? | Better large-screen UX |
| Q7 | Trade detail: add `/journal/[id]` or list-only? | Links already break |
| Q8 | Trial length 72h — configurable? | Hardcoded in AppShell |
| Q9 | Grade algorithm — document formula? | Compliance on `/today` needs spec sheet |

---

## P1 — AI & agents

| # | Question | Notes |
|---|----------|-------|
| Q10 | Wire Gemini to trade entry or keep mock? | API exists, UI doesn’t call it |
| Q11 | Persist orchestrator output to context/DB? | Stats recalculates only on page |
| Q12 | Wire `learner.ts` and `ruleSuggester.ts`? | Dead code today |
| Q13 | Vision scanner: real OCR vs mock? | Diary scan credibility |
| Q14 | Gemini model version lock? | Currently `gemini-1.5-flash` |

---

## P1 — Data & backend

| # | Question | Notes |
|---|----------|-------|
| Q15 | Stay on jsonb snapshot vs normalize tables? | See [04-BACKEND-DATA-FLOW](./04-BACKEND-DATA-FLOW.md) |
| Q16 | Cloud vs local conflict on multi-device | Last cloud load wins — need merge? |
| Q17 | Broker API keys page — build or hide? | UI exists, no backend |
| Q18 | Image storage for diary | Supabase Storage bucket + RLS |

---

## P2 — Security

| # | Question | Notes |
|---|----------|-------|
| Q19 | Admin routes only client-guarded — add middleware? | `/admin`, `/the-terminal-x` |
| Q20 | Rate limit `/api/parse-trade` where? | Vercel middleware vs Supabase Edge |
| Q21 | Rotate Supabase keys after chat exposure? | If repo public or keys shared |
| Q22 | CSP / security headers policy? | `next.config.ts` |

---

## P2 — Brand & assets

| # | Question | Notes |
|---|----------|-------|
| Q23 | Final logo / wordmark? | Only text “The Perfect Trader” in UI |
| Q24 | Marketing images hosted where? | `/brain/...` paths in onboarding |
| Q25 | Rename GitHub repo `trading-4j1` → `the-perfect-trader`? | Cosmetic |

---

## P2 — Ops

| # | Question | Notes |
|---|----------|-------|
| Q26 | Staging Supabase project separate from prod? | Recommended before heavy traffic |
| Q27 | Error tracking: Sentry project? | Not configured |
| Q28 | Delete old `rulesyci/` folder on disk? | Copy exists at `` |

---

## Decision log (fill as you decide)

| Date | ID | Decision | Owner |
|------|-----|----------|-------|
| | | | |

---

## Deep-dive spin-offs (create when needed)

When a question needs more than a table row, add:

- `docs/production/deep-dives/Q15-normalized-schema.md`
- `docs/production/deep-dives/Q10-gemini-integration.md`

Template: problem → options → recommendation → migration steps.
