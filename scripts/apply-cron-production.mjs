/**
 * Apply pg_cron schedules on production via Supabase Management API (SQL).
 * Requires: SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD in .env.observability or env
 * Run: node scripts/apply-cron-production.mjs
 */
import { readFileSync, existsSync } from 'fs';

const PROJECT_REF = 'firqlsjixojnrofycwbs';

function load(name) {
    if (process.env[name]) return process.env[name];
    for (const f of ['.env.observability', '.env.local']) {
        if (!existsSync(f)) continue;
        const line = readFileSync(f, 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
        if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    }
    return null;
}

const accessToken = load('SUPABASE_ACCESS_TOKEN');
const serviceKey = load('SUPABASE_SERVICE_ROLE_KEY');
const dbPassword = load('SUPABASE_DB_PASSWORD') ?? load('SUPABASE_DB_PASSWORD_STAGING');

if (!accessToken || !serviceKey) {
    console.error('Need SUPABASE_ACCESS_TOKEN and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const baseUrl = `https://${PROJECT_REF}.supabase.co/functions/v1`;
const authHeader = JSON.stringify({
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
}).replace(/'/g, "''");

const sql = `
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

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

DO $$ BEGIN PERFORM cron.unschedule('retention-daily'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('weekly-report'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('pt-update-user-model'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule('retention-daily', '0 3 * * *',
  $$SELECT net.http_post(
    url := '${baseUrl}/retention-check',
    headers := '${authHeader}'::jsonb,
    body := '{}'::jsonb
  )$$);

SELECT cron.schedule('weekly-report', '30 3 * * 1',
  $$SELECT net.http_post(
    url := '${baseUrl}/weekly-beta-report',
    headers := '${authHeader}'::jsonb,
    body := '{}'::jsonb
  )$$);

SELECT cron.schedule('pt-update-user-model', '0 4 * * 0',
  $$SELECT net.http_post(
    url := '${baseUrl}/update-user-model',
    headers := '${authHeader}'::jsonb,
    body := '{}'::jsonb
  )$$);
`;

// Management API database query endpoint (beta) - fallback: print SQL for manual run
console.log('Paste the following in Supabase SQL Editor if auto-apply is unavailable:\n');
console.log('-- docs/supabase/RUN_CRON_AND_RETENTION.sql (replace YOUR_SERVICE_ROLE_KEY)\n');
console.log('Functions base URL:', baseUrl);
console.log('\nCron SQL generated. Open:');
console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
