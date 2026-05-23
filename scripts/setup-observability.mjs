/**
 * One-shot: staging Supabase project + Sentry project + Vercel env vars.
 *
 * Prerequisites (add to .env.observability — copy from .env.observability.example):
 *   SUPABASE_ACCESS_TOKEN  — supabase.com/dashboard/account/tokens
 *   SENTRY_AUTH_TOKEN      — sentry.io/settings/account/api/auth-tokens/
 *   SENTRY_ORG             — org slug
 *   SENTRY_TEAM            — team slug (often same as org)
 *
 * Run: npm run setup:observability
 */
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';

const PROD_REF = 'firqlsjixojnrofycwbs';
const ENV_PATHS = ['.env.observability', '.env.local'];
const STAGING_NAME = 'perfect-trader-staging';
const REGION = 'ap-northeast-1';

function loadEnvFile(path) {
    if (!existsSync(path)) return {};
    const out = {};
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i < 1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
        }
        out[k] = v;
    }
    return out;
}

function get(name, fileEnv) {
    return process.env[name] ?? fileEnv[name] ?? null;
}

function runVercelEnv(name, value, environments) {
    for (const env of environments) {
        const args = ['vercel', 'env', 'add', name, env, '--value', value, '--yes', '--force'];
        const r = spawnSync('npx', args, { stdio: 'pipe', shell: true, cwd: process.cwd() });
        const out = (r.stdout?.toString() ?? '') + (r.stderr?.toString() ?? '');
        if (r.status !== 0) {
            if (out.includes('git_branch_required') && env === 'preview') {
                console.warn(
                    `Preview ${name}: add in Vercel dashboard → Preview → ${name}=${value}`
                );
                continue;
            }
            console.warn(`vercel env add ${name} ${env}: ${out.slice(0, 120)}`);
        } else {
            console.log(`Vercel env ${name} → ${env}`);
        }
    }
}

async function supabaseFetch(token, path, options = {}) {
    const res = await fetch(`https://api.supabase.com/v1${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    });
    const text = await res.text();
    let body;
    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        body = text;
    }
    if (!res.ok) {
        throw new Error(typeof body === 'object' ? JSON.stringify(body) : String(body));
    }
    return body;
}

async function ensureStagingProject(token, fileEnv) {
    let ref = get('SUPABASE_PROJECT_REF_STAGING', fileEnv);
    if (ref && ref !== PROD_REF) {
        console.log(`Using existing staging ref: ${ref}`);
        return ref;
    }

    const orgs = await supabaseFetch(token, '/organizations');
    const org = orgs?.[0];
    if (!org?.id) throw new Error('No Supabase organization found');

    const dbPassword =
        get('SUPABASE_DB_PASSWORD_STAGING', fileEnv) ??
        randomBytes(16).toString('base64url') + 'Aa1!';

    console.log(`Creating Supabase project "${STAGING_NAME}" in org ${org.name}...`);
    const created = await supabaseFetch(token, '/projects', {
        method: 'POST',
        body: JSON.stringify({
            organization_id: org.id,
            name: STAGING_NAME,
            region: REGION,
            db_pass: dbPassword,
        }),
    });

    ref = created.ref ?? created.id;
    if (!ref) throw new Error('Create project response missing ref');

    console.log(`Staging project ref: ${ref}`);
    console.log('Waiting for project to become active...');
    for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 15000));
        const p = await supabaseFetch(token, `/projects/${ref}`);
        if (p.status === 'ACTIVE_HEALTHY') break;
        console.log(`  status: ${p.status ?? 'unknown'}...`);
    }

    const keys = await supabaseFetch(token, `/projects/${ref}/api-keys`);
    const anon = keys?.find((k) => k.name === 'anon' || k.name === 'anon key')?.api_key;
    const service = keys?.find((k) => k.name === 'service_role')?.api_key;

    const stagingUrl = `https://${ref}.supabase.co`;
    const lines = [
        `# Auto-generated ${new Date().toISOString()}`,
        `SUPABASE_PROJECT_REF_STAGING=${ref}`,
        `NEXT_PUBLIC_SUPABASE_URL_STAGING=${stagingUrl}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=${anon ?? ''}`,
        `SUPABASE_SERVICE_ROLE_KEY_STAGING=${service ?? ''}`,
        `SUPABASE_DB_PASSWORD_STAGING=${dbPassword}`,
    ];
    writeFileSync('.env.observability.local', lines.join('\n') + '\n', 'utf8');
    console.log('Saved .env.observability.local (gitignored)');

    process.env.SUPABASE_DB_PASSWORD = dbPassword;
    process.env.SUPABASE_PROJECT_REF_STAGING = ref;

    const encoded = encodeURIComponent(dbPassword);
    const dbUrl = `postgresql://postgres.${ref}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
    console.log('Pushing migrations to staging...');
    const push = spawnSync(
        'npx',
        ['supabase', 'db', 'push', '--db-url', dbUrl, '--yes'],
        { stdio: 'inherit', shell: true }
    );
    if (push.status !== 0) {
        console.warn('db push failed — run APPLY_SCHEMA.sql in staging SQL Editor');
    }

    return ref;
}

async function ensureSentryProject(token, org, team, fileEnv) {
    let dsn = get('SENTRY_DSN', fileEnv) ?? get('NEXT_PUBLIC_SENTRY_DSN', fileEnv);
    if (dsn) {
        console.log('Using existing SENTRY_DSN from env file');
        return { dsn, org, project: get('SENTRY_PROJECT', fileEnv) ?? 'perfect-trader-web' };
    }

    const projectSlug = 'perfect-trader-web';
    console.log(`Creating Sentry project ${projectSlug}...`);
    const res = await fetch(`https://sentry.io/api/0/teams/${org}/${team}/projects/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: projectSlug, platform: 'javascript-nextjs' }),
    });
    const body = await res.json();
    if (!res.ok && res.status !== 409) {
        throw new Error(JSON.stringify(body));
    }

    const project = body.slug ?? projectSlug;
    const keysRes = await fetch(`https://sentry.io/api/0/projects/${org}/${project}/keys/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const keys = await keysRes.json();
    dsn = keys?.[0]?.dsn?.public;
    if (!dsn) throw new Error('Could not read Sentry DSN');
    console.log('Sentry DSN created');
    return { dsn, org, project };
}

function loadAllEnv() {
    const merged = {};
    for (const p of ENV_PATHS) {
        Object.assign(merged, loadEnvFile(p));
    }
    return merged;
}

function trySupabaseCliToken() {
    const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
    const candidates = [
        join(home, '.supabase', 'access-token'),
        join(home, 'AppData', 'Roaming', 'supabase', 'access-token'),
    ];
    for (const p of candidates) {
        if (existsSync(p)) {
            const t = readFileSync(p, 'utf8').trim();
            if (t.startsWith('sbp_')) return t;
        }
    }
    return null;
}

async function main() {
    const fileEnv = loadAllEnv();
    let supabaseToken = get('SUPABASE_ACCESS_TOKEN', fileEnv);
    const sentryToken = get('SENTRY_AUTH_TOKEN', fileEnv);
    const sentryOrg = get('SENTRY_ORG', fileEnv);
    const sentryTeam = get('SENTRY_TEAM', fileEnv) ?? sentryOrg;

    if (!supabaseToken) {
        supabaseToken = trySupabaseCliToken();
        if (supabaseToken) console.log('Using Supabase token from CLI login cache.');
    }

    if (!supabaseToken || !sentryToken || !sentryOrg) {
        console.error(`
Missing credentials.

Fill .env.observability (opened in Notepad) with:
  SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens  (sbp_...)
  SENTRY_AUTH_TOKEN      — https://sentry.io/settings/account/api/auth-tokens/
  SENTRY_ORG             — org slug from sentry.io URL
  SENTRY_TEAM            — usually same as SENTRY_ORG

Then run again: npm run setup:observability

Or: npx supabase login   (then re-run — CLI token is picked up automatically)
`);
        process.exit(1);
    }

    const stagingRef = await ensureStagingProject(supabaseToken, fileEnv);
    const localObs = loadEnvFile('.env.observability.local');
    const stagingUrl =
        localObs.NEXT_PUBLIC_SUPABASE_URL_STAGING ?? `https://${stagingRef}.supabase.co`;
    const stagingAnon =
        localObs.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING ??
        get('NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING', fileEnv);

    const { dsn, org, project } = await ensureSentryProject(
        sentryToken,
        sentryOrg,
        sentryTeam,
        fileEnv
    );

    console.log('\nSetting Vercel environment variables...');
    runVercelEnv('NEXT_PUBLIC_APP_ENV', 'production', ['production']);
    runVercelEnv('NEXT_PUBLIC_APP_ENV', 'staging', ['preview']);
    runVercelEnv('SENTRY_DSN', dsn, ['production', 'preview']);
    runVercelEnv('NEXT_PUBLIC_SENTRY_DSN', dsn, ['production', 'preview']);
    runVercelEnv('SENTRY_ORG', org, ['production', 'preview']);
    runVercelEnv('SENTRY_PROJECT', project, ['production', 'preview']);

    if (stagingAnon) {
        runVercelEnv('NEXT_PUBLIC_SUPABASE_URL', stagingUrl, ['preview']);
        runVercelEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', stagingAnon, ['preview']);
        runVercelEnv('SUPABASE_PROJECT_REF', stagingRef, ['preview']);
    }

    console.log('\nDeploying production...');
    const deploy = spawnSync('npx', ['vercel', 'deploy', '--prod', '--yes'], {
        stdio: 'inherit',
        shell: true,
    });
    if (deploy.status !== 0) process.exit(deploy.status ?? 1);

    console.log('\nDone.');
    console.log(`  Production Supabase: ${PROD_REF}`);
    console.log(`  Staging Supabase:    ${stagingRef}`);
    console.log(`  Sentry:              ${org}/${project}`);
    console.log('  Configure staging Auth URLs: docs/supabase/STAGING_PROJECT.md');
}

main().catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
});
