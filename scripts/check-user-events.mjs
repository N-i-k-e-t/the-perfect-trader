import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

function loadEnv(name) {
    if (process.env[name]) return process.env[name];
    if (!existsSync('.env.local')) return null;
    const line = readFileSync('.env.local', 'utf8')
        .split('\n')
        .find((l) => l.startsWith(`${name}=`));
    if (!line) return null;
    return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

const url = loadEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = loadEnv('SUPABASE_SERVICE_ROLE_KEY');
const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const { count, error: cErr } = await admin
    .from('user_events')
    .select('*', { count: 'exact', head: true });
if (cErr) {
    console.error('COUNT_FAIL', cErr.message);
    process.exit(1);
}

const { data: recent, error: rErr } = await admin
    .from('user_events')
    .select('event_name, event_category, timestamp_utc, page_path')
    .order('timestamp_utc', { ascending: false })
    .limit(8);
if (rErr) {
    console.error('SELECT_FAIL', rErr.message);
    process.exit(1);
}

console.log('user_events row count:', count ?? 0);
console.log('latest events:');
for (const row of recent ?? []) {
    console.log(`  - ${row.event_name} (${row.event_category}) @ ${row.timestamp_utc}`);
}
