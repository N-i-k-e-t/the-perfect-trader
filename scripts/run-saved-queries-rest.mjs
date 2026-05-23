/**
 * Smoke-test SAVED_QUERIES via Supabase REST (limited — complex SQL needs SQL Editor).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function load(name) {
    const line = readFileSync('.env.local', 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
    return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(load('NEXT_PUBLIC_SUPABASE_URL'), load('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
});

const checks = [
    {
        name: 'pt_daily_active_users (sample)',
        run: async () => {
            const since = new Date(Date.now() - 30 * 864e5).toISOString();
            const { data, error } = await admin
                .from('user_events')
                .select('user_id, timestamp_utc')
                .gte('timestamp_utc', since)
                .not('user_id', 'is', null)
                .limit(5000);
            if (error) throw error;
            const days = new Set(data?.map((r) => r.timestamp_utc.slice(0, 10)));
            return `${data?.length ?? 0} events, ${days.size} distinct days`;
        },
    },
    {
        name: 'pt_feature_adoption (top events)',
        run: async () => {
            const { data, error } = await admin.rpc('get_beta_capacity');
            void data;
            const since = new Date(Date.now() - 7 * 864e5).toISOString();
            const { data: ev, error: e2 } = await admin
                .from('user_events')
                .select('event_name')
                .gte('timestamp_utc', since);
            if (e2) throw e2;
            const counts = {};
            for (const row of ev ?? []) counts[row.event_name] = (counts[row.event_name] ?? 0) + 1;
            const top = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([k, v]) => `${k}:${v}`)
                .join(', ');
            return top || 'no events';
        },
    },
    {
        name: 'pt_geo_distribution (sample)',
        run: async () => {
            const { data, error } = await admin
                .from('user_events')
                .select('geo_country_name, geo_city')
                .not('user_id', 'is', null)
                .limit(2000);
            if (error) throw error;
            const geo = new Set((data ?? []).map((r) => `${r.geo_country_name}/${r.geo_city}`));
            return `${geo.size} geo buckets from sample`;
        },
    },
];

for (const c of checks) {
    try {
        const detail = await c.run();
        console.log(`OK | ${c.name} | ${detail}`);
    } catch (e) {
        console.log(`FAIL | ${c.name} | ${e.message}`);
    }
}
console.log('\nFull 10 queries: paste docs/analytics/SAVED_QUERIES.sql in SQL Editor (one query per Run).');
