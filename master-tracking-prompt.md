# 🎯 Master User Tracking & Analytics Prompt
## Perfect Trader App — Full Event Collection Layer

> **Purpose:** This is the master system prompt / engineering specification for implementing exhaustive user data and interaction tracking across the entire Perfect Trader app. Every event, action, state change, navigation step, and behavioral signal must be captured with full metadata including timestamp, geolocation, session, and device context.

---

## SECTION 1 — TRACKING PHILOSOPHY & PRINCIPLES

You are implementing a **complete behavioral analytics and interaction tracking system** for a trading psychology web app. The goals are:

1. **Capture everything** — every click, input, navigation, state change, error, AI interaction, and passive behavior
2. **Never block the UI** — all tracking is fire-and-forget async (non-blocking)
3. **Timestamp every event** — ISO 8601 UTC timestamp on every event, plus local timezone offset
4. **Enrich every event** — attach session ID, user ID, device fingerprint, and geo context automatically
5. **Respect consent** — all tracking beyond functional data requires cookie/analytics consent flag check
6. **Privacy-safe** — never log raw passwords, full card numbers, or PII beyond what the user explicitly provided
7. **Idempotent writes** — use `event_id` (UUID v4) on every event to prevent duplicate inserts

---

## SECTION 2 — UNIVERSAL EVENT ENVELOPE

Every tracked event — regardless of type — must be wrapped in this envelope before storage:

```typescript
interface TrackingEvent {
  // Identity
  event_id: string;           // UUID v4 — unique per event
  user_id: string | null;     // Supabase UUID or null if anonymous
  session_id: string;         // UUID v4, generated at tab open, persists in sessionStorage
  anonymous_id: string;       // UUID v4, generated once, persists in localStorage forever

  // Event core
  event_name: string;         // e.g. "trade_created", "rule_violated", "page_viewed"
  event_category: EventCategory; // see Section 3
  event_properties: Record<string, unknown>; // event-specific payload

  // Timestamps
  timestamp_utc: string;      // ISO 8601 UTC — e.g. "2026-05-23T08:15:30.123Z"
  timestamp_local: string;    // ISO 8601 local — e.g. "2026-05-23T13:45:30.123+05:30"
  timezone: string;           // IANA tz — e.g. "Asia/Kolkata"
  timezone_offset: number;    // minutes offset from UTC — e.g. 330

  // Page / route
  page_path: string;          // e.g. "/dashboard/today"
  page_title: string;         // document.title at event time
  referrer: string | null;    // document.referrer

  // Session context
  session_start_utc: string;  // when this session began
  session_duration_ms: number; // ms since session start at event time
  page_view_count: number;    // how many pages viewed this session
  event_sequence: number;     // incrementing counter within session

  // Device & browser
  device_type: "desktop" | "mobile" | "tablet";
  os: string;                 // e.g. "Windows 11", "Android 14", "iOS 17"
  browser: string;            // e.g. "Chrome 124"
  browser_version: string;
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  device_pixel_ratio: number;
  is_pwa: boolean;            // window.matchMedia("(display-mode: standalone)").matches
  is_touch: boolean;          // "ontouchstart" in window
  connection_type: string | null; // "4g", "wifi", "offline" via Network Information API
  connection_downlink: number | null; // Mbps

  // Geolocation (IP-based, no GPS prompt needed)
  geo_country: string | null;       // "IN"
  geo_country_name: string | null;  // "India"
  geo_region: string | null;        // "MH"
  geo_region_name: string | null;   // "Maharashtra"
  geo_city: string | null;          // "Nagpur"
  geo_lat: number | null;           // approx from IP
  geo_lon: number | null;           // approx from IP
  geo_isp: string | null;           // Internet provider name

  // App state snapshot
  app_version: string;        // e.g. "1.1.0"
  schema_version: string;     // e.g. "1.1.0"
  is_online: boolean;         // navigator.onLine
  has_active_trade_session: boolean;
  current_rule_count: number;
  current_trade_count_today: number;

  // Consent & flags
  analytics_consent: boolean; // from cookie consent
  is_beta_user: boolean;
  is_pro_user: boolean;
  is_admin: boolean;
}
```

---

## SECTION 3 — EVENT CATEGORIES & ALL EVENTS TO TRACK

### 3.1 AUTH EVENTS (`category: "auth"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `auth_page_viewed` | /auth or /login page loads | - |
| `signup_started` | User clicks "Sign up" | `method: "email"\|"google"\|"github"` |
| `signup_completed` | Supabase auth success | `method`, `has_display_name` |
| `signup_failed` | Auth error | `method`, `error_code`, `error_message` |
| `login_started` | Login form submitted | `method` |
| `login_completed` | Session established | `method`, `is_returning_user` |
| `login_failed` | Auth error | `method`, `error_code` |
| `logout_triggered` | User clicks logout | `session_duration_ms` |
| `password_reset_requested` | Forgot password submitted | - |
| `oauth_redirect_initiated` | OAuth flow starts | `provider: "google"\|"github"` |
| `oauth_callback_received` | OAuth returns | `provider`, `success: boolean` |
| `session_expired` | Token refresh fails silently | `last_active_ms_ago` |
| `session_restored` | Session resumed from cookie | `was_offline: boolean` |

---

### 3.2 ONBOARDING EVENTS (`category: "onboarding"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `onboarding_started` | First onboarding screen shown | `is_first_ever_session` |
| `onboarding_step_viewed` | Each screen rendered | `step_index`, `step_name`, `time_on_prev_step_ms` |
| `onboarding_step_completed` | User advances | `step_index`, `step_name`, `answers_given` |
| `onboarding_step_back` | User goes back | `from_step`, `to_step` |
| `onboarding_answer_changed` | User edits an answer | `question_id`, `old_value`, `new_value` |
| `onboarding_quiz_completed` | All steps done | `total_time_ms`, `trading_style`, `experience`, `primary_market`, `primary_constraint`, `goal_level`, `risk_per_trade`, `time_window` |
| `onboarding_skipped` | User skips (if allowed) | `last_step_reached` |
| `onboarding_resumed` | Returning to incomplete onboarding | `last_completed_step` |

---

### 3.3 NAVIGATION EVENTS (`category: "navigation"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `page_viewed` | Every route change | `path`, `title`, `from_path`, `nav_method: "click"\|"back"\|"forward"\|"direct"` |
| `tab_switched` | Bottom nav tab click | `from_tab`, `to_tab` |
| `modal_opened` | Any modal/dialog opens | `modal_id`, `trigger_element` |
| `modal_closed` | Modal dismissed | `modal_id`, `dismiss_method: "button"\|"backdrop"\|"escape"\|"action"`, `time_open_ms` |
| `drawer_opened` | Side drawer opens | `drawer_id` |
| `drawer_closed` | Drawer dismissed | `drawer_id`, `time_open_ms` |
| `tooltip_shown` | Tooltip displayed | `tooltip_id`, `element_type` |
| `external_link_clicked` | Link opens new tab | `destination_url`, `link_text` |
| `back_navigation` | Browser back used | `from_path`, `to_path` |
| `deep_link_opened` | App opened via URL with params | `path`, `query_params` |
| `pwa_installed` | User installs PWA | - |
| `pwa_opened` | App launched as standalone PWA | - |

---

### 3.4 RULES EVENTS (`category: "rules"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `rule_created` | New rule saved | `rule_id`, `rule_category`, `has_emoji`, `text_length` |
| `rule_edited` | Rule text updated | `rule_id`, `field_changed`, `old_text_length`, `new_text_length` |
| `rule_deleted` | Rule removed | `rule_id`, `rule_age_days`, `times_violated_before_delete` |
| `rule_toggled_active` | Active/inactive toggled | `rule_id`, `new_state` |
| `rule_violated_flagged` | User marks rule as violated | `rule_id`, `trade_id`, `session_date` |
| `rule_followed_flagged` | User marks rule as followed | `rule_id`, `trade_id` |
| `rule_reordered` | Drag-and-drop reorder | `rule_id`, `old_position`, `new_position` |
| `rule_locked_for_session` | Rule locked in Today tab | `rule_id`, `session_date` |
| `rule_category_assigned` | Category tag added | `rule_id`, `category` |
| `rules_bulk_action` | Multi-select action | `action_type`, `rule_count` |

---

### 3.5 PLAYBOOK EVENTS (`category: "playbooks"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `playbook_created` | New playbook saved | `playbook_id`, `has_description`, `linked_rule_count`, `has_criteria` |
| `playbook_edited` | Any field updated | `playbook_id`, `fields_changed[]` |
| `playbook_deleted` | Playbook removed | `playbook_id`, `playbook_age_days` |
| `playbook_viewed` | Detail view opened | `playbook_id`, `view_duration_ms` |
| `playbook_linked_to_trade` | Attached to a trade | `playbook_id`, `trade_id` |
| `playbook_win_rate_updated` | Win rate manually set | `playbook_id`, `old_value`, `new_value` |
| `playbook_criteria_expanded` | "More" expanded | `playbook_id` |

---

### 3.6 TRADE JOURNAL EVENTS (`category: "trades"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `trade_form_opened` | Add/edit trade form shown | `form_mode: "new"\|"edit"`, `trigger: "button"\|"ai_parse"\|"voice"` |
| `trade_field_focused` | Input field tapped/clicked | `field_name`, `trade_id\|null` |
| `trade_field_changed` | Any field value changes | `field_name`, `field_type`, `has_value: boolean` |
| `trade_created` | New trade saved | `trade_id`, `symbol`, `direction`, `has_pnl`, `has_emotion`, `has_setup_link`, `rules_followed_count`, `rules_broken_count`, `r_multiple`, `pnl_value`, `entry_price`, `exit_price`, `planned_sl`, `actual_sl`, `mood_before`, `mood_after`, `emotion_tags[]`, `session_date` |
| `trade_edited` | Trade fields updated | `trade_id`, `fields_changed[]` |
| `trade_deleted` | Trade removed | `trade_id`, `trade_age_hours` |
| `trade_duplicated` | Trade copied | `source_trade_id`, `new_trade_id` |
| `trade_ai_parsed` | AI parse-trade invoked | `input_method: "text"\|"voice"\|"photo"`, `note_length`, `ai_confidence`, `fields_extracted[]`, `latency_ms` |
| `trade_ai_parse_accepted` | User accepts AI result | `trade_id`, `fields_overridden[]` |
| `trade_ai_parse_rejected` | User discards AI result | `reason\|null` |
| `trade_emotion_tagged` | Emotion label selected | `trade_id`, `emotion`, `is_post_trade: boolean` |
| `trade_filter_applied` | Journal filtered | `filter_type`, `filter_value` |
| `trade_sort_changed` | Sort order changed | `sort_field`, `sort_direction` |
| `trade_detail_viewed` | Single trade detail opened | `trade_id`, `view_duration_ms` |

---

### 3.7 TODAY / SESSION EVENTS (`category: "session"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `session_pre_plan_started` | Pre-session form opened | `session_date` |
| `session_pre_plan_completed` | Pre-plan saved | `session_date`, `emotional_baseline`, `rules_locked_count`, `time_to_complete_ms` |
| `session_pre_plan_skipped` | Skipped | `session_date` |
| `session_post_note_added` | Post-session note written | `session_date`, `note_length`, `time_after_session_end_ms` |
| `session_stability_score_viewed` | Score widget seen | `session_date`, `score` |
| `session_trade_count_changed` | Trades allowed count changed | `session_date`, `old_value`, `new_value` |
| `session_emotional_check_done` | Mid-session check-in | `session_date`, `emotion`, `check_type` |
| `session_daily_grade_viewed` | Grade card opened | `session_date`, `grade`, `compliance_score` |

---

### 3.8 DAILY LOG / STREAK EVENTS (`category: "logs"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `daily_log_viewed` | Log entry opened | `log_date`, `grade`, `pnl` |
| `daily_log_edited` | Log entry modified | `log_date`, `fields_changed[]` |
| `streak_milestone_reached` | Streak counter hits milestone | `streak_days`, `milestone: 3\|7\|14\|30\|50\|100` |
| `streak_broken` | Streak resets | `previous_streak_days` |
| `compliance_score_drop` | Score drops significantly | `log_date`, `prev_score`, `new_score`, `delta` |
| `grade_improved` | Grade improves vs yesterday | `from_grade`, `to_grade`, `session_date` |
| `market_event_linked` | Event linked to log | `log_date`, `event_id`, `event_type` |

---

### 3.9 ANALYTICS VIEWS (`category: "analytics"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `analytics_tab_viewed` | Analytics section opened | `sub_section`, `time_range` |
| `analytics_chart_interacted` | Chart hovered/tapped | `chart_id`, `chart_type`, `data_point_date` |
| `analytics_time_range_changed` | Date range filter changed | `from_range`, `to_range` |
| `analytics_metric_expanded` | Metric detail opened | `metric_name` |
| `analytics_export_triggered` | Export button clicked | `export_type: "json"\|"csv"`, `data_scope` |
| `analytics_export_completed` | File downloaded | `export_type`, `record_count`, `file_size_bytes` |
| `indiscipline_cost_viewed` | Indiscipline cost widget seen | `cost_value`, `currency` |
| `behavioral_trend_viewed` | Trend card seen | `trend_direction`, `consistency_days` |

---

### 3.10 AI / COACHING EVENTS (`category: "ai"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `coach_message_shown` | CoachMessage rendered | `message_type`, `tone`, `priority`, `is_generated_now\|cached` |
| `coach_message_dismissed` | User dismisses coach card | `message_type`, `time_shown_ms` |
| `coach_message_action_clicked` | CTA in coach message clicked | `message_type`, `action_label` |
| `pattern_insight_shown` | PatternInsight rendered | `pattern`, `confidence`, `agent_source` |
| `risk_alert_shown` | RiskAlert displayed | `severity`, `alert_type` |
| `risk_alert_action_taken` | User responds to alert | `severity`, `action_taken` |
| `ai_diary_scan_started` | Photo/voice/text scan initiated | `scan_type: "photo"\|"voice"\|"text"\|"checklist"` |
| `ai_diary_scan_completed` | Extraction result returned | `scan_type`, `confidence`, `fields_extracted[]`, `latency_ms`, `has_image: boolean` |
| `ai_diary_scan_failed` | Extraction error | `scan_type`, `error_type` |
| `user_model_updated` | userModel fields synced | `fields_updated[]`, `update_source: "onboarding"\|"settings"\|"usage"` |
| `coaching_preference_set` | User sets input preference | `preference: "data"\|"encouragement"\|"warnings"\|"voice"\|"text"` |

---

### 3.11 PSYCHOLOGY / DIARY EVENTS (`category: "psychology"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `diary_entry_opened` | Diary UI opened | - |
| `diary_entry_created` | New entry saved | `entry_date`, `input_method`, `has_image`, `text_length`, `emotion_tags[]` |
| `diary_entry_edited` | Entry updated | `entry_date`, `fields_changed[]` |
| `diary_entry_deleted` | Entry removed | `entry_date`, `entry_age_days` |
| `mood_baseline_set` | Mood set pre-session | `mood_value`, `session_date` |
| `tilt_flag_triggered` | Tilt threshold hit | `tilt_type: "revenge"\|"fomo"\|"overconfidence"`, `trigger_event` |
| `persona_sheet_opened` | Trader persona settings opened | `time_since_last_update_days` |
| `persona_sheet_updated` | Any persona field changed | `fields_changed[]` |
| `observation_created` | New observation saved | `observation_date`, `title_length`, `content_length` |
| `observation_state_changed` | State updated | `observation_id`, `old_state`, `new_state` |

---

### 3.12 MARKET CALENDAR EVENTS (`category: "calendar"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `calendar_viewed` | Calendar tab opened | `current_week_event_count` |
| `calendar_event_clicked` | Event detail opened | `event_id`, `event_type`, `event_impact`, `days_until_event` |
| `calendar_filter_changed` | Filter by country/impact | `filter_type`, `filter_value` |
| `calendar_week_navigated` | Week changed | `direction: "prev"\|"next"`, `new_week_start` |
| `calendar_event_reminder_set` | Reminder toggled | `event_id`, `reminder_minutes_before` |

---

### 3.13 SETTINGS EVENTS (`category: "settings"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `settings_opened` | Settings page viewed | `entry_point` |
| `settings_section_viewed` | Sub-section opened | `section_name` |
| `settings_saved` | Any setting saved | `setting_key`, `old_value_type`, `new_value_type` |
| `theme_changed` | Dark/light toggle | `old_theme`, `new_theme` |
| `notification_preference_changed` | Notifications toggled | `notification_type`, `new_state` |
| `data_export_requested` | JSON export clicked | - |
| `local_cache_cleared` | "Clear device data" clicked | `data_size_estimate_kb` |
| `account_delete_requested` | Delete account flow started | `confirmation_method` |
| `beta_waitlist_joined` | Email submitted on /beta | `submission_method: "modal"\|"page"` |
| `pricing_timer_viewed` | Pricing countdown shown | `timer_remaining_seconds` |
| `cookie_consent_shown` | Banner appears | `is_first_time` |
| `cookie_consent_accepted` | User accepts analytics | - |
| `cookie_consent_rejected` | User declines analytics | - |

---

### 3.14 PERFORMANCE & ERROR EVENTS (`category: "technical"`)

| Event Name | Trigger | Key Properties |
|---|---|---|
| `app_loaded` | App fully hydrated | `load_time_ms`, `time_to_first_interactive_ms`, `cached_data_loaded: boolean` |
| `cloud_sync_triggered` | Debounced save fires | `trigger_source`, `data_size_bytes` |
| `cloud_sync_completed` | Snapshot saved to Supabase | `latency_ms`, `schema_version` |
| `cloud_sync_failed` | Save error | `error_code`, `retry_count` |
| `offline_mode_entered` | navigator.onLine → false | `last_sync_ms_ago` |
| `offline_mode_exited` | Back online | `offline_duration_ms`, `pending_sync_count` |
| `local_storage_quota_near` | >80% localStorage used | `used_bytes`, `quota_bytes` |
| `api_call_made` | Any /api/* call | `endpoint`, `method`, `latency_ms`, `status_code` |
| `api_call_failed` | Non-2xx response | `endpoint`, `status_code`, `error_message` |
| `js_error_caught` | window.onerror / unhandledRejection | `error_name`, `error_message`, `stack_trace_hash`, `component_name` |
| `rls_policy_blocked` | Supabase RLS deny | `table`, `operation` |
| `beta_capacity_checked` | RPC capacity check called | `current`, `max`, `remaining` |
| `pwa_update_available` | New SW version detected | `current_version`, `new_version` |
| `pwa_update_accepted` | User accepts reload | - |

---

### 3.15 ENGAGEMENT / PASSIVE EVENTS (`category: "engagement"`) — consent-gated

| Event Name | Trigger | Key Properties |
|---|---|---|
| `scroll_depth_reached` | 25/50/75/100% scroll | `page_path`, `depth_percent` |
| `time_on_page` | Heartbeat every 30s on active tab | `page_path`, `active_seconds`, `total_seconds_on_page` |
| `idle_detected` | No interaction for 3+ min | `idle_duration_ms`, `last_active_path` |
| `session_focus_changed` | Tab visibility changes | `new_state: "visible"\|"hidden"`, `time_away_ms\|null` |
| `rage_click_detected` | 3+ rapid clicks same element | `element_id`, `click_count`, `page_path` |
| `copy_triggered` | User copies text | `element_context`, `text_length` |
| `search_used` | In-app search invoked | `query_length`, `results_count` |
| `help_accessed` | Help link/tooltip opened | `help_item_id` |
| `feature_first_use` | First time using a feature | `feature_name` |
| `feature_discovery_path` | How user found a feature | `feature_name`, `discovery_method` |

---

## SECTION 4 — STORAGE ARCHITECTURE

### 4.1 New Supabase Table: `user_events`

```sql
CREATE TABLE user_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid NOT NULL UNIQUE,               -- idempotency key
  user_id         uuid REFERENCES auth.users(id),     -- nullable for anonymous
  anonymous_id    text NOT NULL,
  session_id      text NOT NULL,
  event_name      text NOT NULL,
  event_category  text NOT NULL,
  event_properties jsonb DEFAULT '{}',

  -- Time
  timestamp_utc   timestamptz NOT NULL,
  timezone        text,
  timezone_offset int,

  -- Page
  page_path       text,
  page_title      text,

  -- Device
  device_type     text,
  os              text,
  browser         text,
  screen_width    int,
  screen_height   int,
  is_pwa          boolean,
  is_touch        boolean,
  connection_type text,

  -- Geo
  geo_country     text,
  geo_region      text,
  geo_city        text,
  geo_lat         float,
  geo_lon         float,

  -- App
  app_version     text,
  is_online       boolean,
  analytics_consent boolean DEFAULT false,
  is_beta_user    boolean DEFAULT false,

  -- Session
  session_start_utc timestamptz,
  session_duration_ms bigint,
  event_sequence  int,

  created_at      timestamptz DEFAULT now()
);

-- Indexes for fast querying
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_event_name ON user_events(event_name);
CREATE INDEX idx_user_events_timestamp ON user_events(timestamp_utc DESC);
CREATE INDEX idx_user_events_session ON user_events(session_id);
CREATE INDEX idx_user_events_category ON user_events(event_category);
```

### 4.2 RLS Policy

```sql
-- Users can only see their own events
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_events_own" ON user_events
  FOR ALL USING (auth.uid() = user_id);

-- Service role (your backend/admin) can see all
```

### 4.3 Batching Strategy

- Buffer events client-side in memory array
- Flush to Supabase every **10 seconds** OR when buffer hits **20 events**
- On `visibilitychange` (tab close/hide) → flush immediately via `navigator.sendBeacon`
- On offline → persist buffer to `localStorage` key `pt_event_queue` → replay on reconnect

---

## SECTION 5 — GEO ENRICHMENT

Use IP-based geo (no GPS prompt). Call once per session, cache in sessionStorage:

```typescript
// Call on session init — lightweight, ~50ms
const geoData = await fetch('https://ipapi.co/json/').then(r => r.json());
// OR use your own Supabase Edge Function to avoid CORS + cache it

sessionStorage.setItem('pt_geo', JSON.stringify({
  country: geoData.country_code,       // "IN"
  country_name: geoData.country_name,  // "India"
  region: geoData.region_code,         // "MH"
  region_name: geoData.region,         // "Maharashtra"
  city: geoData.city,                  // "Nagpur"
  lat: geoData.latitude,
  lon: geoData.longitude,
  isp: geoData.org,
  timezone: geoData.timezone,          // "Asia/Kolkata"
}));
```

---

## SECTION 6 — TRACKING UTILITY IMPLEMENTATION

### 6.1 Core `track()` function

```typescript
// lib/analytics/track.ts

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { getGeoData } from './geo';
import { getDeviceInfo } from './device';
import { getSessionContext } from './session';

const EVENT_BUFFER: TrackingEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

export function track(
  eventName: string,
  category: EventCategory,
  properties: Record<string, unknown> = {}
): void {
  const consent = localStorage.getItem('perfect_trader_cookie_consent') === 'true';
  const isEngagementEvent = category === 'engagement';

  // Block engagement/passive events if no consent
  if (isEngagementEvent && !consent) return;

  const geo = getGeoData();       // from sessionStorage cache
  const device = getDeviceInfo(); // memoized
  const session = getSessionContext(); // from sessionStorage

  const event: TrackingEvent = {
    event_id: uuidv4(),
    user_id: getCurrentUserId() ?? null,
    session_id: session.session_id,
    anonymous_id: getOrCreateAnonymousId(),
    event_name: eventName,
    event_category: category,
    event_properties: properties,

    timestamp_utc: new Date().toISOString(),
    timestamp_local: new Date().toLocaleString('sv').replace(' ', 'T'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: -new Date().getTimezoneOffset(),

    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || null,

    session_start_utc: session.start_utc,
    session_duration_ms: Date.now() - session.start_ms,
    page_view_count: session.page_view_count,
    event_sequence: session.incrementSequence(),

    ...device,
    ...geo,

    app_version: APP_VERSION,
    schema_version: SCHEMA_VERSION,
    is_online: navigator.onLine,
    has_active_trade_session: getActiveSessionFlag(),
    current_rule_count: getRuleCount(),
    current_trade_count_today: getTodayTradeCount(),

    analytics_consent: consent,
    is_beta_user: getIsBeta(),
    is_pro_user: getIsPro(),
    is_admin: getIsAdmin(),
  };

  EVENT_BUFFER.push(event);

  // Auto-flush when buffer is large
  if (EVENT_BUFFER.length >= 20) flushEvents();
}

// Flush buffer to Supabase
async function flushEvents(): Promise<void> {
  if (EVENT_BUFFER.length === 0) return;
  const toFlush = EVENT_BUFFER.splice(0, EVENT_BUFFER.length);

  try {
    const supabase = getSupabaseClient();
    await supabase.from('user_events').insert(toFlush);
  } catch {
    // On failure: re-queue into localStorage for offline replay
    const stored = JSON.parse(localStorage.getItem('pt_event_queue') ?? '[]');
    localStorage.setItem('pt_event_queue', JSON.stringify([...stored, ...toFlush]));
  }
}

// Flush every 10 seconds
if (typeof window !== 'undefined') {
  flushTimer = setInterval(flushEvents, 10_000);

  // Flush on tab close/hide (sendBeacon for reliability)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      const json = JSON.stringify(EVENT_BUFFER.splice(0));
      navigator.sendBeacon('/api/track-flush', json);
    }
  });

  // Replay offline queue on reconnect
  window.addEventListener('online', async () => {
    const queue = JSON.parse(localStorage.getItem('pt_event_queue') ?? '[]');
    if (queue.length > 0) {
      localStorage.removeItem('pt_event_queue');
      const supabase = getSupabaseClient();
      await supabase.from('user_events').insert(queue);
    }
  });
}
```

---

## SECTION 7 — WHERE TO CALL `track()` IN THE APP

### React Router / Next.js — page views
```typescript
// In your root layout or router listener
router.events.on('routeChangeComplete', (url) => {
  track('page_viewed', 'navigation', {
    path: url,
    title: document.title,
    from_path: previousPath,
  });
});
```

### Trade creation
```typescript
// After successful trade save
track('trade_created', 'trades', {
  trade_id: newTrade.id,
  symbol: newTrade.pair,
  direction: newTrade.direction,
  pnl_value: newTrade.pnl,
  r_multiple: newTrade.rMultiple,
  rules_followed_count: newTrade.rulesFollowed.length,
  rules_broken_count: newTrade.rulesBroken.length,
  mood_before: newTrade.moodBefore,
  mood_after: newTrade.moodAfter,
  has_emotion: !!newTrade.emotion,
  session_date: todayDate,
});
```

### Auth
```typescript
// After supabase.auth.signInWithPassword resolves
track('login_completed', 'auth', {
  method: 'email',
  is_returning_user: !isNewUser,
});
```

### AI Parse
```typescript
// After /api/parse-trade returns
track('trade_ai_parsed', 'ai', {
  input_method: inputType,
  note_length: rawNote.length,
  ai_confidence: result.confidence,
  fields_extracted: Object.keys(result.fields),
  latency_ms: Date.now() - callStart,
});
```

---

## SECTION 8 — ADMIN ANALYTICS QUERIES (Supabase SQL)

```sql
-- Daily Active Users
SELECT DATE(timestamp_utc) as day, COUNT(DISTINCT user_id) as dau
FROM user_events
WHERE timestamp_utc > NOW() - INTERVAL '30 days'
GROUP BY day ORDER BY day;

-- Most used features
SELECT event_name, COUNT(*) as count
FROM user_events
WHERE timestamp_utc > NOW() - INTERVAL '7 days'
GROUP BY event_name ORDER BY count DESC LIMIT 20;

-- Onboarding funnel
SELECT event_properties->>'step_name' as step, COUNT(DISTINCT user_id) as users
FROM user_events
WHERE event_name = 'onboarding_step_viewed'
GROUP BY step ORDER BY users DESC;

-- AI parse usage
SELECT DATE(timestamp_utc) as day,
       COUNT(*) as total_parses,
       AVG((event_properties->>'latency_ms')::int) as avg_latency_ms,
       AVG((event_properties->>'ai_confidence')::float) as avg_confidence
FROM user_events
WHERE event_name = 'trade_ai_parsed'
GROUP BY day ORDER BY day;

-- Session depth
SELECT session_id, MAX(event_sequence) as events_in_session,
       MAX(session_duration_ms) as session_duration_ms,
       COUNT(DISTINCT page_path) as pages_visited
FROM user_events
GROUP BY session_id ORDER BY events_in_session DESC LIMIT 100;

-- Geo breakdown
SELECT geo_country_name, geo_city, COUNT(DISTINCT user_id) as users
FROM user_events
WHERE user_id IS NOT NULL
GROUP BY geo_country_name, geo_city ORDER BY users DESC;

-- Rule violation patterns
SELECT event_properties->>'rule_id' as rule_id,
       COUNT(*) as violation_count,
       COUNT(DISTINCT user_id) as affected_users
FROM user_events
WHERE event_name = 'rule_violated_flagged'
GROUP BY rule_id ORDER BY violation_count DESC;
```

---

## SECTION 9 — PRIVACY & COMPLIANCE CHECKLIST

- [ ] All engagement/passive events are consent-gated (`analytics_consent = true`)
- [ ] No raw passwords, tokens, or secrets ever enter event payload
- [ ] PII fields (email, full name) are NOT in `event_properties` — only `user_id` UUID is used
- [ ] Geo is IP-derived approximate, not GPS
- [ ] Users can request event deletion via account delete flow → `DELETE FROM user_events WHERE user_id = $1`
- [ ] RLS ensures users cannot read other users' events
- [ ] `/privacy` page updated to mention behavioral event collection
- [ ] `docs/DATA_INVENTORY.md` updated with `user_events` table
- [ ] Beta users informed via onboarding that usage data is collected for product improvement

---

## SECTION 10 — QUICK IMPLEMENTATION CHECKLIST

```
Phase 1 — Foundation (Day 1–2)
  ✅ Create user_events table in Supabase with RLS
  ✅ Implement track() utility with buffering + flush
  ✅ Add geo enrichment on session init
  ✅ Add session context manager (session_id, sequence, start_time)
  ✅ Wire page_viewed on every route change

Phase 2 — Core Product Events (Day 3–5)
  ✅ Auth events (login, signup, logout)
  ✅ Trade CRUD events
  ✅ Rule CRUD + violation events
  ✅ Session/Today events
  ✅ Cloud sync events

Phase 3 — AI + Psychology Events (Day 6–7)
  ✅ AI parse events
  ✅ Coach message events
  ✅ Diary/capture events
  ✅ Tilt flag events

Phase 4 — Passive + Engagement (Day 8–9, consent-gated)
  ✅ Scroll depth
  ✅ Time-on-page heartbeat
  ✅ Idle detection
  ✅ Rage click detection

Phase 5 — Admin Dashboard (Day 10+)
  ✅ Supabase Studio queries
  ✅ Metabase / Grafana connection (optional)
  ✅ Weekly analytics email digest (optional)
```
