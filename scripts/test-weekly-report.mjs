import { readFileSync, existsSync } from 'fs';

function load(name) {
    const line = readFileSync('.env.local', 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
    return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

const key = load('SUPABASE_SERVICE_ROLE_KEY');
const r = await fetch('https://firqlsjixojnrofycwbs.supabase.co/functions/v1/weekly-beta-report', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: '{}',
});
const body = await r.json().catch(() => ({}));
console.log('HTTP', r.status);
console.log(JSON.stringify(body, null, 2));
