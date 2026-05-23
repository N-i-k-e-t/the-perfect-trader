/**
 * End-to-end tracking verification (automated layers).
 * Run: node scripts/verify-tracking-e2e.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

function loadEnv(name) {
    if (process.env[name]) return process.env[name];
    for (const f of ['.env.local', '.env.observability']) {
        if (!existsSync(f)) continue;
        const line = readFileSync(f, 'utf8').split('\n').find((l) => l.startsWith(`${name}=`));
        if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    }
    return null;
}

const REQUIRED = {
    auth: [
        'signup_started',
        'signup_completed',
        'signup_failed',
        'login_started',
        'login_completed',
        'login_failed',
        'logout_triggered',
        'oauth_redirect_initiated',
    ],
    onboarding: ['onboarding_started', 'onboarding_step_viewed', 'onboarding_quiz_completed'],
    navigation: ['page_viewed', 'tab_switched', 'modal_opened', 'modal_closed'],
    trades: [
        'trade_created',
        'trade_edited',
        'trade_deleted',
        'trade_ai_parsed',
        'trade_ai_parse_accepted',
    ],
    rules: [
        'rule_created',
        'rule_edited',
        'rule_deleted',
        'rule_violated_flagged',
        'rule_followed_flagged',
    ],
    session: [
        'session_pre_plan_completed',
        'session_post_note_added',
        'session_stability_score_viewed',
    ],
    ai: [
        'coach_message_shown',
        'coach_message_dismissed',
        'risk_alert_shown',
        'ai_diary_scan_started',
        'ai_diary_scan_completed',
        'pattern_insight_shown',
    ],
    technical: [
        'app_loaded',
        'cloud_sync_completed',
        'cloud_sync_failed',
        'offline_mode_entered',
        'js_error_caught',
        'api_call_made',
    ],
    settings: [
        'cookie_consent_shown',
        'cookie_consent_accepted',
        'cookie_consent_rejected',
        'data_export_requested',
        'beta_waitlist_joined',
    ],
    engagement: ['scroll_depth_reached', 'time_on_page', 'idle_detected', 'rage_click_detected'],
};

const ALL_REQUIRED = Object.values(REQUIRED).flat();

function scanTrackEvents(dir = 'src') {
    const found = new Set();
    const files = [];
    function walk(p) {
        for (const name of readdirSync(p, { withFileTypes: true })) {
            const full = join(p, name.name);
            if (name.isDirectory() && name.name !== 'node_modules') walk(full);
            else if (/\.(tsx?|jsx?)$/.test(name.name)) files.push(full);
        }
    }
    walk(dir);
    const re = /track\(\s*['"`]([a-z0-9_]+)['"`]/g;
    for (const file of files) {
        const text = readFileSync(file, 'utf8');
        let m;
        while ((m = re.exec(text))) found.add(m[1]);
    }
    return { found, files: files.length };
}

function checkEnvelope(row) {
    const fields = [
        'event_id',
        'user_id',
        'anonymous_id',
        'session_id',
        'event_name',
        'timestamp_utc',
        'timezone',
        'timezone_offset',
        'page_path',
        'device_type',
        'geo_country',
        'geo_city',
        'app_version',
        'analytics_consent',
    ];
    const nulls = [];
    for (const f of fields) {
        if (f === 'user_id') {
            if (!row.user_id && !row.anonymous_id) nulls.push('user_id|anonymous_id');
            continue;
        }
        if (row[f] === null || row[f] === undefined || row[f] === '') nulls.push(f);
    }
    return nulls;
}

const url = loadEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = loadEnv('SUPABASE_SERVICE_ROLE_KEY');
const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const report = { tests: {} };

// TEST 1
const { count, error: t1e } = await admin
    .from('user_events')
    .select('*', { count: 'exact', head: true });
const { data: metaRows } = await admin.from('user_events').select('event_name, user_id, timestamp_utc');
const names = new Set((metaRows ?? []).map((r) => r.event_name));
const users = new Set((metaRows ?? []).map((r) => r.user_id).filter(Boolean));
const last = (metaRows ?? []).reduce((a, r) => {
    const t = r.timestamp_utc;
    return !a || (t && t > a) ? t : a;
}, null);

report.tests.test1 = {
    pass: !t1e && count > 0,
    table_exists: !t1e,
    total_rows: count ?? 0,
    unique_users: users.size,
    unique_event_types: names.size,
    last_event_at: last,
    error: t1e?.message,
};

// TEST 2
const { found } = scanTrackEvents();
const present = ALL_REQUIRED.filter((e) => found.has(e));
const missing = ALL_REQUIRED.filter((e) => !found.has(e));
const extra = [...found].filter((e) => !ALL_REQUIRED.includes(e)).sort();

report.tests.test2 = {
    pass: missing.length === 0,
    present: present.length,
    total: ALL_REQUIRED.length,
    missing,
    extra_in_code: extra,
    all_code_events: [...found].sort(),
};

// TEST 3
const { data: samples } = await admin
    .from('user_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

const envelopeChecks = (samples ?? []).map((row, i) => ({
    index: i,
    event_name: row.event_name,
    null_fields: checkEnvelope(row),
}));
const allNullFields = new Set(envelopeChecks.flatMap((c) => c.null_fields));
report.tests.test3 = {
    pass: samples?.length > 0 && envelopeChecks.every((c) => c.null_fields.length <= 2),
    samples: envelopeChecks,
    commonly_null: [...allNullFields],
    fields_checked: 13,
    non_null_score:
        samples?.length > 0
            ? 13 -
              Math.round(
                  envelopeChecks.reduce((s, c) => s + c.null_fields.length, 0) / envelopeChecks.length
              )
            : 0,
};

// TEST 4-8 code verification
const trackSrc = readFileSync('src/lib/analytics/track.ts', 'utf8');
const tpSrc = readFileSync('src/components/analytics/TrackingProvider.tsx', 'utf8');
const geoSrc = existsSync('src/lib/analytics/geo.ts')
    ? readFileSync('src/lib/analytics/geo.ts', 'utf8')
    : '';
const consentSrc = readFileSync('src/lib/analytics/consent.ts', 'utf8');

report.tests.test4 = {
    pass_code: trackSrc.includes('sendBeacon') && trackSrc.includes('visibilitychange'),
    flush_interval: trackSrc.includes('10_000') || trackSrc.includes('10000'),
    queue_key: trackSrc.includes('pt_event_queue'),
    note: 'Browser A/B/C requires manual DevTools verification',
    manual: { A: 'pending', B: 'pending', C: 'pending' },
};

report.tests.test5 = {
    pass_code: geoSrc.includes('ipapi') && tpSrc.includes('initGeoEnrichment'),
    session_key: 'pt_geo',
    note: 'Browser sessionStorage check manual',
};

report.tests.test6 = {
    pass_code:
        readFileSync('src/lib/analytics/session.ts', 'utf8').includes('pt_session_ctx') &&
        readFileSync('src/lib/analytics/session.ts', 'utf8').includes('pt_anonymous_id'),
    note: 'Browser sessionStorage/localStorage check manual',
};

report.tests.test7 = {
    pass_code:
        consentSrc.includes('hasAnalyticsConsent') &&
        trackSrc.includes('engagement_blocked') &&
        tpSrc.includes('hasAnalyticsConsent'),
    note: 'Browser incognito + consent test manual',
    manual: { A: 'pending', B: 'pending' },
};

const tradeModal = readFileSync('src/components/TradeEntryModal.tsx', 'utf8');
report.tests.test8 = {
    A_code: tradeModal.includes('trade_ai_parsed') && tradeModal.includes('ai_confidence'),
    B_code: existsSync('src/components/InsightCards.tsx'),
    C_code: readFileSync('src/lib/context.tsx', 'utf8').includes('tilt_warning'),
    note: 'Browser UI verification manual',
    manual: { A: 'pending', B: 'pending', C: 'pending' },
};

const fnDir = 'supabase/functions';
const functions = existsSync(fnDir)
    ? readdirSync(fnDir).filter((d) => existsSync(join(fnDir, d, 'index.ts')))
    : [];
report.tests.test9 = {
    A_code: existsSync('src/lib/retention/coach-tune.ts'),
    B_code: existsSync('src/components/retention/PlaybookNudgeBanner.tsx'),
    C_code: functions.includes('update-user-model') &&
        functions.includes('retention-check') &&
        functions.includes('weekly-beta-report'),
    C_deployed: 'unknown — run: npx supabase functions list',
    D_cron: 'unknown — run SELECT * FROM cron.job in SQL Editor',
    functions_in_repo: functions,
};

// TEST 10 - run saved queries logic (simplified)
const queries = [
    { name: 'pt_daily_active_users', sql: `SELECT DATE(timestamp_utc) as day, COUNT(DISTINCT user_id) as dau FROM user_events WHERE timestamp_utc > NOW() - INTERVAL '30 days' AND user_id IS NOT NULL GROUP BY day` },
];
// Use postgrest can't run raw SQL - mark as manual for full 10
report.tests.test10 = {
    pass: !t1e,
    note: 'Run each query in SAVED_QUERIES.sql in Supabase SQL Editor (production firqlsjixojnrofycwbs)',
    queries_file: 'docs/analytics/SAVED_QUERIES.sql',
    automated: 'Table readable via service role — SQL Editor execution manual',
};

console.log(JSON.stringify(report, null, 2));
