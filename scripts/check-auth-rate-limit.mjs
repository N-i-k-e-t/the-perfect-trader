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
const key = loadEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabase = createClient(url, key);

const now = new Date();
console.log('Checked at (UTC):', now.toISOString());
console.log('Checked at (local):', now.toString());
console.log('');

const email = `pt.ratecheck.${Date.now()}@gmail.com`;
const { data, error } = await supabase.auth.signUp({
    email,
    password: 'RateCheck1!',
    options: {
        data: { full_name: 'Rate Check' },
        emailRedirectTo: 'https://the-perfect-trader.vercel.app/auth/callback',
    },
});

if (error) {
    console.log('signUp FAILED');
    console.log('  message:', error.message);
    console.log('  status:', error.status);
    console.log('  code:', error.code);
} else {
    console.log('signUp OK');
    console.log('  user id:', data.user?.id);
    console.log('  session:', data.session ? 'yes (confirm email OFF)' : 'no (confirm email ON — sends email)');
}

console.log('\n--- Configured limits (local supabase/config.toml reference) ---');
console.log('  email_sent: 2 per hour (auth emails when SMTP/confirm enabled)');
console.log('  sign_in_sign_ups: 30 per 5 minutes per IP');
console.log('  token_verifications: 30 per 5 minutes per IP');
console.log('\nCloud project firqlsjixojnrofycwbs uses Supabase hosted Auth limits.');
console.log('Dashboard: Auth → Rate Limits / Email provider → Confirm email');
