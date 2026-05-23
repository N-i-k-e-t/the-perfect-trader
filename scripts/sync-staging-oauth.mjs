/**
 * Copy Google + GitHub OAuth credentials from production Supabase to staging.
 * Same Client ID/Secret — no new Google app. Add staging redirect URI in Google Cloud.
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.observability (or env).
 */
import { readFileSync, existsSync } from 'fs';

const PROD_REF = 'firqlsjixojnrofycwbs';
const STAGING_REF = 'bwynrefnhykwadmbzogr';

function loadToken() {
    if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
    if (!existsSync('.env.observability')) return null;
    const line = readFileSync('.env.observability', 'utf8')
        .split(/\r?\n/)
        .find((l) => l.startsWith('SUPABASE_ACCESS_TOKEN='));
    return line?.split('=').slice(1).join('=').trim() || null;
}

async function getAuth(token, ref) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`GET ${ref}: ${await res.text()}`);
    return res.json();
}

async function patchAuth(token, ref, body) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${ref}: ${await res.text()}`);
    return res.json();
}

const token = loadToken();
if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN in .env.observability');
    process.exit(1);
}

const prod = await getAuth(token, PROD_REF);
const staging = await getAuth(token, STAGING_REF);

const updated = await patchAuth(token, STAGING_REF, {
    site_url: staging.site_url,
    uri_allow_list: staging.uri_allow_list,
    mailer_autoconfirm: true,
    external_email_enabled: true,
    external_google_enabled: true,
    external_google_client_id: prod.external_google_client_id,
    external_google_secret: prod.external_google_secret,
    external_github_enabled: true,
    external_github_client_id: prod.external_github_client_id,
    external_github_secret: prod.external_github_secret,
});

console.log('Staging OAuth synced from production.');
console.log(`  Google: ${updated.external_google_enabled ? 'on' : 'off'}`);
console.log(`  GitHub: ${updated.external_github_enabled ? 'on' : 'off'}`);
console.log('');
console.log('Google: add this redirect URI (same OAuth client as prod):');
console.log(`  https://${STAGING_REF}.supabase.co/auth/v1/callback`);
console.log('');
console.log('GitHub: one callback URL per OAuth app — test GitHub on production, or use a staging-only GitHub app.');
