/**
 * Apply user_events migration on Supabase cloud.
 * Uses db push when SUPABASE_DB_PASSWORD / DATABASE_URL is set,
 * otherwise verifies table via service role and prints SQL Editor steps.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';

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
const projectRef = loadEnv('SUPABASE_PROJECT_REF') ?? 'firqlsjixojnrofycwbs';

if (!serviceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function tableExists() {
    const { error } = await admin.from('user_events').select('event_id').limit(1);
    if (!error) return true;
    const msg = error.message ?? '';
    if (
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        msg.includes('does not exist') ||
        msg.includes('Could not find the table')
    ) {
        return false;
    }
    throw new Error(error.message);
}

function tryDbPush() {
    let password = process.env.SUPABASE_DB_PASSWORD;
    const dbUrl = process.env.DATABASE_URL;
    if (!password && dbUrl?.includes(`postgres.${projectRef}:`)) {
        const m = dbUrl.match(/postgres\.[^:]*:([^@]+)@/);
        if (m) password = decodeURIComponent(m[1]);
    }
    if (!password && existsSync('.env.local')) {
        for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
            if (line.startsWith('SUPABASE_DB_PASSWORD=')) {
                password = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                break;
            }
            if (line.startsWith('DATABASE_URL=')) {
                const u = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                const m = u.match(/postgres\.[^:]*:([^@]+)@/);
                if (m) password = decodeURIComponent(m[1]);
                break;
            }
        }
    }
    if (!password) return false;

    const encoded = encodeURIComponent(password);
    const pooler = `postgresql://postgres.${projectRef}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
    console.log('Pushing migrations via pooler...');
    const r = spawnSync(
        'npx',
        ['supabase', 'db', 'push', '--db-url', pooler, '--yes'],
        { stdio: 'inherit', shell: true, cwd: process.cwd() }
    );
    return r.status === 0;
}

async function main() {
    if (await tableExists()) {
        console.log('user_events table already exists on cloud.');
        return;
    }

    console.log('user_events not found — applying migration...');
    if (tryDbPush()) {
        if (await tableExists()) {
            console.log('Migration applied successfully.');
            return;
        }
    }

    const sqlPath = 'supabase/migrations/20260325000000_user_events.sql';
    console.log('\nCould not auto-push (need DB password in vault or env).');
    console.log('Run ONE of:\n');
    console.log('  npm run secrets:unlock');
    console.log('  npm run db:push:url');
    console.log('\nOr paste this file in Supabase SQL Editor:');
    console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log(`  File: ${sqlPath}\n`);
    process.exit(1);
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
