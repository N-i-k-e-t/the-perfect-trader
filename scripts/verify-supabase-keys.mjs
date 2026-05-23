import { readFileSync, existsSync } from 'fs';

function loadEnv(path) {
    if (!existsSync(path)) return {};
    const out = {};
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i < 1) continue;
        let v = t.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
        }
        out[t.slice(0, i).trim()] = v;
    }
    return out;
}

async function test(label, url, key) {
    const ref = url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '?';
    console.log(`\n--- ${label} (ref: ${ref}) ---`);
    if (!url || !key) {
        console.log('MISSING url or key');
        return false;
    }
    console.log('key length:', key.length);
    const auth = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    console.log('auth health:', auth.status);
    const rest = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    console.log('rest root:', rest.status, rest.status === 401 ? 'INVALID API KEY' : 'ok');
    return rest.status !== 401;
}

const local = loadEnv('.env.local');
const vercel = loadEnv('.env.vercel.prod.check');

const okLocal = await test('local .env.local', local.NEXT_PUBLIC_SUPABASE_URL, local.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const okVercel = await test(
    'Vercel production pull',
    vercel.NEXT_PUBLIC_SUPABASE_URL,
    vercel.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fetch fresh anon from Supabase Management API
const obs = loadEnv('.env.observability');
const token = obs.SUPABASE_ACCESS_TOKEN;
if (token) {
    const ref = 'firqlsjixojnrofycwbs';
    const keys = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    const anon = keys?.find((k) => k.name === 'anon' || k.name === 'anon key')?.api_key;
    if (anon) {
        await test('cloud truth (Management API)', `https://${ref}.supabase.co`, anon);
        const matchLocal = local.NEXT_PUBLIC_SUPABASE_ANON_KEY === anon;
        const matchVercel = vercel.NEXT_PUBLIC_SUPABASE_ANON_KEY === anon;
        console.log('\nlocal key matches cloud:', matchLocal);
        console.log('vercel key matches cloud:', matchVercel);
    }
}

process.exit(okLocal && okVercel ? 0 : 1);
