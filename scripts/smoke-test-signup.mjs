/**
 * Live smoke test: Supabase signup + snapshot + beta capacity.
 * Run: node scripts/smoke-test-signup.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://firqlsjixojnrofycwbs.supabase.co';
const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_gMVAYqo3dXCAnFoQ5ScUeg_zo6cJSUO';

const supabase = createClient(url, key);
const stamp = Date.now();
const email = `pt.smoke.${stamp}@gmail.com`;
const password = 'SmokeTest1!Secure';

const log = (label, ok, detail = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${label}${detail ? ` — ${detail}` : ''}`);
};

async function main() {
    console.log('\n=== The Perfect Trader — live smoke test ===\n');

    const { data: capBefore, error: capErr } = await supabase.rpc('get_beta_capacity');
    if (capErr) {
        log('beta_capacity RPC', false, capErr.message);
        process.exit(1);
    }
    log('beta_capacity RPC', true, JSON.stringify(capBefore));

    const { data: signData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: 'Smoke Test' } },
    });

    if (signErr) {
        log('auth.signUp', false, signErr.message);
        process.exit(1);
    }

    const user = signData.user;
    const session = signData.session;
    log('auth.signUp', !!user, user ? `id=${user.id}` : 'no user');

    if (!session) {
        console.log(
            '\nNOTE: No session returned — email confirmation may be ON in Supabase.',
        );
        console.log('   → Auth → Providers → Email → disable "Confirm email" for instant test');
        console.log(`   → Or confirm email for: ${email}\n`);
    } else {
        log('session created', true);
    }

    if (user && session) {
        const { error: saveErr } = await supabase.from('trader_snapshots').upsert(
            {
                user_id: user.id,
                data: { version: '1.1.0', smoke_test: true },
                version: '1.1.0',
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
        );
        log('trader_snapshots upsert', !saveErr, saveErr?.message ?? 'ok');

        const { data: row, error: loadErr } = await supabase
            .from('trader_snapshots')
            .select('user_id, version')
            .eq('user_id', user.id)
            .maybeSingle();
        log('trader_snapshots read own row', !loadErr && !!row, loadErr?.message);
    }

    const { data: capAfter } = await supabase.rpc('get_beta_capacity');
    const before = capBefore?.current ?? 0;
    const after = capAfter?.current ?? 0;
    log(
        'user count increased',
        after >= before,
        `before=${before} after=${after}`,
    );

    console.log('\nTest account (delete in Supabase Auth if needed):');
    console.log(`  email: ${email}`);
    console.log(`  password: ${password}`);
    console.log('\nBrowser test: https://the-perfect-trader.vercel.app/signup\n');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
