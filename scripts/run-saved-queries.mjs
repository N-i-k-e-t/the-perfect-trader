/**
 * Run SAVED_QUERIES.sql against production (service role). No secrets printed.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

function load(name) {
    if (!existsSync('.env.local')) throw new Error('Missing .env.local');
    const line = readFileSync('.env.local', 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
    if (!line) throw new Error(`Missing ${name}`);
    return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

const url = load('NEXT_PUBLIC_SUPABASE_URL');
const key = load('SUPABASE_SERVICE_ROLE_KEY');
const dbUrl = load('DATABASE_URL') || process.env.DATABASE_URL;

const queries = readFileSync('docs/analytics/SAVED_QUERIES.sql', 'utf8')
    .split(/;\s*\n/)
    .map((q) => q.replace(/^--[^\n]*\n/gm, '').trim())
    .filter((q) => q.length > 20 && /^SELECT/i.test(q));

if (!dbUrl) {
    console.log('DATABASE_URL not in .env.local — run queries in Supabase SQL Editor instead.');
    console.log('Query count:', queries.length);
    process.exit(0);
}

// Use postgres if DATABASE_URL present
const { default: pg } = await import('pg');
const client = new pg.Client({ connectionString: dbUrl });
await client.connect();

const names = [
    'pt_daily_active_users',
    'pt_onboarding_funnel',
    'pt_feature_adoption',
    'pt_ai_coaching_effectiveness',
    'pt_ai_parse_quality',
    'pt_rule_violations',
    'pt_rage_clicks',
    'pt_session_depth',
    'pt_geo_distribution',
    'pt_sync_health',
];

for (let i = 0; i < queries.length; i++) {
    const name = names[i] ?? `query_${i + 1}`;
    try {
        const res = await client.query(queries[i]);
        console.log(`OK | ${name} | ${res.rowCount} rows`);
    } catch (e) {
        console.log(`FAIL | ${name} | ${e.message}`);
    }
}
await client.end();
