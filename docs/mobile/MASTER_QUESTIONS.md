# DisciplineOS / The Perfect Trader — Master questions

From idea to GTM: questions to answer **before, during, and after** building the mobile product.

**Platform target:** Flutter (iOS + Android primary; web = separate Next.js app in `src/`)  
**Backend:** Supabase (Tokyo region in production docs)

Use this as a living checklist. Mark answers in each section as decisions are locked.

---

## Section 1: Idea and vision

### 1.1 Core product

- What exact problem does this solve that Tradervue, Edgewonk, and TraderSync don't?
- Is the product a trading journal, a psychology tool, or a performance system? Which is the **primary** identity?
- What is the one-line pitch? Can a trader understand it in 5 seconds?
- Who is the ideal user? Day trader? Swing? Options? Crypto? Futures? All?
- Beginners who need guidance vs experienced traders who need optimization?
- What is the minimum feature set that makes someone switch from their current journal?
- Is the psychology-first approach validated? (20+ trader interviews?)
- What does success look like in 6 months? Users? Revenue? App Store rank?
- Bootstrap vs raise funding — how does that affect scope?
- What is the free vs paid split? What is paywalled?

### 1.2 Competitive landscape

- What are traders using today? Spreadsheets? Tradervue? Notion? Nothing?
- Why pay when Tradervue has a free tier?
- Tradervue's biggest weakness to exploit?
- What does Edgewonk / TraderSync do better?
- Existing psychology-focused tools and their traction?
- Price point: $9 / $29 / $49 per month?
- Broker integrations: must-have vs nice-to-have at launch?
- Community / sharing journal entries?
- Influencer / creator advocates?
- Addressable market size (active retail traders)?

### 1.3 Business model

- Freemium vs trial vs one-time vs subscription?
- Monthly vs annual vs lifetime pricing?
- Free / Pro / Premium tier differentiation?
- B2B: prop firms, education companies?
- Target CAC and LTV?
- Break-even timeline?
- Affiliate / partnership revenue?
- AI coaching: included or add-on?
- Aggregated anonymized insights as a data play?

---

## Section 2: Tech stack and Flutter setup

### 2.1 Flutter decision

- Why Flutter over React Native for this product?
- Flutter SDK version locked? (Repo: **3.44 stable**, Dart 3.12)
- Flutter Web for dashboard, or Next.js only? (**Current: Next.js web, Flutter mobile only**)
- Channel: stable / beta / master?
- Dart 3.x null safety enforced?
- State management: Riverpod / BLoC / Provider? (**Repo: Riverpod**)
- Routing: GoRouter / AutoRoute? (**Repo: GoRouter**)
- Minimum iOS version?
- Minimum Android API level?
- Tablet / foldable support?
- Portrait only vs landscape?

### 2.2 Project architecture

- Monorepo vs separate repos? (**Current: monorepo, `mobile/`**)
- Feature-first vs layer-first? (**Current: feature-first + clean layers**)
- Clean architecture (domain / data / presentation)?
- Code sharing web vs mobile?
- Build flavors: dev / staging / production?
- Platform-specific code strategy?
- Code generation: freezed, json_serializable?
- Linting: flutter_lints / very_good_analysis?
- Test strategy and coverage target?

### 2.3 Key packages

- `supabase_flutter` version and offline strategy
- Charts: fl_chart vs alternatives
- Local storage: Hive vs drift vs isar (**Repo: Hive**)
- Notifications, analytics, crash reporting, IAP, deep links
- Flutter Web compatibility for each package (if web added later)

### 2.4 Environment setup

- IDE: Cursor vs Android Studio
- CI/CD: GitHub Actions vs Codemagic vs Bitrise
- Secrets in CI
- Git branching and versioning
- Shared Supabase types with Edge Functions

---

## Section 3: Pipeline, DevOps, and infrastructure

### 3.1 Development pipeline

- Commit → production flow
- Environments: local / dev / staging / production
- Database migrations between environments
- Feature flags
- Code review and CI gates
- Hotfix process
- Release cadence
- QA: manual vs E2E
- Rollback strategy

### 3.2 Build and distribution

- Flutter Web hosting (if applicable)
- Android: internal → closed → open → production
- iOS: TestFlight → App Store
- Codemagic vs GitHub Actions
- Signing keys storage
- Fastlane for store submission
- Store metadata and screenshots
- Beta testing strategy

### 3.3 Backend (Supabase)

- Plan tier and region
- Separate projects per environment?
- Backup strategy
- Migrations: Supabase CLI
- Realtime: which features need it?
- Storage buckets and CDN
- Edge Functions scope
- Auth: Supabase vs Firebase
- Downtime fallback

### 3.4 Monitoring

- Crashes: Sentry / Crashlytics
- Performance and API latency
- Alerting
- Cost monitoring

---

## Section 4: Design and UX

### 4.1 Design system

- Figma source of truth?
- Dark / light / both?
- Typography and icons
- Material 3 vs HIG vs custom
- Web vs mobile design divergence
- Accessibility (WCAG, VoiceOver, TalkBack)

### 4.2 User experience

- Onboarding length and skippability
- Time to log a trade (< 30s goal?)
- Pre-trade psychology: mandatory or optional?
- Block trading on bad mood?
- Empty states and sample data
- First-launch tutorial
- Loading patterns (skeleton / shimmer)
- Error patterns (toast / dialog)
- Bottom nav tabs and FAB
- Deep links

### 4.3 Platform-specific UX

- iOS vs Android navigation differences
- Date pickers native vs custom
- Web keyboard shortcuts and PWA (Next.js)

---

## Section 5: Product scope and feature system

- Exact MVP feature list for v1?
- Core at launch: manual trade, CSV import, psychology journal, analytics, goals, reports, AI?
- Phase 2: broker API, replay, community, coach marketplace, prop-firm mode?
- Tradervue-like must-haves: tags, screenshots, notes, reports, playbook review?
- Psychology-first defensible features?
- Pre-trade / during / post-trade data capture?
- Metrics per trader type?
- Custom rules, playbooks, tags?
- Screenshots and chart uploads at launch?
- Emotional state → outcome in analytics?

**Current repo Phase 1 mobile:** Auth, Today, Rules, Journal, Settings + snapshot sync. See [ROADMAP.md](./ROADMAP.md).

---

## Section 6: Data model and database

- Core tables vs single jsonb snapshot?
- Trades vs positions vs executions?
- Options multi-leg modeling?
- Pre/post emotional ratings storage?
- Screenshots linked to trades/journals?
- Event vs snapshot tables?
- RLS per table?
- Analytics indexes and materialized views?

**Current v1:** `trader_snapshots` jsonb only. See [DATA_CONTRACT.md](./DATA_CONTRACT.md) and [DATA_MODEL_PLAN.md](./DATA_MODEL_PLAN.md).

---

## Section 7: Backend system architecture

- Modules: auth, ingestion, analytics, psychology, notifications, subscriptions, admin
- App-direct vs Edge Function operations
- Async jobs: CSV, screenshots, reports, AI summaries, reminders
- Queue for heavy imports
- Service boundaries for future migration off Supabase
- DB triggers on trade/journal/psychology changes
- Idempotency for imports/webhooks
- Real-time vs eventual consistency
- Audit trail for trade edits
- Trustworthy P&L calculation isolation

See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

---

## Section 8: System architecture decisions

- Modular monolith on Supabase first?
- Request flow: Flutter → Auth → Postgres / Storage / Realtime / Edge Functions
- Chart images, CSV, PDF handling
- Scheduled jobs: Supabase cron vs external worker
- Transactional vs analytical separation
- Caching for dashboards
- Multi-device sync
- Offline-first strategy
- Disaster recovery

---

## Section 9: API and Edge Function design

- Edge Functions required at launch
- CSV parsing and broker normalization
- Report/PDF generation
- AI coaching prompts
- API versioning and validation
- Retries, rate limits, errors
- Request logging
- Admin-only function security
- Shared payload contracts with Flutter

---

## Section 10: Security, privacy, and compliance

- Sensitive data classification
- RLS policies
- Private-by-default screenshots/reports
- Encryption at rest and in transit
- Account deletion and data export (GDPR-style)
- Retention for logs and deleted trades
- Abuse detection
- Device session management
- Privacy policy, terms, disclaimer
- AI cross-user data isolation

See [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md).

---

## Section 11: Analytics, KPIs, and success metrics

- North-star metric: WAU, journal completion, imports, paid retention?
- Funnel: onboarding → subscription
- Activation event for retention
- Psychology behaviors vs outcomes
- Internal dashboards
- Event tracking tool choice
- Vanity vs decision metrics
- Weekly KPI review cadence

---

## Section 12: Pricing, packaging, and GTM

- Free tier limits (trades, journals, export windows)
- Pro vs Premium contents
- AI coaching in Pro or add-on?
- Annual discount
- Coupons and affiliates
- GTM: creators, communities, SEO, App Store
- Landing pages by persona
- Proof assets before launch
- Beta recruitment
- 90-day launch plan

See [PRODUCT_VISION_GTM.md](./PRODUCT_VISION_GTM.md).

---

## Section 13: Admin panel and operations

- Admin manages: users, subscriptions, imports, flags, tickets, feature flags, banners
- Support impersonation?
- Failed import replay
- Sync issue inspection
- Abuse handling
- Plan/entitlement updates
- Admin audit logs
- Weekly internal reports

See [ADMIN_OPERATIONS.md](./ADMIN_OPERATIONS.md).

---

## How to use this document

1. Answer **Section 1 and 12** before major scope changes.
2. Lock **Section 2 and 8** in [TECH_STACK_DECISIONS.md](./TECH_STACK_DECISIONS.md).
3. Track schema evolution in [DATA_MODEL_PLAN.md](./DATA_MODEL_PLAN.md).
4. Revisit quarterly; move resolved items into production docs under `docs/production/`.
