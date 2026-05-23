# Complete system mind map — The Perfect Trader

> **One sentence:** Measure and improve trading discipline (rules + mood + logs) so P&amp;L follows process—not signals.

---

## 1. Product & users (why it exists)

```mermaid
mindmap
  root((The Perfect Trader))
    Mission
      Psychology first
      Not buy/sell advice
      Discipline A to F grade
      Rule adherence over PnL
    Who
      Day / swing traders
      Index / options India focus
      Beta cap 100 users
      Trial 72h then Pro path
    Core loop
      Pre session mood
      Lock / check rules
      Log trades + journal
      Stats + AI feedback
      Come back tomorrow
    Differentiators
      Tilt awareness
      Coach memory userModel
      Diary scan psychology
      Pattern insights
```

---

## 2. Clients & surfaces (what users touch)

```mermaid
mindmap
  root((Clients))
    Web PWA
      Next.js 16 React 19
      Vercel production
      Routes
        Today pre session
        Journal trades
        Rules playbooks library
        Stats AI coach
        Calendar heatmap
        Diary scanner
        Settings password
        Onboarding 11 steps
        Beta waitlist
      Shell
        Bottom tabs
        Capture FAB hub
        Cookie consent
        Trial gate
    Mobile Flutter
      iOS Android
      Codemagic CI
      Parity
        Today Rules Journal
        Stats Graphify charts
        Settings sync
      Gaps
        Onboarding
        Diary OAuth
        AI coach cards
    Marketing
      Landing pricing
      Legal privacy cookies
      Features about blog
```

---

## 3. Backend & data (where truth lives)

```mermaid
mindmap
  root((Supabase Tokyo))
    Auth
      Email password
      Google OAuth
      GitHub OAuth
      JWT session cookies
      RLS auth.uid
    Postgres
      trader_snapshots
        One jsonb row per user
        rules trades session
        analytics userModel
        diary playbooks
        Debounced upsert 1.2s
      user_events
        49 event types
        Universal envelope
        Geo device session
        12 month retention
      beta_capacity
        Signup cap RPC
    Edge Functions
      update-user-model weekly
      retention-check daily
      weekly-beta-report Monday
    pg_cron pg_net
      retention-daily 03:00 UTC
      weekly-report Mon 03:30
      user-model Sun 04:00
      prune_user_events_12m
    Staging
      bwynrefnhykwadmbzogr
```

---

## 4. Analytics & intelligence (learn from behavior)

```mermaid
mindmap
  root((Intelligence layer))
    Client tracking
      track flush 10s
      pt_event_queue offline
      Consent gate engagement
      api track fallback
      Sentry errors
    Server AI
      Gemini parse-trade API
      Orchestrator
        patternAnalyst
        disciplineCoach
        riskSentinel
      Outputs
        coachMessages
        pattern insights
        riskAlerts tilt
    Retention UX
      Tilt 2+ violations
      Streak milestones
      Playbook nudge day 7
      Coach tone auto tune
    Activation data
      SAVED_QUERIES.sql
      DAU funnel geo sync
      Monday email Resend
```

---

## 5. Infrastructure & ops (how it ships)

```mermaid
mindmap
  root((Ops))
    Deploy
      Vercel Git main
      the-perfect-trader.vercel.app
      Env prod Supabase Sentry
    CI GitHub
      Web build workflow
      Flutter mobile workflow
      Deploy Vercel manual only
    Secrets
      .env.local gitignored
      Supabase Edge secrets
      Resend BETA_REPORT_EMAIL
      scripts vault optional
    Observability
      Sentry production
      user_events admin SQL
      health check scripts
    Repo
      src Next.js
      mobile Flutter
      supabase migrations
      docs blueprint analytics
```

---

## 6. End-to-end flow (one picture)

```mermaid
flowchart TB
  subgraph user [User]
    U[Trader]
  end

  subgraph clients [Clients]
    W[Web PWA]
    M[Flutter mobile]
  end

  subgraph host [Edge hosting]
    V[Vercel]
  end

  subgraph supa [Supabase firqlsjixojnrofycwbs]
    A[Auth]
    PG[(Postgres)]
    EF[Edge Functions]
    CRON[pg_cron]
  end

  subgraph observe [Observe]
    EV[user_events]
    SEN[Sentry]
    EM[Weekly email]
  end

  subgraph ai [AI]
    GEM[Gemini parse]
    ORCH[Client orchestrator]
  end

  U --> W
  U --> M
  W --> V
  W --> A
  M --> A
  W --> PG
  M --> PG
  W --> ORCH
  W --> GEM
  W --> EV
  EV --> PG
  EF --> PG
  CRON --> EF
  EF --> EM
  W --> SEN
  A --> PG
```

---

## 7. Daily discipline loop (product core)

```mermaid
flowchart TD
  A[Land / Login / Signup] --> B[Onboarding]
  B --> C[Today]
  C --> D{Pre-session?}
  D -->|no| E[Mood + rules check]
  E --> F[Lock rules optional]
  F --> C
  D -->|yes| G[Dashboard grade streak]
  G --> H{Act}
  H --> I[Journal / Capture trade]
  H --> J[Diary scan]
  H --> K[Rules playbooks]
  I --> L[Stats insights alerts]
  J --> L
  K --> L
  L --> M[Sync snapshot + events]
  M --> C
```

---

## 8. Status snapshot (May 2026)

| Area | Status |
|------|--------|
| Web app production | ✅ Live |
| Auth Google GitHub email | ✅ |
| Cloud sync `trader_snapshots` | ✅ |
| `user_events` tracking 49 events | ✅ |
| Edge functions ×3 | ✅ ACTIVE |
| pg_cron schedules | ✅ |
| Browser E2E verified | ✅ |
| Weekly report email | ✅ Tested |
| Real beta users | ⬜ Invite next |
| Mobile feature parity | 🟡 Partial |
| Stripe Pro billing | ⬜ |
| Normalized DB tables | ⬜ Future |

---

## 9. Key files (navigation)

| Topic | Path |
|-------|------|
| Mind map (this doc) | `docs/blueprint/00-mind-map.md` |
| Completion % / next work | `docs/blueprint/05-completion-status.md` |
| Architecture | `docs/blueprint/01-system-architecture.md` |
| Data flow | `docs/blueprint/02-data-flow.md` |
| User flows | `docs/blueprint/03-user-flows.md` |
| Feature map | `docs/blueprint/04-feature-map.md` |
| Tracking spec | `master-tracking-prompt.md` |
| Data activation | `data-layer-master.md` |
| Admin SQL | `docs/analytics/SAVED_QUERIES.sql` |
| Privacy / inventory | `docs/DATA_INVENTORY.md` |
| Cron setup | `docs/supabase/RUN_CRON_AND_RETENTION.sql` |

---

## Related blueprint index

See [README.md](./README.md) in this folder for the full doc set.
