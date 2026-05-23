-- Run once in Supabase SQL Editor (production: firqlsjixojnrofycwbs)
-- Prerequisites: Edge Functions deployed; Database → Extensions → enable pg_cron + pg_net

-- 1) Prune function (12-month retention)
CREATE OR REPLACE FUNCTION public.prune_user_events_12m()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH deleted AS (
    DELETE FROM public.user_events
    WHERE timestamp_utc < NOW() - INTERVAL '12 months'
    RETURNING 1
  )
  SELECT COUNT(*)::bigint FROM deleted;
$$;

-- 2) Remove old jobs if re-running (safe if missing)
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retention-daily') THEN
    PERFORM cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'retention-daily' LIMIT 1));
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-report') THEN
    PERFORM cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'weekly-report' LIMIT 1));
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'pt-update-user-model') THEN
    PERFORM cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'pt-update-user-model' LIMIT 1));
  END IF;
END $cron$;

-- 3) Replace YOUR_SERVICE_ROLE_KEY below (Dashboard → Settings → API → service_role secret)
--    URL must be: https://firqlsjixojnrofycwbs.supabase.co/functions/v1/<name>

SELECT cron.schedule(
  'retention-daily',
  '0 3 * * *',
  $$SELECT net.http_post(
    url := 'https://firqlsjixojnrofycwbs.supabase.co/functions/v1/retention-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'weekly-report',
  '30 3 * * 1',
  $$SELECT net.http_post(
    url := 'https://firqlsjixojnrofycwbs.supabase.co/functions/v1/weekly-beta-report',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'pt-update-user-model',
  '0 4 * * 0',
  $$SELECT net.http_post(
    url := 'https://firqlsjixojnrofycwbs.supabase.co/functions/v1/update-user-model',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

-- 4) Verify
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobname;
