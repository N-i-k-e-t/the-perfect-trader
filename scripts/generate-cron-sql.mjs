/**
 * Writes docs/supabase/APPLY_CRON_NOW.sql with service_role from .env.local (gitignored).
 * Run: node scripts/generate-cron-sql.mjs
 */
import { readFileSync, existsSync, writeFileSync } from 'fs';

const REF = 'firqlsjixojnrofycwbs';
const BASE = `https://${REF}.supabase.co/functions/v1`;

function load(name) {
    if (!existsSync('.env.local')) {
        console.error('Missing .env.local with SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }
    const line = readFileSync('.env.local', 'utf8')
        .split('\n')
        .find((l) => l.startsWith(`${name}=`));
    if (!line) {
        console.error(`Missing ${name} in .env.local`);
        process.exit(1);
    }
    return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

const serviceKey = load('SUPABASE_SERVICE_ROLE_KEY');

const sql = `-- AUTO-GENERATED — paste in SQL Editor and Run (do not commit)
-- Project: ${REF} | Extensions pg_cron + pg_net must be enabled

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

SELECT cron.schedule(
  'retention-daily',
  '0 3 * * *',
  $$SELECT net.http_post(
    url := '${BASE}/retention-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${serviceKey}',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'weekly-report',
  '30 3 * * 1',
  $$SELECT net.http_post(
    url := '${BASE}/weekly-beta-report',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${serviceKey}',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

SELECT cron.schedule(
  'pt-update-user-model',
  '0 4 * * 0',
  $$SELECT net.http_post(
    url := '${BASE}/update-user-model',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ${serviceKey}',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);

SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobname;
`;

const out = 'docs/supabase/APPLY_CRON_NOW.sql';
writeFileSync(out, sql, 'utf8');
console.log('Wrote', out);
console.log('Open SQL Editor → paste entire file → Run');
console.log('https://supabase.com/dashboard/project/' + REF + '/sql/new');
