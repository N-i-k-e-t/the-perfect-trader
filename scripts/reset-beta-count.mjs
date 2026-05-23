/**
 * Reset beta counter on Supabase cloud.
 * 1) If count_offset exists: set offset = auth user count (keeps accounts).
 * 2) Else: delete all auth users via service role (cascades trader_snapshots).
 *
 * Run: node scripts/reset-beta-count.mjs
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local or environment.
 */
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

const url = loadEnv('NEXT_PUBLIC_SUPABASE_URL') ?? 'https://firqlsjixojnrofycwbs.supabase.co';
const serviceKey = loadEnv('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = loadEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!serviceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});
const pub = anonKey ? createClient(url, anonKey) : null;

async function getCapacity() {
    const client = pub ?? admin;
    const { data, error } = await client.rpc('get_beta_capacity');
    if (error) throw new Error(error.message);
    return data;
}

async function tryOffsetReset() {
    const probe = await admin.from('beta_capacity').select('count_offset').limit(1);
    if (probe.error?.code === '42703' || probe.error?.message?.includes('count_offset')) {
        return false;
    }
    if (probe.error) throw new Error(probe.error.message);

    const { data: users, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw new Error(listErr.message);
    const total = users?.users?.length ?? 0;

    const { error: updErr } = await admin
        .from('beta_capacity')
        .update({ count_offset: total, updated_at: new Date().toISOString() })
        .eq('id', 1);
    if (updErr) throw new Error(updErr.message);

    console.log(`Set count_offset=${total} (accounts kept)`);
    return true;
}

async function deleteAllUsers() {
    let page = 1;
    let deleted = 0;
    for (;;) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) throw new Error(error.message);
        const batch = data?.users ?? [];
        if (batch.length === 0) break;
        for (const u of batch) {
            const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
            if (delErr) throw new Error(`${u.email ?? u.id}: ${delErr.message}`);
            deleted++;
        }
        if (batch.length < 100) break;
        page++;
    }
    console.log(`Deleted ${deleted} auth user(s)`);
}

async function main() {
    console.log('\n=== Reset beta count ===\n');
    const before = await getCapacity();
    console.log('Before:', JSON.stringify(before));

    const usedOffset = await tryOffsetReset();
    if (!usedOffset) {
        console.log('count_offset column missing — applying reset via user cleanup…');
        console.log('(Run docs/supabase/RESET_BETA_COUNT.sql once to enable offset-only resets)\n');
        await deleteAllUsers();
    }

    const after = await getCapacity();
    console.log('After:', JSON.stringify(after));

    const ok = after?.current === 0 && !after?.full;
    console.log(ok ? '\nPASS | Beta count reset to 0' : '\nWARN | Check Supabase — current may need SQL reset');
    process.exit(ok ? 0 : 1);
}

main().catch((e) => {
    console.error('FAIL |', e?.message || String(e));
    if (e?.stack) console.error(e.stack);
    process.exit(1);
});
