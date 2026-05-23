-- Perfect Trader — Admin analytics queries (Supabase SQL Editor)
-- Save each as a named query: pt_<name> (e.g. pt_daily_active_users)

-- 1. pt_daily_active_users — DAU last 30 days
SELECT DATE(timestamp_utc) AS day, COUNT(DISTINCT user_id) AS dau
FROM user_events
WHERE timestamp_utc > NOW() - INTERVAL '30 days'
  AND user_id IS NOT NULL
GROUP BY day
ORDER BY day;

-- 2. pt_onboarding_funnel — onboarding drop-off
SELECT
  event_properties->>'step_name' AS step,
  event_properties->>'step_index' AS step_num,
  COUNT(DISTINCT user_id) AS users_reached
FROM user_events
WHERE event_name = 'onboarding_step_viewed'
GROUP BY step, step_num
ORDER BY (event_properties->>'step_index')::int NULLS LAST;

-- 3. pt_feature_adoption — feature usage last 7 days
SELECT
  event_name,
  COUNT(*) AS total_events,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT session_id) AS sessions
FROM user_events
WHERE timestamp_utc > NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY unique_users DESC
LIMIT 30;

-- 4. pt_ai_coaching_effectiveness — coach dismiss rate by tone/type
SELECT
  event_properties->>'tone' AS tone,
  event_properties->>'message_type' AS msg_type,
  COUNT(*) FILTER (WHERE event_name = 'coach_message_shown') AS shown,
  COUNT(*) FILTER (WHERE event_name = 'coach_message_dismissed') AS dismissed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_name = 'coach_message_dismissed')
    / NULLIF(COUNT(*) FILTER (WHERE event_name = 'coach_message_shown'), 0),
    1
  ) AS dismiss_rate_pct
FROM user_events
WHERE event_name IN ('coach_message_shown', 'coach_message_dismissed')
GROUP BY tone, msg_type
ORDER BY shown DESC;

-- 5. pt_ai_parse_quality — AI trade parse confidence
SELECT
  DATE(timestamp_utc) AS day,
  COUNT(*) AS parses,
  AVG((event_properties->>'ai_confidence')::float) AS avg_confidence,
  AVG((event_properties->>'latency_ms')::int) AS avg_latency_ms,
  COUNT(*) FILTER (WHERE (event_properties->>'ai_confidence')::float > 0.8) AS high_confidence_count
FROM user_events
WHERE event_name = 'trade_ai_parsed'
GROUP BY day
ORDER BY day;

-- 6. pt_rule_violations — top violated rules
SELECT
  event_properties->>'rule_id' AS rule_id,
  COUNT(*) AS violations,
  COUNT(DISTINCT user_id) AS affected_users
FROM user_events
WHERE event_name = 'rule_violated_flagged'
GROUP BY rule_id
ORDER BY violations DESC
LIMIT 10;

-- 7. pt_rage_clicks — UX friction hotspots
SELECT
  event_properties->>'element_id' AS element,
  event_properties->>'page_path' AS page,
  COUNT(*) AS rage_click_events
FROM user_events
WHERE event_name = 'rage_click_detected'
GROUP BY element, page
ORDER BY rage_click_events DESC;

-- 8. pt_session_depth — engagement depth by day
SELECT
  DATE(timestamp_utc) AS day,
  AVG(session_duration_ms) / 1000 AS avg_session_seconds,
  AVG(event_sequence) AS avg_events_per_session,
  COUNT(DISTINCT session_id) AS total_sessions
FROM user_events
GROUP BY day
ORDER BY day;

-- 9. pt_geo_distribution — users by geo
SELECT
  geo_country_name,
  geo_city,
  COUNT(DISTINCT user_id) AS users,
  COUNT(DISTINCT session_id) AS sessions
FROM user_events
WHERE user_id IS NOT NULL
GROUP BY geo_country_name, geo_city
ORDER BY users DESC
LIMIT 20;

-- 10. pt_sync_health — cloud sync reliability
SELECT
  DATE(timestamp_utc) AS day,
  COUNT(*) FILTER (WHERE event_name = 'cloud_sync_completed') AS successful_syncs,
  COUNT(*) FILTER (WHERE event_name = 'cloud_sync_failed') AS failed_syncs,
  AVG((event_properties->>'latency_ms')::int)
    FILTER (WHERE event_name = 'cloud_sync_completed') AS avg_sync_ms
FROM user_events
WHERE event_name IN ('cloud_sync_completed', 'cloud_sync_failed')
GROUP BY day
ORDER BY day;
