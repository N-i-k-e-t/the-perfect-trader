/**
 * Full production + Supabase health check (routes, beta cap, auth, snapshots, fallbacks).
 * Run: node scripts/health-check-all.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SITE = process.env.SITE_URL ?? 'https://the-perfect-trader.vercel.app';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://firqlsjixojnrofycwbs.supabase.co';
const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_gMVAYqo3dXCAnFoQ5ScUeg_zo6cJSUO';

const supabase = createClient(url, key);
const results = [];

function record(name, ok, detail = '') {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ` — ${detail}` : ''}`);
}

async function checkRoutes() {
    const paths = [
        ['/', 200],
        ['/signup', 200],
        ['/login', 200],
        ['/beta', 200],
        ['/beta/full', 200],
        ['/api/beta-capacity', 200],
        ['/privacy', 200],
        ['/today', [307, 302]],
    ];
    for (const [path, expect] of paths) {
        try {
            const res = await fetch(`${SITE}${path}`, { redirect: 'manual' });
            const codes = Array.isArray(expect) ? expect : [expect];
            record(`HTTP ${path}`, codes.includes(res.status), `status ${res.status}`);
        } catch (e) {
            record(`HTTP ${path}`, false, e.message);
        }
    }
}

async function checkBetaCapacity() {
    const res = await fetch(`${SITE}/api/beta-capacity`);
    const body = await res.json();
    const hasFallback = Object.prototype.hasOwnProperty.call(body, 'fallback');
    record('beta API no fallback flag', !hasFallback, JSON.stringify(body));
    record('beta max = 100', body.max === 100, `max=${body.max}`);
    record('beta RPC fields', typeof body.current === 'number' && typeof body.remaining === 'number');
    return body;
}

async function checkSupabaseRpc() {
    const { data, error } = await supabase.rpc('get_beta_capacity');
    record('Supabase get_beta_capacity RPC', !error && !!data, error?.message ?? JSON.stringify(data));
    return data;
}

async function checkTraderSnapshotsTable() {
    const { error } = await supabase.from('trader_snapshots').select('user_id').limit(1);
    // RLS may return empty; 42P01 = missing table
    const missing = error?.code === '42P01' || error?.message?.includes('does not exist');
    record('trader_snapshots table exists', !missing, error?.message ?? 'ok');
}

async function checkSignupSession() {
    const stamp = Date.now();
    const email = `pt.health.${stamp}@gmail.com`;
    const password = 'HealthCheck1!';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Health Check' },
            emailRedirectTo: `${SITE}/auth/callback`,
        },
    });

    if (error) {
        record('auth.signUp', false, error.message);
        return;
    }

    record('auth.signUp creates user', !!data.user, data.user?.id ?? '');

    if (data.session) {
        record('auth.signUp returns session (email confirm OFF)', true);
        const { error: saveErr } = await supabase.from('trader_snapshots').upsert(
            {
                user_id: data.user.id,
                data: { version: '1.1.0', health_check: true },
                version: '1.1.0',
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
        );
        record('trader_snapshots upsert with session', !saveErr, saveErr?.message ?? 'ok');
    } else {
        record(
            'auth.signUp returns session (email confirm OFF)',
            false,
            'email confirmation ON — disable in Supabase Auth → Email',
        );
    }

    const { data: cap } = await supabase.rpc('get_beta_capacity');
    record('user count after signup', (cap?.current ?? 0) >= 1, `current=${cap?.current}`);
}

async function checkFallbackLogic() {
    const bad = createClient('https://invalid.example.com', 'bad_key');
    const { error } = await bad.rpc('get_beta_capacity');
    record('fallback path on bad RPC', !!error, error?.message?.slice(0, 60) ?? '');
}

async function main() {
    console.log('\n=== The Perfect Trader — full health check ===\n');
    console.log(`Site: ${SITE}\n`);

    await checkRoutes();
    console.log('');
    await checkBetaCapacity();
    console.log('');
    await checkSupabaseRpc();
    await checkTraderSnapshotsTable();
    console.log('');
    await checkSignupSession();
    console.log('');
    await checkFallbackLogic();

    const failed = results.filter((r) => !r.ok);
    console.log('\n--- Summary ---');
    console.log(`Passed: ${results.length - failed.length}/${results.length}`);
    if (failed.length) {
        console.log('\nFailed checks:');
        failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
        process.exit(1);
    }
    console.log('\nAll checks passed.\n');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
