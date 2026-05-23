-- Optional: 12-month event retention + pg_cron schedules (run manually in Supabase SQL Editor)
-- Requires: pg_cron + pg_net extensions (Supabase Dashboard → Database → Extensions)

-- Archive/delete events older than 12 months
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

-- Example cron (replace YOUR_PROJECT_REF and service role secret):
-- SELECT cron.schedule(
--   'pt-prune-user-events',
--   '0 4 * * 0',
--   $$SELECT public.prune_user_events_12m()$$
-- );

-- Edge function schedules (after deploy, set secrets RESEND_API_KEY, BETA_REPORT_EMAIL):
-- retention-check daily 3am UTC:
-- SELECT cron.schedule('pt-retention-daily', '0 3 * * *',
--   $$SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/retention-check',
--     headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )$$
-- );

-- weekly-beta-report Monday 3am UTC:
-- SELECT cron.schedule('pt-weekly-beta-report', '0 3 * * 1', ...);

-- update-user-model weekly Sunday 4am UTC:
-- SELECT cron.schedule('pt-update-user-model', '0 4 * * 0', ...);
