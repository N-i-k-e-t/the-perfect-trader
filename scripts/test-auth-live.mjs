/**
 * Live auth smoke test (routes + OAuth authorize URLs).
 * Run: node scripts/test-auth-live.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const SITE = process.env.SITE_URL ?? 'https://the-perfect-trader.vercel.app';

function loadAnonKey() {
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (existsSync('.env.local')) {
        const line = readFileSync('.env.local', 'utf8')
            .split('\n')
            .find((l) => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
        if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    }
    return null;
}

const key = loadAnonKey();
if (!key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://firqlsjixojnrofycwbs.supabase.co',
    key,
);

console.log('\n=== Live auth smoke test ===\n');
console.log(`Site: ${SITE}\n`);

const routeChecks = [
    ['/auth/callback', [307, 302], 'no_code'],
    ['/auth/callback?code=invalid_test', [307, 302], 'bad_code'],
    ['/auth/auth-code-error', [200], null],
    ['/signup', [200], null],
];

for (const [path, expect, note] of routeChecks) {
    const res = await fetch(`${SITE}${path}`, { redirect: 'manual' });
    const loc = res.headers.get('location') ?? '';
    const ok = expect.includes(res.status);
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${path} — ${res.status}${loc ? ` → ${loc.slice(0, 90)}` : ''}${note ? ` (${note})` : ''}`);
}

console.log('');
for (const provider of ['google', 'github']) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${SITE}/auth/callback`, skipBrowserRedirect: true },
    });
    const url = data?.url ?? '';
    const hasCallback =
        url.includes(encodeURIComponent(`${SITE}/auth/callback`)) ||
        url.includes(`${SITE}/auth/callback`);
    let providerHost = '';
    if (!error && url) {
        const step = await fetch(url, { redirect: 'manual' });
        const loc = step.headers.get('location') ?? '';
        providerHost = loc.includes('accounts.google.com')
            ? 'accounts.google.com'
            : loc.includes('github.com')
              ? 'github.com'
              : loc.slice(0, 60);
    }
    const ok = !error && url.includes('/auth/v1/authorize') && hasCallback && providerHost;
    console.log(
        `${ok ? 'PASS' : 'FAIL'} | ${provider} authorize URL`,
        error?.message ?? (ok ? `→ ${providerHost}` : url.slice(0, 100)),
    );
}

console.log('\nManual: incognito → /signup → Google → should reach /onboarding\n');
