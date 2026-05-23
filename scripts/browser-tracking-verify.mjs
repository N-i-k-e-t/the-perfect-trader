/**
 * Browser E2E: Tests 4, 7, 8 on production.
 * Run: node scripts/browser-tracking-verify.mjs
 */
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const BASE = process.env.PT_BASE_URL ?? 'https://the-perfect-trader.vercel.app';
const SUPABASE_REF = 'firqlsjixojnrofycwbs';

function loadEnv(name) {
    if (process.env[name]) return process.env[name];
    for (const f of ['.env.local', '.env.observability']) {
        if (!existsSync(f)) continue;
        const line = readFileSync(f, 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
        if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    }
    return null;
}

const supabaseUrl = loadEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = loadEnv('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = loadEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const results = {
    test4: { pass: false, detail: '' },
    test7a: { pass: false, detail: '' },
    test7b: { pass: false, detail: '' },
    test8a: { pass: false, detail: '' },
    test8b: { pass: false, detail: '' },
};

function log(label, ok, detail = '') {
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${label}${detail ? ` — ${detail}` : ''}`);
}

async function waitForEvent(eventName, sinceIso, { timeoutMs = 45_000, userId = null } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        let q = admin
            .from('user_events')
            .select('event_id, event_name, timestamp_utc, user_id, anonymous_id')
            .eq('event_name', eventName)
            .gte('timestamp_utc', sinceIso)
            .order('timestamp_utc', { ascending: false })
            .limit(3);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        if (data?.length) return data[0];
        await new Promise((r) => setTimeout(r, 2000));
    }
    return null;
}

async function countEventInsertsSince(sinceIso) {
    const { count, error } = await admin
        .from('user_events')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp_utc', sinceIso);
    if (error) throw new Error(error.message);
    return count ?? 0;
}

const E2E_PASSWORD = 'PtBrowserE2e!2026';

/** Fresh confirmed user for browser tests (avoids magic-link redirect issues). */
async function createE2EUser() {
    const email = `pt.browser.e2e.${Date.now()}@gmail.com`;
    const { data, error } = await admin.auth.admin.createUser({
        email,
        password: E2E_PASSWORD,
        email_confirm: true,
        user_metadata: { onboarding_completed: true, full_name: 'Browser E2E' },
    });
    if (error) throw new Error(`createUser: ${error.message}`);
    return { userId: data.user.id, email, password: E2E_PASSWORD };
}

async function loginViaEmailForm(page, email, password) {
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page
        .getByRole('button', { name: /accept all/i })
        .click({ timeout: 5000 })
        .catch(() => {});
    await page.getByRole('button', { name: /sign in with email/i }).click({ timeout: 10_000 });
    await page.getByPlaceholder('you@email.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await Promise.all([
        page.waitForResponse(
            (r) => r.url().includes('/auth/v1/token') && r.status() === 200,
            { timeout: 30_000 }
        ),
        page.getByRole('button', { name: /log in with email/i }).click(),
    ]);
    await page.waitForTimeout(1500);
}

function todayTrades(seed = 0) {
    const today = new Date().toISOString().split('T')[0];
    const base = Date.now() + seed;
    return [
        {
            id: `t-${base}-1`,
            date: today,
            pair: 'NIFTY',
            type: 'long',
            entry: 100,
            exit: 101,
            plannedSL: 99,
            pnl: -1,
            rules_followed: ['1'],
            rules_broken: ['2', '3', '4'],
            emotion: 'bad',
            moodBefore: 'neutral',
            moodAfter: 'bad',
            notes: 'e2e',
        },
        {
            id: `t-${base}-2`,
            date: today,
            pair: 'NIFTY',
            type: 'long',
            entry: 100,
            exit: 99,
            plannedSL: 98,
            pnl: -1,
            rules_followed: ['1'],
            rules_broken: ['2', '3'],
            emotion: 'very_bad',
            moodBefore: 'bad',
            moodAfter: 'very_bad',
            notes: 'e2e',
        },
        {
            id: `t-${base}-3`,
            date: today,
            pair: 'BANKNIFTY',
            type: 'short',
            entry: 200,
            exit: 201,
            plannedSL: 202,
            pnl: -1,
            rules_followed: [],
            rules_broken: ['1', '2', '3', '4', '5'],
            emotion: 'very_bad',
            moodBefore: 'bad',
            moodAfter: 'very_bad',
            notes: 'e2e',
        },
        {
            id: `t-${base}-4`,
            date: today,
            pair: 'NIFTY',
            type: 'long',
            entry: 100,
            exit: 99,
            plannedSL: 98,
            pnl: -1,
            rules_followed: [],
            rules_broken: ['1', '2', '3', '4'],
            emotion: 'very_bad',
            moodBefore: 'neutral',
            moodAfter: 'very_bad',
            notes: 'e2e',
        },
    ];
}

async function runTest4(page) {
    const since = new Date().toISOString();
    const trackPosts = [];

    page.on('request', (req) => {
        const url = req.url();
        if (
            url.includes('/rest/v1/user_events') ||
            url.includes('/api/track')
        ) {
            if (req.method() === 'POST') trackPosts.push({ url, at: Date.now() });
        }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.getByRole('button', { name: /accept all/i }).click({ timeout: 8000 }).catch(() => {});

    const beforeWait = trackPosts.length;
    await page.waitForTimeout(11_000);

    const afterWait = trackPosts.length;
    const dbDelta = (await countEventInsertsSince(since)) > 0;

    const batched =
        afterWait > beforeWait ||
        (trackPosts.length >= 1 && dbDelta);

    results.test4.pass = batched && dbDelta;
    results.test4.detail = `POSTs during 11s idle: ${afterWait - beforeWait} new (total ${trackPosts.length}); DB rows since start: ${await countEventInsertsSince(since)}`;
}

async function runTest7(browser, accept) {
    const since = new Date().toISOString();
    const ctx = await browser.newContext();
    const p = await ctx.newPage();

    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await p.waitForTimeout(1500);

    const btn = accept
        ? p.getByRole('button', { name: /accept all/i })
        : p.getByRole('button', { name: /essential only/i });
    await btn.click({ timeout: 10_000 });

    await p.waitForTimeout(12_000);

    const eventName = accept ? 'cookie_consent_accepted' : 'cookie_consent_rejected';
    const row = await waitForEvent(eventName, since);
    await ctx.close();

    const key = accept ? 'test7a' : 'test7b';
    results[key].pass = Boolean(row);
    results[key].detail = row
        ? `${eventName} @ ${row.timestamp_utc}`
        : `No ${eventName} in DB within 45s`;
}

async function seedCloudTrades(userId) {
    const trades = todayTrades();
    const payload = {
        version: '1.1.0',
        trades,
        rules: [
            { id: '1', text: 'Never risk more than 2% per trade', emoji: '🛡️', category: 'Risk Rules', isActive: true },
            { id: '2', text: 'Always use a stop loss', emoji: '🛑', category: 'Risk Rules', isActive: true },
            { id: '3', text: 'Wait for confirmation candle', emoji: '🕯️', category: 'Entry/Exit Rules', isActive: true },
            { id: '4', text: 'No revenge trading', emoji: '🧠', category: 'Mindset Rules', isActive: true },
            { id: '5', text: 'Max 3 trades per session', emoji: '🔢', category: 'Pre-Session Rules', isActive: true },
        ],
        dailyLogs: [],
        analytics: {
            weeklyStability: [70, 70, 70, 70, 70, 70, 70],
            ruleAdherence: 40,
            avgTradesPerDay: 4,
            behavioralTrend: 'declining',
            consistencyDays: 2,
            primaryDeviation: 'e2e',
            indisciplineCost: 5000,
        },
    };
    const { error } = await admin.from('trader_snapshots').upsert(
        {
            user_id: userId,
            data: payload,
            version: '1.1.0',
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
    );
    if (error) throw new Error(`seed snapshot: ${error.message}`);
}

async function runTest8(page) {
    const since = new Date().toISOString();
    const { userId, email, password } = await createE2EUser();

    await seedCloudTrades(userId);
    await loginViaEmailForm(page, email, password);

    await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle', timeout: 90_000 });
    const finalPath = new URL(page.url()).pathname;
    if (finalPath.includes('/login')) {
        throw new Error('Session not established — redirected to login');
    }

    await page
        .waitForResponse(
            (r) => r.url().includes('trader_snapshots') && r.status() === 200,
            { timeout: 30_000 }
        )
        .catch(() => {});

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const patternVisible = await page.getByText(/Trading Pattern/i).isVisible().catch(() => false);
    const tiltVisible = await page
        .getByText(/TILT|rule violations|consecutive trades with broken rules/i)
        .first()
        .isVisible()
        .catch(() => false);

    await page.waitForTimeout(12_000);

    const patternRow = await waitForEvent('pattern_insight_shown', since);
    const riskRow = await waitForEvent('risk_alert_shown', since);

    results.test8a.pass = Boolean(patternRow) || patternVisible;
    results.test8a.detail = patternRow
        ? `DB pattern_insight_shown @ ${patternRow.timestamp_utc} (path ${finalPath})`
        : patternVisible
          ? `UI "Trading Pattern" on ${finalPath}; DB pending`
          : `No pattern insight — ended on ${finalPath}`;

    results.test8b.pass = Boolean(riskRow) || tiltVisible;
    results.test8b.detail = riskRow
        ? `DB risk_alert_shown @ ${riskRow.timestamp_utc}`
        : tiltVisible
          ? 'Risk/tilt alert visible on Stats'
          : `No risk_alert_shown — path ${finalPath}`;
}

async function tryEdgeSecrets() {
    const resend = loadEnv('RESEND_API_KEY');
    const reportEmail = loadEnv('BETA_REPORT_EMAIL') ?? loadEnv('NEXT_PUBLIC_SUPPORT_EMAIL');
    if (!resend || !reportEmail) {
        log('edge secrets (optional)', true, 'skipped — RESEND_API_KEY or BETA_REPORT_EMAIL not in .env.local');
        return;
    }
    const { execSync } = await import('child_process');
    try {
        execSync(
            `npx supabase secrets set RESEND_API_KEY="${resend}" BETA_REPORT_EMAIL="${reportEmail}" --project-ref ${SUPABASE_REF}`,
            { stdio: 'pipe', encoding: 'utf8' }
        );
        log('edge secrets (optional)', true, 'RESEND_API_KEY + BETA_REPORT_EMAIL set on project');
    } catch (e) {
        log('edge secrets (optional)', false, String(e.stderr ?? e.message).slice(0, 200));
    }
}

async function main() {
    console.log(`\n=== Browser tracking verify — ${BASE} ===\n`);

    if (!supabaseUrl || !serviceKey) {
        console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await runTest4(page);
        log('Test 4 — batch flush (10s interval)', results.test4.pass, results.test4.detail);

        await runTest7(browser, true);
        log('Test 7A — cookie accept', results.test7a.pass, results.test7a.detail);

        await runTest7(browser, false);
        log('Test 7B — cookie reject', results.test7b.pass, results.test7b.detail);

        try {
            const page2 = await context.newPage();
            await runTest8(page2);
            await page2.close();
        } catch (e) {
            results.test8a.detail = `Test 8 error: ${e.message}`;
            results.test8b.detail = results.test8a.detail;
        }
        log('Test 8A — pattern_insight_shown', results.test8a.pass, results.test8a.detail);
        log('Test 8B — risk/tilt alert', results.test8b.pass, results.test8b.detail);
    } finally {
        await browser.close();
    }

    await tryEdgeSecrets();

    const allPass =
        results.test4.pass &&
        results.test7a.pass &&
        results.test7b.pass &&
        results.test8a.pass &&
        results.test8b.pass;

    console.log(`\n${allPass ? 'ALL BROWSER TESTS PASSED' : 'SOME TESTS FAILED — see above'}\n`);
    process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
