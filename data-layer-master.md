# 🧠 Perfect Trader — Data Layer Master Plan
## From "Collecting Events" → "Acting on Data"

> **Status context:** Tracking audit = 7/19 passing. Code fix prompt already prepared. This document covers the 3 strategic gaps + full execution plan for what happens after 19/19.

---

## PART 1 — BRIEF UNDERSTANDING: WHERE WE ARE

```
LAYER 1 ✅ DONE         LAYER 2 ⚠️ IN PROGRESS      LAYER 3 ❌ NOT STARTED
─────────────────       ──────────────────────────    ─────────────────────────
Data schema defined     track() utility exists        Table live in production?
Events categorized      7/19 events wired             AI layer not tracked
Privacy/RLS ready       Buffer/flush built            No dashboard / queries
Geo enrichment done     Consent gate exists           No feedback loops
                        Missing: AI, Today,           No retention triggers
                        Rules CRUD, modal events      No userModel feedback
```

**The core problem:** You can collect the data — but right now it may not even be reaching Supabase (table not confirmed live), the most valuable data (AI interactions) isn't tracked, and there's no plan for what to DO with the data once it flows.

---

## PART 2 — THE 3 STRATEGIC GAPS EXPLAINED

### Gap 1 — Production Table (URGENT, Day 0)

**What's happening:**
- Migration file exists at `supabase/migrations/20260325000000_user_events.sql`
- It is NOT referenced in `docs/supabase/APPLY_SCHEMA.sql`
- Result: `pt_event_queue` in localStorage keeps filling up — events never reach Supabase cloud

**Risk:** You launch beta, users start trading, you think you're collecting data — but localStorage queue grows silently and clears when users clear cache. **Zero data in Supabase.**

**Fix:** Run migration on live project once. Takes 2 minutes.

---

### Gap 2 — AI Layer Blind Spot (HIGH VALUE, Day 2–3)

The AI coaching brain is the **core differentiator** of Perfect Trader. Yet it has zero telemetry. You don't know:

| Question | Why it matters |
|---|---|
| Which coach messages get dismissed immediately? | Tells you which tones/types users ignore |
| What's the avg AI parse confidence score? | If it's <60%, users don't trust it |
| How often do diary scans fail? | If >20% fail, scan feature has UX problems |
| Do users accept or override AI-parsed trade fields? | Tells you AI accuracy on real trades |
| Which risk alerts get acted on vs ignored? | Tells you alert fatigue level |

Without this data, you're flying blind on the most important product decisions for v2.

---

### Gap 3 — What to DO with the Data (STRATEGIC, Week 2+)

This is the layer that turns raw events into **product intelligence**. Three sub-layers:

**A. Admin Visibility** — Can you SEE the data?
**B. AI Feedback Loop** — Does the data IMPROVE the product?
**C. Retention Engine** — Does the data TRIGGER actions?

---

## PART 3 — FULL EXECUTION PLAN

### PHASE 0 — Fix Production (TODAY, 30 minutes)

```
Step 1: Run migration on Supabase Cloud
─────────────────────────────────────────
Go to Supabase Dashboard → SQL Editor → paste and run:
supabase/migrations/20260325000000_user_events.sql

OR via CLI:
npx supabase db push

Verify: Dashboard → Table Editor → user_events table exists with all columns.

Step 2: Add to APPLY_SCHEMA.sql
─────────────────────────────────────────
Open docs/supabase/APPLY_SCHEMA.sql
Add at end:
-- Step: User Events tracking table (run after core schema)
\i supabase/migrations/20260325000000_user_events.sql

Step 3: Test one event reaches Supabase
─────────────────────────────────────────
Open your app in browser → open Supabase Dashboard → 
Table Editor → user_events → watch for a row to appear 
within 10 seconds of any interaction.

If rows appear: ✅ tracking is live.
If no rows: check /api/track endpoint logs in Vercel dashboard.
```

---

### PHASE 1 — Complete Code Fixes (Day 1–2)

Use the **Fix Prompt** from previous session to wire all 12 remaining gaps:

| Priority | Fix | Time est. |
|---|---|---|
| 🔴 P0 | Run migration live | 5 min |
| 🔴 P0 | AI layer tracking (Fix 9) | 2 hrs |
| 🔴 P0 | Today/session events (Fix 8) | 1 hr |
| 🟡 P1 | Rules CRUD events (Fix 7) | 1 hr |
| 🟡 P1 | Trade payload + edit/delete (Fix 6) | 1 hr |
| 🟡 P1 | Modal open/close (Fix 5) | 1 hr |
| 🟢 P2 | Auth missing events (Fix 4) | 30 min |
| 🟢 P2 | sendBeacon switch (Fix 3) | 15 min |
| 🟢 P2 | App-state fields on envelope (Fix 2) | 30 min |
| 🟢 P2 | Idle + rage click (Fix 11) | 45 min |
| 🟢 P2 | Consent normalization (Fix 12) | 15 min |
| 🟢 P2 | api_call_made/failed (Fix 10) | 45 min |

**Total estimate: ~1.5 days of focused dev work**

After this: re-run the audit prompt → target 19/19.

---

### PHASE 2 — Admin Dashboard (Week 1, after 19/19)

#### 2A. Supabase Studio Saved Queries (zero setup)

Save these as named queries in your Supabase SQL Editor:

```sql
-- 1. Daily Active Users (last 30 days)
SELECT DATE(timestamp_utc) as day, COUNT(DISTINCT user_id) as dau
FROM user_events
WHERE timestamp_utc > NOW() - INTERVAL '30 days'
  AND user_id IS NOT NULL
GROUP BY day ORDER BY day;

-- 2. Onboarding funnel drop-off
SELECT 
  event_properties->>'step_name' as step,
  event_properties->>'step_index' as step_num,
  COUNT(DISTINCT user_id) as users_reached
FROM user_events
WHERE event_name = 'onboarding_step_viewed'
GROUP BY step, step_num ORDER BY step_num::int;

-- 3. Feature adoption (which features are actually used?)
SELECT 
  event_name,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as sessions
FROM user_events
WHERE timestamp_utc > NOW() - INTERVAL '7 days'
GROUP BY event_name ORDER BY unique_users DESC LIMIT 30;

-- 4. AI coaching effectiveness
SELECT
  event_properties->>'tone' as tone,
  event_properties->>'message_type' as msg_type,
  COUNT(*) as shown,
  COUNT(*) FILTER (WHERE event_name = 'coach_message_dismissed') as dismissed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event_name = 'coach_message_dismissed') / COUNT(*), 1) as dismiss_rate_pct
FROM user_events
WHERE event_name IN ('coach_message_shown', 'coach_message_dismissed')
GROUP BY tone, msg_type ORDER BY shown DESC;

-- 5. AI parse quality
SELECT
  DATE(timestamp_utc) as day,
  COUNT(*) as parses,
  AVG((event_properties->>'ai_confidence')::float) as avg_confidence,
  AVG((event_properties->>'latency_ms')::int) as avg_latency_ms,
  COUNT(*) FILTER (WHERE (event_properties->>'ai_confidence')::float > 0.8) as high_confidence_count
FROM user_events
WHERE event_name = 'trade_ai_parsed'
GROUP BY day ORDER BY day;

-- 6. Rule violation patterns
SELECT
  event_properties->>'rule_id' as rule_id,
  COUNT(*) as violations,
  COUNT(DISTINCT user_id) as affected_users
FROM user_events
WHERE event_name = 'rule_violated_flagged'
GROUP BY rule_id ORDER BY violations DESC LIMIT 10;

-- 7. Rage click hotspots (UX problems)
SELECT
  event_properties->>'element_id' as element,
  event_properties->>'page_path' as page,
  COUNT(*) as rage_click_events
FROM user_events
WHERE event_name = 'rage_click_detected'
GROUP BY element, page ORDER BY rage_click_events DESC;

-- 8. Session depth & engagement
SELECT
  DATE(timestamp_utc) as day,
  AVG(session_duration_ms) / 1000 as avg_session_seconds,
  AVG(event_sequence) as avg_events_per_session,
  COUNT(DISTINCT session_id) as total_sessions
FROM user_events
GROUP BY day ORDER BY day;

-- 9. Geo distribution
SELECT
  geo_country_name,
  geo_city,
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT session_id) as sessions
FROM user_events
WHERE user_id IS NOT NULL
GROUP BY geo_country_name, geo_city ORDER BY users DESC LIMIT 20;

-- 10. Cloud sync health
SELECT
  DATE(timestamp_utc) as day,
  COUNT(*) FILTER (WHERE event_name = 'cloud_sync_completed') as successful_syncs,
  COUNT(*) FILTER (WHERE event_name = 'cloud_sync_failed') as failed_syncs,
  AVG((event_properties->>'latency_ms')::int) 
    FILTER (WHERE event_name = 'cloud_sync_completed') as avg_sync_ms
FROM user_events
WHERE event_name IN ('cloud_sync_completed', 'cloud_sync_failed')
GROUP BY day ORDER BY day;
```

#### 2B. Metabase (Optional — free, self-hosted or cloud)

Connect Metabase to your Supabase Postgres for visual charts:
- Install: metabase.com → Connect to Supabase (Postgres connection string)
- Build dashboards from the SQL queries above
- Share dashboard link with co-founders / beta team
- Set up automatic weekly email digest from Metabase

---

### PHASE 3 — AI Feedback Loop (Week 2)

This is where tracked data **improves the product automatically**.

#### 3A. userModel Auto-Update from Events

Currently `userModel` is updated only from onboarding + settings. Extend it to update from real usage patterns:

```typescript
// Run this as a Supabase Edge Function or server-side cron (weekly)

// Update tilt thresholds from real data
const recentViolations = await supabase
  .from('user_events')
  .select('event_properties, timestamp_utc')
  .eq('user_id', userId)
  .eq('event_name', 'rule_violated_flagged')
  .gte('timestamp_utc', sevenDaysAgo);

// If user violated >3 rules in sessions after a loss trade → raise tilt sensitivity
const tiltPattern = detectTiltPattern(recentViolations);
if (tiltPattern.detected) {
  await updateUserModel(userId, { 
    tilt_threshold: tiltPattern.suggested_threshold,
    model_updated_at: new Date().toISOString()
  });
}

// Update best/worst time windows from compliance data
const sessionGrades = await getSessionGradesByTimeWindow(userId);
const bestWindow = sessionGrades.sort((a,b) => b.avg_grade - a.avg_grade)[0];
await updateUserModel(userId, { best_time_window: bestWindow.window });

// Update dominant weakness from rule violation frequency
const topViolatedRule = recentViolations.groupBy('rule_id').sort()[0];
await updateUserModel(userId, { dominant_weakness: topViolatedRule.category });
```

#### 3B. Personalized Coach Message Routing

Use tracked `coach_message_dismissed` data to stop sending ineffective messages:

```typescript
// Before showing any coach message, check dismiss history
const dismissedTypes = await getUserDismissedMessageTypes(userId);
// If user dismissed 'warning' tone 5+ times → switch to 'data' tone
// If user dismissed AI insights 3+ times in a row → pause for 24h
const preferredTone = dismissedTypes.warning > 5 ? 'data' : 'encouragement';
```

#### 3C. Pattern Insight Quality Loop

Track `pattern_insight_shown` + whether user acted on it:
- If `pattern.confidence` < 0.6 → filter from UI automatically
- If user consistently dismisses insights from a specific `agent_source` → deprioritize that agent
- Feed accuracy back into prompt tuning

---

### PHASE 4 — Retention Engine (Week 2–3)

Trigger automated actions based on event patterns.

#### 4A. Event-Driven Triggers (Supabase Edge Functions + pg_cron)

```
TRIGGER 1: Re-engagement
─────────────────────────
Condition: user has NOT had session_pre_plan_completed 
           for 3+ consecutive days
Action: Send email "Your trading streak is at risk"
Frequency: Check daily at 8am IST via pg_cron

TRIGGER 2: Milestone celebration  
─────────────────────────
Condition: streak_milestone_reached fires (7, 14, 30 days)
Action: Show in-app celebration modal + optional share card
Immediate: Yes — real-time via Supabase Realtime or on next login

TRIGGER 3: Tilt early warning
─────────────────────────
Condition: 2+ rule_violated_flagged events in same session_date
Action: Show risk_alert in UI with severity: "high"
Immediate: Yes — trigger from client-side event count check

TRIGGER 4: Feature nudge
─────────────────────────
Condition: user has 0 playbook_created events after 7 days
Action: In-app tooltip nudge on Playbooks tab
Frequency: Once per user, 7 days after signup

TRIGGER 5: AI coaching tune
─────────────────────────
Condition: user has dismissed coach messages 5+ times in 7 days
Action: Switch coach tone from 'encouragement' to 'data'
        Update userModel.coaching_preference automatically
```

#### 4B. Beta Feedback Loop (Critical for Product)

```
WEEKLY BETA REPORT (auto-generated every Monday):
──────────────────────────────────────────────────
For each beta user:
  - Features used this week (from event_name counts)
  - Features NEVER used (from feature_first_use gaps)
  - Longest idle streak (from idle_detected)
  - AI parse acceptance rate
  - Rule compliance trend

Aggregate:
  - Top 3 most used features
  - Top 3 features with 0 usage (consider removing or fixing UX)
  - Onboarding step with highest drop-off
  - Most common rule violation category

Delivery: Supabase → Resend email → weekly digest to your inbox
```

---

### PHASE 5 — docs/DATA_INVENTORY.md Update (Week 3)

Update your data inventory doc to include the new tracking layer for legal/beta reviewers:

```markdown
## user_events table (added May 2026)

Stores all behavioral and interaction events from the app.

What is collected:
- Every page view, feature interaction, trade action, rule event
- AI coaching interactions (messages shown/dismissed, parse quality)
- Session and engagement patterns (time-on-page, scroll depth)
- Device type, browser, approximate geolocation (IP-based, not GPS)
- Anonymous ID (persists per device) and session ID (per tab)

What is NOT collected:
- Passwords, tokens, raw PII
- Precise GPS location
- Email addresses in event payloads (only UUID used)

Consent:
- Functional events (auth, trades, rules): always collected
- Engagement events (scroll, idle, rage click): only with analytics_consent = true

Retention: Events retained for 12 months, then archived/deleted.

User rights: Account deletion removes all rows WHERE user_id = your UUID.
```

---

## PART 4 — MASTER EXECUTION PROMPT

Paste this into Cursor/Lovable after the Fix Prompt is done:

---

```
TASK: After all 19/19 tracking fixes are confirmed working, implement 
the data activation layer for Perfect Trader. Work through each phase:

─────────────────────────────────────────────────
PHASE A — PRODUCTION VERIFICATION
─────────────────────────────────────────────────
1. Confirm user_events table exists in Supabase cloud (not just repo).
   If not: run supabase/migrations/20260325000000_user_events.sql in SQL Editor.

2. Add user_events migration reference to docs/supabase/APPLY_SCHEMA.sql.

3. Test live data flow:
   - Open app → perform 3 actions (click tab, open modal, create/edit anything)
   - Query: SELECT * FROM user_events ORDER BY created_at DESC LIMIT 5;
   - Confirm rows appear with correct user_id, event_name, timestamp_utc, geo_city

─────────────────────────────────────────────────
PHASE B — SUPABASE SQL DASHBOARD QUERIES
─────────────────────────────────────────────────
Create a new file: docs/analytics/SAVED_QUERIES.sql

Add all 10 admin queries to this file (DAU, onboarding funnel, feature 
adoption, AI coaching effectiveness, AI parse quality, rule violations, 
rage clicks, session depth, geo distribution, sync health).

Save each as a named query in Supabase SQL Editor with the name format:
"pt_[query_name]" — e.g. "pt_daily_active_users", "pt_onboarding_funnel"

─────────────────────────────────────────────────
PHASE C — AI FEEDBACK LOOP (userModel auto-update)
─────────────────────────────────────────────────
Create: supabase/functions/update-user-model/index.ts

This Edge Function runs weekly (or triggered manually) and:
1. Reads recent user_events for each user (last 30 days)
2. Detects tilt pattern: 2+ rule_violated_flagged after a losing trade in same day
   → update userModel.tilt_threshold in trader_snapshots
3. Detects coaching preference: if coach_message_dismissed count > 5 in 7 days
   → update userModel.coaching_preference to 'data' (from 'encouragement')
4. Detects dominant weakness: most violated rule_category in last 30 days
   → update userModel.dominant_weakness
5. Detects best/worst session window: sessions with highest compliance score
   → update userModel.best_time_window / worst_time_window
6. Set model_updated_at = now() after any update

Deploy: npx supabase functions deploy update-user-model

─────────────────────────────────────────────────
PHASE D — RETENTION TRIGGERS
─────────────────────────────────────────────────
Create: supabase/functions/retention-check/index.ts

Implement these 5 triggers:

TRIGGER 1 — Re-engagement email:
  Query: find users with no session_pre_plan_completed in last 3 days
  Action: send via Resend API — subject: "Your trading discipline streak needs you"
  Template: include their last streak count from streak_milestone_reached events

TRIGGER 2 — Tilt early warning (client-side):
  In context.tsx, after any rule_violated_flagged event:
  Count violations for today's session_date from local state
  If count >= 2 → dispatch a RiskAlert with severity "high" and 
  message: "You've violated 2+ rules today. Consider pausing."
  Track: risk_alert_shown with severity: "high", alert_type: "tilt_warning"

TRIGGER 3 — Feature nudge (client-side, one-time):
  In TrackingProvider.tsx, on app_loaded:
  Check localStorage key 'pt_nudge_playbooks_shown'
  If not set AND user has 0 playbooks AND days_since_signup >= 7:
    Show tooltip on Playbooks tab with text "Try creating your first playbook"
    Set localStorage 'pt_nudge_playbooks_shown' = true
    Track: feature_discovery_path with feature_name: 'playbooks', discovery_method: 'nudge'

TRIGGER 4 — Streak milestone celebration:
  In context.tsx or streak calculation logic:
  When streak count hits 3, 7, 14, 30, 50, 100:
    Show in-app modal: "🔥 X Day Streak! Your discipline is compounding."
    Track: streak_milestone_reached with streak_days: X, milestone: X

TRIGGER 5 — AI coaching auto-tune:
  In the coach message display component:
  Keep a running count in localStorage: 'pt_coach_dismiss_count' (last 7 days)
  If count >= 5 → update userModel.coaching_preference = 'data'
  and call cloud sync with updated snapshot

Schedule retention-check to run daily via pg_cron:
  SELECT cron.schedule('retention-daily', '0 3 * * *', 
    $$SELECT net.http_post(url:='YOUR_EDGE_FUNCTION_URL/retention-check')$$);

─────────────────────────────────────────────────
PHASE E — BETA WEEKLY REPORT
─────────────────────────────────────────────────
Create: supabase/functions/weekly-beta-report/index.ts

Runs every Monday at 9am IST. Generates and emails a report containing:

PER-USER section:
  - Features used this week (top 5 event_names by count)
  - Features with 0 events this week (compare against full event list)
  - AI parse acceptance rate (trade_ai_parse_accepted / trade_ai_parsed)
  - Rule compliance rate (rule_followed_flagged / (rule_followed + rule_violated))
  - Session count and avg session duration

AGGREGATE section:
  - Total DAU for the week
  - Onboarding funnel: step with highest drop-off
  - Top 3 features by unique users
  - Bottom 3 features with 0 usage (candidates for UX fix or removal)
  - Most common rule violation category
  - AI coaching dismiss rate by tone (which tone users ignore most)

Send via Resend API to your email address.
Schedule: SELECT cron.schedule('weekly-report', '0 3 * * 1', ...)

─────────────────────────────────────────────────
PHASE F — DATA INVENTORY UPDATE
─────────────────────────────────────────────────
Update docs/DATA_INVENTORY.md to add:

Section: "Behavioral Event Tracking (user_events table)"
Include:
  - What is collected (functional events always; engagement events consent-gated)
  - What is NOT collected (passwords, GPS, email in payloads)
  - Retention policy: 12 months, then DELETE WHERE timestamp_utc < NOW() - INTERVAL '12 months'
  - User rights: full deletion on account delete request
  - How data improves the product (userModel feedback loop)

─────────────────────────────────────────────────
VERIFICATION CHECKLIST
─────────────────────────────────────────────────
After all phases, confirm:
  ✅ user_events rows visible in Supabase dashboard for real interactions
  ✅ All 10 saved queries return data (not empty) after a few sessions
  ✅ update-user-model Edge Function deploys without error
  ✅ retention-check Edge Function deploys without error  
  ✅ weekly-beta-report Edge Function deploys without error
  ✅ pg_cron schedules created (SELECT * FROM cron.job to verify)
  ✅ docs/DATA_INVENTORY.md updated
  ✅ docs/analytics/SAVED_QUERIES.sql committed to repo
  ✅ Tilt warning fires in UI when 2 rules violated in same session
  ✅ Coach dismiss counter increments in localStorage
```
