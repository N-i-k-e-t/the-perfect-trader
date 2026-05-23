/**
 * Verifies OAuth providers return authorize URLs with correct redirect_to.
 * Run: node scripts/test-oauth-redirect.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const SITE = process.env.SITE_URL ?? 'https://the-perfect-trader.vercel.app';
const CALLBACK = `${SITE}/auth/callback`;

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://firqlsjixojnrofycwbs.supabase.co';
const key = loadAnonKey();
if (!key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_ANON_KEY or .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

for (const provider of ['github', 'google']) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: CALLBACK, skipBrowserRedirect: true },
    });
    const authUrl = data?.url ?? '';
    const ok =
        !error &&
        authUrl.length > 0 &&
        (authUrl.includes(encodeURIComponent(CALLBACK)) || authUrl.includes(CALLBACK));
    console.log(`${ok ? 'PASS' : 'FAIL'} | OAuth ${provider} redirectTo`, error?.message ?? (ok ? CALLBACK : authUrl.slice(0, 120)));
}
