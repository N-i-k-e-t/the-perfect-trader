# 🏗️ THE PERFECT TRADER — Master Page-by-Page Build Prompt
## Complete Feature × UX × Device Compatibility Plan

> **Context:** App is live at https://the-perfect-trader.vercel.app  
> Stack: Next.js (App Router), Supabase, Tailwind, Framer Motion  
> Design: Mobile-first PWA, 390px centered frame, navy + emerald brand  
> Current state: 33/33 UX fixes done, 49 events tracked, beta-ready  
> This prompt covers: every page → every element → every feature → every device

---

## HOW TO USE THIS PROMPT

Paste the entire document into Cursor (Agent mode) or Lovable.  
It will work through each page section by section.  
Each section is self-contained — you can also paste individual sections.

---

# ═══════════════════════════════════════════════
# MASTER BUILD PROMPT — ALL PAGES
# ═══════════════════════════════════════════════

```
You are a senior full-stack engineer + iOS-grade UI/UX designer 
working on The Perfect Trader — a trading psychology PWA.

Stack: Next.js 15 App Router, Supabase, Tailwind CSS, Framer Motion,
       Radix UI, canvas-confetti, Lucide icons
Design system: 390px centered mobile frame, navy #1a1a2e brand, 
               emerald #10b981 CTAs, Inter font
Device targets: iPhone (primary), Android, iPad, Desktop (frame view)

Go through EVERY page below. For each page:
1. Audit current state vs spec
2. Implement ALL missing features and UX improvements
3. Ensure full device compatibility
4. Add tracking calls where specified
5. Report what was changed

═══════════════════════════════════════════════════
PAGE 1 — LANDING / MARKETING (/)
═══════════════════════════════════════════════════

ROUTE: src/app/page.tsx or src/app/(marketing)/page.tsx

DEVICE BEHAVIOUR:
□ Mobile (390px): Full-screen hero, single CTA above fold
□ Tablet (768px): 2-column layout, hero left, mockup right  
□ Desktop (1024px+): Centered max-w-[1200px], hero section with 
  iPhone mockup showing the app
□ The app mockup on desktop should show the actual Today screen 
  inside a phone frame (CSS phone frame, no image needed)

SECTIONS TO BUILD (in order, scroll down):
1. HERO
   - Headline: "Trade your plan. Every session."
   - Sub: "The discipline OS for serious traders — rules, grades, AI coach."
   - CTA button: "Join Beta →" → /beta
   - Secondary link: "See how it works ↓" (smooth scroll)
   - Background: dark navy, subtle grid or noise texture
   - Phone mockup: shows Today screen with score ring

2. PROBLEM STATEMENT
   - "Most traders know what to do. They just don't do it."
   - 3 pain cards: Revenge trades / Rule breaks / No feedback loop
   - Each card: icon + 1-line description
   - Animate in on scroll (Framer Motion viewport)

3. SOLUTION — HOW IT WORKS
   - 4 steps with number + icon + description:
     1. Set your rules → 2. Plan your session → 
     3. Log your trades → 4. Get your grade
   - Horizontal on desktop, vertical on mobile

4. FEATURE HIGHLIGHTS (3 cards)
   - AI Coaching: "Catches tilt before it costs you"
   - Rule Streaks: "Gamified discipline — not P&L"
   - Daily Grade: "A–F for how you traded, not what you made"
   - Each card: dark bg, emerald accent, icon, 2-line description

5. SOCIAL PROOF (beta placeholder)
   - "Join 10 beta traders building consistency"
   - OR: quote from a beta tester (add real one when available)

6. FINAL CTA
   - "10 beta spots. First come, first served."
   - Big emerald button: "Claim Your Spot →" → /beta
   - Below: "Free during beta. No credit card."

7. FOOTER
   - Logo + tagline
   - Links: /privacy, /terms, /beta, /about
   - "Built by a trader, for traders."

TRACKING:
track('page_viewed', 'navigation', { path: '/' })
track('external_link_clicked', 'navigation') on all CTA clicks

═══════════════════════════════════════════════════
PAGE 2 — BETA WAITLIST (/beta)
═══════════════════════════════════════════════════

ROUTE: src/app/beta/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Single column, email form centered
□ Tablet/Desktop: Centered card max-w-[480px] on dark bg

FEATURES:
□ Show live beta capacity: "X / 10 spots filled" 
  (from beta-capacity RPC — already exists)
□ Email input + "Join Waitlist" button
□ On submit: 
  - Save email to Supabase beta_waitlist table (create if not exists)
  - Show success state: "You're on the list. We'll email you."
  - track('beta_waitlist_joined', 'settings', { submission_method: 'page' })
□ If capacity = 10/10: show "Waitlist full — follow for updates" 
  with Twitter link
□ Show 3 bullet points of what beta users get:
  - Full access to all features
  - Direct line to the founder
  - Founding member pricing when we launch

WAITLIST TABLE (create migration if not exists):
CREATE TABLE beta_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'  -- pending | invited | active
);
ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;
-- Only service role can read; anyone can insert their own email

═══════════════════════════════════════════════════
PAGE 3 — AUTH: LOGIN (/login or /auth)
═══════════════════════════════════════════════════

ROUTE: src/app/login/page.tsx (or auth/page.tsx)

DEVICE BEHAVIOUR:
□ All devices: Centered card, max-w-[390px]
□ Keyboard-aware on mobile: form scrolls up when keyboard opens
  Use: CSS env(keyboard-inset-height) or scroll-smooth on focus

FEATURES & UX:
□ Logo at top (centered)
□ Headline: "Welcome back, trader."
□ Google OAuth button (primary, full-width, emerald)
□ GitHub OAuth button (secondary)
□ OR divider
□ Email + password form
□ "Forgot password?" link → password reset flow
□ "Don't have an account? Sign up" link
□ Error states: inline, red, specific messages 
  (not generic "something went wrong")
□ Loading state: button shows spinner, disabled during auth
□ After login: redirect to /today (not /dashboard)

ACCESSIBILITY:
□ All inputs have visible labels (not just placeholder)
□ Tab order: email → password → submit → forgot password
□ Error messages linked to inputs via aria-describedby

TRACKING:
track('login_started', 'auth', { method })
track('login_completed', 'auth', { method, is_returning_user })
track('login_failed', 'auth', { method, error_code })

═══════════════════════════════════════════════════
PAGE 4 — AUTH: SIGNUP (/signup)
═══════════════════════════════════════════════════

ROUTE: src/app/signup/page.tsx

Same layout as login. Differences:
□ Headline: "Start trading with discipline."
□ Fields: Full name + Email + Password
□ Password strength indicator (4 levels: weak/fair/good/strong)
□ After signup: redirect to /onboarding (not /today)
□ Google/GitHub OAuth still shows (creates account + skips to onboarding)

TRACKING:
track('signup_started', 'auth', { method })
track('signup_completed', 'auth', { method, has_display_name })

═══════════════════════════════════════════════════
PAGE 5 — ONBOARDING (/onboarding)
═══════════════════════════════════════════════════

ROUTE: src/app/onboarding/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Full-screen, one question per screen
□ Tablet/Desktop: Centered 390px card on dark bg (same as mobile)
□ Progress bar always visible at top
□ "Step X of 12" below progress bar
□ CTA always anchored to bottom (sticky footer pattern)

CURRENT STATE: Steps exist. Verify and improve:

STEP AUDIT — verify all 12 steps exist and have proper:
□ Step 0: Splash — headline + subtext + "Start →" CTA
□ Step 1: Trading style (Scalper/Day/Swing/Position)
□ Step 2: Asset class (Stocks/Futures/Options/Forex/Crypto)
□ Step 3: Experience level (New/1-2yr/3-5yr/5yr+)
□ Step 4: PERSONALISATION GRAPH — "Based on your profile, 
  here's your discipline growth path" — SVG curve that changes 
  shape based on experience. Label: "Most traders see improvement 
  in 21 days of consistent logging."
□ Step 5: Session window (Pre-market/Morning/Full day/Evening)
□ Step 6: Daily trade cap (1/2-3/4-5/5+)
□ Step 7: Risk per trade (0.5%/1%/2%/Custom)
□ Step 8: Biggest struggle (FOMO/Revenge/Overtrading/SL/No system)
□ Step 9: Goal (Consistency/Grow account/Go full-time/Just track)
□ Step 10: Commitment screen — 
  "Your discipline, tracked daily. Ready to start?"
  + generation animation (loading dots → "Building your profile...")
□ Step 11: Personalized RECAP card — shows all answers:
  Style, Market, Risk %, Cap, Challenge, Goal
  CTA: "Enter Your Dashboard →"

ANIMATIONS:
□ Each step: slide-in from right (AnimatePresence)
□ Back: slide-in from left
□ Progress bar: smooth width transition

═══════════════════════════════════════════════════
PAGE 6 — TODAY (/today) ← MOST IMPORTANT PAGE
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/today/page.tsx

DEVICE BEHAVIOUR:
□ Mobile (390px): Primary use case — single column, scroll
□ Tablet (768px): Same single column, max-w-[480px] centered
□ Desktop: Centered 390px frame (handled by layout wrapper)
□ Landscape mobile: Reduce hero height, keep all sections accessible

SECTION ORDER (top to bottom — strict):
1. RiskAlertBanner (conditional — top of everything)
2. Date + streak counter
3. DISCIPLINE SCORE RING (hero — large, prominent)
   - Ring shows % compliance
   - Grade (A/B/C/D/F) in center
   - Color: green (A), yellow (B), orange (C/D), red (F)
   - Animated fill on load (Framer Motion pathLength)
4. Pre-session CTA (if !preSessionComplete)
5. Welcome card (first-time users only)
6. Mood selector (emoji grid)
7. InsightCards (AI coach — real coachMessages from context)
8. Rules checklist
   - Each rule: checkbox + text + category badge
   - Checked = bounce animation + strikethrough
   - ALL checked → confetti fires (once per day)
9. Trade counter progress bar "X / Y trades"
10. "Log Trade" button → opens CaptureHub
11. Post-session notes (time-gated: show after first trade OR after session window)

MISSING FEATURES TO ADD:
□ Stability score trend: small sparkline showing last 7 days
□ "Best day this week" badge if today is best so far
□ Quick rule violation flag: long-press rule → mark violated
   (without having to open a trade form)
□ Session timer: shows how long today's session has been running
□ Market hours indicator: 
   - "Market opens in Xh Xm" (before 9:15 IST)
   - "Market is LIVE" (9:15–15:30 IST)  
   - "Market closed" (after 15:30 IST)
   - Use IST timezone always for Indian markets
   - NSE/BSE hours: 9:15 AM – 3:30 PM IST

TRACKING:
track('session_stability_score_viewed', 'session', { score, session_date })
track('session_pre_plan_completed', 'session', { ... })

═══════════════════════════════════════════════════
PAGE 7 — RULES (/rules)
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/rules/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: List + FAB for add
□ Tablet/Desktop: 2-column layout — rules list left, 
  rule detail/edit right (if space allows at 768px+)

SECTIONS:
1. HEADER: "My Rules" + rule count badge + "+ Add Rule" button
2. CATEGORY TABS: All / Entry / Exit / Risk / Psychology / Custom
3. RULES LIST:
   □ Each rule card: emoji + text + category + active toggle
   □ Swipe left to delete (mobile)
   □ Tap to expand → shows: full text, violation count, 
     last violated date, times followed today
   □ Long press to reorder (drag handle)
   □ Color indicator: green (never violated) / yellow (1-3 violations) 
     / red (4+ violations) — last 30 days
4. PLAYBOOKS SECTION (below rules):
   □ "Your Playbooks" header + "+ New Playbook" CTA
   □ Each playbook: name + linked rule count + win rate badge
   □ Tap to expand: description + criteria + linked rules
5. EMPTY STATE (0 rules):
   □ Illustration + "Your rules are your edge."
   □ CTA: "Add your first rule →"
   □ Below: "Start with these 3:" → pre-seeded suggestions:
     "Never risk more than 1% per trade"
     "No trades in first 15 minutes"  
     "Stop after 2 consecutive losses"
   □ One-tap to add any suggestion

MISSING FEATURES:
□ Rule Library tab: pre-seeded rules from 
  Livermore / Douglas / Van Tharp — one tap to adopt
□ Rule analytics inline: "You've followed this 12/14 days"
□ Import rules from text (AI parse — "paste your rules as text")

TRACKING:
track('rule_created', 'rules', { rule_id, rule_category, ... })
track('rule_violated_flagged', 'rules', { rule_id, ... })

═══════════════════════════════════════════════════
PAGE 8 — TRADE JOURNAL (/journal)
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/journal/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Single column list, pull-to-refresh
□ Tablet: 2-column grid of trade cards
□ Desktop: 3-column grid

SECTIONS:
1. HEADER: "Trade Journal" + total trade count
2. FILTER BAR (horizontal scroll):
   □ All / Today / This Week / This Month
   □ Win / Loss
   □ By symbol (search)
   □ By emotion
3. SUMMARY STRIP (above list):
   □ Total PnL | Win rate | Avg R-multiple | Total trades
   □ Color: green if positive, red if negative
4. TRADE LIST:
   □ Each card: date + symbol + direction badge + PnL + R + grade dot
   □ Emotion emoji on right
   □ Rules: small "2/3 followed" indicator
   □ Swipe left: delete (with confirm)
   □ Tap: → /journal/[id] detail view
5. EMPTY STATE: "No trades yet. Log your first one."
   □ Button: "Log a Trade →" opens CaptureHub

MISSING FEATURES:
□ CSV export button (top right)
□ Calendar view toggle (month grid with P&L color per day)
□ Trade streak indicator: "3 rule-compliant trades in a row 🔥"
□ "Best trade" and "Worst trade" cards at top of month view

TRACKING:
track('trade_filter_applied', 'trades', { filter_type, filter_value })
track('analytics_export_triggered', 'analytics', { export_type: 'csv' })

═══════════════════════════════════════════════════
PAGE 9 — TRADE DETAIL (/journal/[id])
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/journal/[id]/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Full-screen, back button top left
□ All devices: max-w-[480px] centered

SECTIONS:
1. HEADER: Back button + "Trade Detail" + Edit button (emerald)
2. TRADE SUMMARY CARD:
   □ Symbol + direction + date + session
   □ Entry / Exit / Planned SL / Actual SL
   □ PnL (large, green/red) + R-multiple
3. RULES CARD:
   □ Rules followed (green checkmarks)
   □ Rules broken (red X marks)
   □ Compliance % for this trade
4. PSYCHOLOGY CARD:
   □ Mood before / after (emoji)
   □ Emotion tag
   □ Setup quality rating
5. NOTES SECTION:
   □ Full notes text
   □ Setup link (if present)
6. AI ANALYSIS CARD (if AI parsed):
   □ Show confidence score
   □ "AI extracted these fields" with list
7. ACTION ROW:
   □ Edit button → CaptureHub pre-filled
   □ Delete button (with confirm dialog)
   □ Share button → generates trade card image (future feature)

═══════════════════════════════════════════════════
PAGE 10 — CALENDAR (/calendar)
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/calendar/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Full-width month grid, event list below
□ Tablet/Desktop: Split — calendar left, events right

SECTIONS:
1. MONTH GRID:
   □ Each day cell shows:
     - PnL color dot (green/red/gray)
     - Trade count (small number)
     - Grade letter if session logged
   □ Today: highlighted border
   □ Tap any day: expands detail below (not navigate away)
   □ Swipe left/right: navigate months (Framer Motion drag)

2. WEEK NAVIGATION STRIP (above grid):
   □ < Prev | Month Year | Next >
   □ "Today" button (returns to current month)

3. MARKET EVENTS LIST (below grid):
   □ Upcoming events: CPI, FOMC, NSE/BSE expiry, RBI policy
   □ Each event: date + time + title + impact badge (High/Med/Low)
   □ Impact colors: red (high), yellow (med), gray (low)
   □ Filter: All / High Impact / This Week
   □ Tap event: detail sheet (time, description, historical impact)

4. DAY DETAIL (expands on tap):
   □ Date + grade + session notes
   □ Trades list for that day (mini cards)
   □ Events that day
   □ "Add note for this day" CTA

MISSING FEATURES:
□ "Next high-impact event" countdown banner at top
□ NSE F&O expiry dates pre-loaded (every last Thursday of month)
□ Color-coded month view (green = good session, red = bad, 
  gray = no session, yellow = partial)

═══════════════════════════════════════════════════
PAGE 11 — STATS / ANALYTICS (/stats)
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/stats/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Vertical scroll, card stack
□ Tablet: 2-column grid of metric cards
□ Desktop: 2-column grid, charts wider

SECTIONS:
1. OVERVIEW STRIP (top):
   □ 4 key metrics: Total trades | Win rate | Avg R | Best streak
   □ Horizontal scroll on mobile

2. DISCIPLINE TREND CHART:
   □ Line chart: last 14 days compliance %
   □ Dots per day, colored by grade
   □ Tap dot: shows that day's detail
   □ Chart library: use recharts (already in stack?)

3. RULE ADHERENCE BREAKDOWN:
   □ Each rule: bar showing followed % last 30 days
   □ Sorted: worst rule first (most violated at top)
   □ "Your weakest rule: [rule text]"

4. BEHAVIORAL PATTERN CARDS:
   □ "Best trading day: Tuesday" 
   □ "Worst time: First 15 min"
   □ "Tilt trigger: After 2 consecutive losses"
   □ All derived from real trade data

5. INDISCIPLINE COST CARD:
   □ "Broken rules cost you ₹X this month"
   □ Calculation: trades where rules broken → sum negative PnL delta
   □ Color: red if > 0

6. PATTERN INSIGHT CARDS (AI):
   □ InsightCards from context
   □ Max 2 shown, swipe to dismiss

7. CONSISTENCY HEATMAP:
   □ GitHub-style contribution grid
   □ Each square = one day, color = grade
   □ Last 90 days
   □ "X day longest streak" below

8. MONTHLY SUMMARY (Trading DNA card):
   □ Show on first day of new month
   □ "Last month: X trades, Y% rule compliance, Z grade average"
   □ "Your trading DNA" card with 3 personal insights
   □ Share button (generates image — future)

MISSING FEATURES:
□ Time-of-day heatmap: grid of hour × day showing win rate
□ Symbol performance: which symbols you trade best
□ Emotion × outcome: do you win more when calm or excited?
□ "Compare to last month" toggle

═══════════════════════════════════════════════════
PAGE 12 — SETTINGS (/settings)
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/settings/page.tsx

DEVICE BEHAVIOUR:
□ All devices: Single column, grouped sections

SECTIONS:
1. PROFILE CARD:
   □ Avatar (initials if no photo) + name + email
   □ "Edit Profile" → inline edit of display name
   □ Auth provider badge (Google / GitHub / Email)
   □ "Beta Member" badge

2. TRADER PERSONA:
   □ All onboarding answers editable
   □ Same fields: style, market, experience, session, cap, risk, 
     struggle, goal
   □ "Update Profile →" saves to userModel + metadata
   □ Note: "Updating your profile helps the AI coach improve"

3. NOTIFICATIONS (future):
   □ Toggle: Pre-session reminder (time picker)
   □ Toggle: Post-session nudge
   □ Toggle: Weekly report
   □ Toggle: Streak at-risk alert
   □ Placeholder: "Coming soon — push notifications"

4. DATA & PRIVACY:
   □ "Export my data" → JSON download
   □ "Clear device cache" → clears localStorage
   □ "View privacy policy" → /privacy
   □ "Delete account" → confirmation dialog → support request

5. APP:
   □ Theme toggle (dark/light — if implemented)
   □ App version badge
   □ "What's new" → changelog modal

6. ACCOUNT:
   □ "Set password" (for OAuth users)
   □ "Sign out" (bottom, full-width, secondary style)
   □ "Delete account" (red text, bottom)

TRACKING:
track('settings_section_viewed', 'settings', { section_name })
track('data_export_requested', 'settings')

═══════════════════════════════════════════════════
PAGE 13 — DIARY / CAPTURE (/diary)
═══════════════════════════════════════════════════

ROUTE: src/app/(app)/diary/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Camera-first layout, bottom sheet for notes
□ Tablet/Desktop: Two-panel — capture left, diary list right

SECTIONS:
1. HEADER: "Trading Diary" + date
2. CAPTURE MODES (large grid):
   □ 📝 Note — text note with tags
   □ 🎤 Voice — audio → text (when implemented)
   □ 📷 Scan — photo of handwritten notes → AI extract
   □ ✅ Checklist — quick yes/no checklist
   □ Coming Soon badges on Voice (if not wired)
3. DIARY ENTRIES LIST:
   □ Each entry: date + type icon + preview text + tags
   □ Tap to expand full entry
   □ Swipe to delete
4. AI SCAN RESULT:
   □ After photo scan: show extracted fields
   □ "AI extracted:" → list of detected values
   □ Confidence score per field
   □ Editable before save

TRACKING:
track('ai_diary_scan_started', 'ai', { scan_type })
track('ai_diary_scan_completed', 'ai', { confidence, fields_extracted })

═══════════════════════════════════════════════════
PAGE 14 — ADMIN PANEL (/admin) — founder only
═══════════════════════════════════════════════════

ROUTE: src/app/admin/page.tsx (protected by is_admin flag)

DEVICE BEHAVIOUR:
□ Desktop primary (1024px+): Multi-column dashboard
□ Mobile: Single column, scrollable cards

SECTIONS:
1. OVERVIEW METRICS:
   □ Total users | DAU | WAU | MAU
   □ Beta capacity: X/10
   □ Total events | Events today

2. USER TABLE:
   □ List: user_id | email | signup date | last active | 
     trade count | rule count | onboarding_completed
   □ Search by email
   □ Filter: active / inactive / no trades

3. EVENT STREAM (live):
   □ Last 20 events with: time + user + event_name + page
   □ Auto-refresh every 30s

4. FEATURE ADOPTION CHART:
   □ Bar chart: event_name → unique user count
   □ Shows which features are actually used

5. AI PIPELINE MONITOR:
   □ AI parse requests: count + avg confidence + avg latency
   □ Failed parses: count + error types
   □ Coach messages shown vs dismissed rate

6. BETA WAITLIST:
   □ Table: email + joined_at + status
   □ "Invite" button per row → sends invite email via Resend

═══════════════════════════════════════════════════
PAGE 15 — PRICING (/pricing)
═══════════════════════════════════════════════════

ROUTE: src/app/pricing/page.tsx

DEVICE BEHAVIOUR:
□ Mobile: Stacked cards
□ Desktop: Side-by-side cards, max-w-[900px] centered

TIERS:
1. FREE (beta):
   □ All features during beta
   □ "Free while in beta"
   □ CTA: "Join Beta →" → /beta

2. PRO (post-beta):
   □ Price: ₹499/month or ₹3,999/year
   □ Features: Everything + AI coach + advanced analytics + 
     Trading DNA reports + Export CSV
   □ CTA: "Coming Soon" (grayed, not active yet)

3. FOUNDING MEMBER (limited):
   □ "Lock in ₹299/month forever"
   □ "For beta users only — price increases at launch"
   □ CTA: "Join Beta to Qualify →"

Note: No Stripe integration yet — pricing is marketing only.
Show countdown timer if trialStartDate logic exists in snapshot.

═══════════════════════════════════════════════════
DEVICE COMPATIBILITY — GLOBAL RULES
(Apply to ALL pages above)
═══════════════════════════════════════════════════

MOBILE (320px–430px) — PRIMARY:
□ All interactive elements ≥ 44×44px touch targets
□ Bottom nav above home bar: env(safe-area-inset-bottom)
□ No horizontal scroll (overflow-x: hidden on body)
□ Font size ≥ 16px on all inputs (prevents iOS zoom)
□ Keyboard: form scrolls up, CTA stays visible
□ Swipe gestures: left/right for navigation where natural
□ Pull-to-refresh on all list pages

TABLET (768px–1024px):
□ Same 390px frame centered (consistent experience)
□ OR 2-column layout where it genuinely helps 
  (journal list + detail, calendar + events)
□ No stretched single-column that looks broken at 768px

DESKTOP (1024px+):
□ App shows as centered 390px mobile frame on gray-950 bg
□ Header constrained to same 390px column
□ Keyboard shortcuts: 
  - 'T' → /today
  - 'J' → /journal  
  - 'R' → /rules
  - 'S' → /stats
  - 'N' → open CaptureHub (new trade)
  - ESC → close any open modal/sheet
□ Mouse: hover states (only under @media (hover: hover))
□ No touch-specific interactions required on desktop
□ Scrollbar: custom thin scrollbar matching brand colors

ANDROID:
□ Same as iOS mobile — all touch targets, no hover bleed
□ Back button (hardware): triggers modal close or router.back()
□ Address bar appearing/disappearing: use 100dvh not 100vh
□ Vibration API for haptic-like feedback on key actions:
  navigator.vibrate(10) on trade save, rule check

PWA (INSTALLED):
□ display: standalone in manifest
□ theme_color: #1a1a2e (navy)
□ background_color: #1a1a2e
□ icons: 192×192 and 512×512 (check public/ folder)
□ Splash screen: logo on navy background
□ Offline: show cached data + "Syncing..." indicator
□ Install prompt: show after 3rd session 
  ('pt_pwa_prompt_count' in localStorage)

═══════════════════════════════════════════════════
AFTER EACH PAGE — VERIFY CHECKLIST
═══════════════════════════════════════════════════
For each page worked on, confirm:

□ Renders correctly at 320px (small Android)
□ Renders correctly at 390px (iPhone 14)
□ Renders correctly at 430px (iPhone Plus)
□ Renders correctly at 768px (iPad / tablet)
□ Renders correctly at 1280px (desktop — sees phone frame)
□ All touch targets ≥ 44×44px
□ No horizontal overflow
□ No hover styles on touch devices
□ All inputs ≥ 16px font-size
□ Safe area insets applied correctly
□ Loading state exists for all async data
□ Empty state exists with actionable CTA
□ Error state exists with retry option
□ Tracking calls fire for key actions
□ All CTAs use btn-primary (emerald) or btn-secondary

═══════════════════════════════════════════════════
WORK ORDER (priority sequence)
═══════════════════════════════════════════════════
Work through pages in this order:

SPRINT 1 (core app — beta critical):
1. Today page — missing features (market hours, sparkline, quick flag)
2. Rules page — rule library, analytics inline
3. Journal page — CSV export, calendar toggle
4. Trade detail — all sections complete

SPRINT 2 (growth features):
5. Stats page — time-of-day heatmap, Trading DNA card
6. Calendar page — color grid, F&O expiry, countdown
7. Settings page — all sections complete
8. Diary page — full capture modes

SPRINT 3 (marketing + conversion):
9. Landing page — full marketing page
10. Beta waitlist page — live capacity, email save
11. Pricing page — tiers, countdown

SPRINT 4 (admin + infrastructure):
12. Admin panel — full dashboard
13. Auth pages — polish and accessibility
14. Onboarding — verify all 12 steps

═══════════════════════════════════════════════════
FINAL OUTPUT FORMAT
═══════════════════════════════════════════════════
After completing each page, report:

PAGE: [name]
STATUS: ✅ Complete / ⚠️ Partial / ❌ Not started
CHANGES MADE: [list of files changed]
MISSING: [anything that couldn't be done — with reason]
DEVICE TEST: 320px ✅ | 390px ✅ | 768px ✅ | 1280px ✅
NEW TRACKING CALLS: [list of track() calls added]
```
