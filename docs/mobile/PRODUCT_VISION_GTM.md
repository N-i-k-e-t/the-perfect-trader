# Product vision, KPIs, pricing, and GTM

## Positioning (draft)

**One line:** Psychology-first trading discipline — rules, mood, and grades, not buy/sell signals.

**Primary identity:** Behavioral OS for active traders (journal + psychology + compliance).

**Ideal user (hypothesis):** Day/swing trader (e.g. NIFTY options) who breaks rules under tilt.

## Differentiation vs Tradervue-class tools

| Them | Us |
|------|-----|
| Trade logging + stats focus | Discipline grade + pre-session psychology |
| Broker sync emphasis | Intentional logging + behavior loops |
| Generic journal | Rules + mood + compliance narrative |

Validate with 20+ user interviews before scaling marketing claims.

## North-star metrics (candidates)

Pick one primary:

- Weekly active traders who complete **pre-session** or log **≥1 trade**
- Weekly **journal completion rate**
- **Paid retention** at D30 (post-Stripe)

## Funnel events to track

| Event | Meaning |
|-------|---------|
| `signup_complete` | Account created |
| `onboarding_complete` | First rules set |
| `pre_session_complete` | Today loop started |
| `trade_logged` | Journal entry |
| `trial_expired` | Hit paywall |
| `subscribe` | Paid (future) |

Tool: PostHog, Firebase Analytics, or Amplitude (TBD).

## Pricing (TBD — answer in MASTER_QUESTIONS)

| Tier | Draft limits |
|------|----------------|
| Free | X trades/mo, basic Today + Rules |
| Pro | Unlimited trades, stats, exports |
| Premium | AI coaching, advanced analytics |

**Current app:** Mock trial gate (`isPro`, `trialStartDate` in snapshot) — no Stripe.

## GTM motions (90-day sketch)

| Week | Focus |
|------|-------|
| 1–2 | Closed beta (20–50 traders), fix sync + Today loop |
| 3–4 | TestFlight + Play internal; collect testimonials |
| 5–8 | Creator outreach (trading Twitter/YouTube/Discord) |
| 9–12 | App Store launch, SEO landing, content on discipline not signals |

## Proof assets needed

- 3–5 beta tester quotes
- 60s demo video (Today → Journal → grade)
- Screenshots for both stores
- Privacy policy + terms aligned with cloud sync

## Launch cost reference

See [WINDOWS_DEV_SETUP.md](./WINDOWS_DEV_SETUP.md) (~$124 first-year store fees).

## Competitive research checklist

- [ ] Tradervue pricing and free tier limits
- [ ] Edgewonk differentiators
- [ ] TraderSync broker list
- [ ] Psychology-only apps in App Store search
