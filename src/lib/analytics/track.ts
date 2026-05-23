import { createClient } from '@/utils/supabase/client';
import { APP_VERSION, IS_BETA } from '@/lib/config';
import { DATA_VERSION, isSupabaseConfigured } from '@/lib/supabase-data';
import { hasAnalyticsConsent } from '@/lib/analytics/consent';
import { getDeviceInfo } from '@/lib/analytics/device';
import { getGeoData } from '@/lib/analytics/geo';
import {
    getActiveSessionFlag,
    getRuleCount,
    getTodayTradeCount,
    getTrackingSnapshot,
} from '@/lib/analytics/registry';
import {
    getOrCreateAnonymousId,
    getSessionContext,
    nextEventSequence,
} from '@/lib/analytics/session';
import type { EventCategory, UserEventRow } from '@/lib/analytics/types';

const QUEUE_KEY = 'pt_event_queue';
const EVENT_BUFFER: UserEventRow[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function localIso(): string {
    const d = new Date();
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const hh = pad(offset / 60);
    const mm = pad(offset % 60);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${hh}:${mm}`;
}

function buildRow(
    eventName: string,
    category: EventCategory,
    properties: Record<string, unknown>
): UserEventRow {
    const consent = hasAnalyticsConsent();
    if (category === 'engagement' && !consent) {
        throw new Error('engagement_blocked');
    }

    const session = getSessionContext();
    const snap = getTrackingSnapshot();
    const device = getDeviceInfo();
    const geo = getGeoData();
    const now = new Date();

    return {
        event_id: crypto.randomUUID(),
        user_id: snap.userId,
        anonymous_id: getOrCreateAnonymousId(),
        session_id: session.session_id,
        event_name: eventName,
        event_category: category,
        event_properties: {
            ...properties,
            has_active_trade_session: getActiveSessionFlag(),
            current_rule_count: getRuleCount(),
            current_trade_count_today: getTodayTradeCount(),
        },

        timestamp_utc: now.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset: -now.getTimezoneOffset(),

        page_path: typeof window !== 'undefined' ? window.location.pathname : null,
        page_title: typeof document !== 'undefined' ? document.title : null,
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,

        device_type: String(device.device_type ?? null),
        os: String(device.os ?? null),
        browser: String(device.browser ?? null),
        browser_version: String(device.browser_version ?? null),
        screen_width: Number(device.screen_width ?? 0) || null,
        screen_height: Number(device.screen_height ?? 0) || null,
        viewport_width: Number(device.viewport_width ?? 0) || null,
        viewport_height: Number(device.viewport_height ?? 0) || null,
        is_pwa: Boolean(device.is_pwa),
        is_touch: Boolean(device.is_touch),
        connection_type: device.connection_type ? String(device.connection_type) : null,

        geo_country: geo.country,
        geo_country_name: geo.country_name,
        geo_region: geo.region,
        geo_region_name: geo.region_name,
        geo_city: geo.city,
        geo_lat: geo.lat,
        geo_lon: geo.lon,
        geo_isp: geo.isp,

        app_version: APP_VERSION,
        schema_version: DATA_VERSION,
        is_online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        analytics_consent: consent,
        is_beta_user: snap.isBeta ?? IS_BETA,
        is_pro_user: snap.isPro,
        is_admin: snap.isAdmin,

        session_start_utc: session.start_utc,
        session_duration_ms: Date.now() - session.start_ms,
        page_view_count: session.page_view_count,
        event_sequence: nextEventSequence(),
    };
}

export async function flushEvents(options?: { keepalive?: boolean }): Promise<void> {
    if (typeof window === 'undefined') return;

    const queued = [...EVENT_BUFFER];
    EVENT_BUFFER.length = 0;

    let stored: UserEventRow[] = [];
    try {
        stored = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as UserEventRow[];
    } catch {
        stored = [];
    }

    const toFlush = [...stored, ...queued];
    if (toFlush.length === 0) return;

    if (!isSupabaseConfigured()) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(toFlush));
        return;
    }

    try {
        const supabase = createClient();
        const { error } = await supabase.from('user_events').insert(toFlush);
        if (error) throw error;
        localStorage.removeItem(QUEUE_KEY);
    } catch {
        if (options?.keepalive && toFlush.length > 0) {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: toFlush }),
                    keepalive: true,
                    credentials: 'include',
                });
                localStorage.removeItem(QUEUE_KEY);
                return;
            } catch {
                /* fall through */
            }
        }
        localStorage.setItem(QUEUE_KEY, JSON.stringify(toFlush));
    }
}

export function track(
    eventName: string,
    category: EventCategory,
    properties: Record<string, unknown> = {}
): void {
    if (typeof window === 'undefined') return;

    try {
        const row = buildRow(eventName, category, {
            ...properties,
            timestamp_local: localIso(),
        });
        EVENT_BUFFER.push(row);
        if (EVENT_BUFFER.length >= 20) void flushEvents();
    } catch (e) {
        if (e instanceof Error && e.message === 'engagement_blocked') return;
    }
}

function flushWithBeacon(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const queued = EVENT_BUFFER.splice(0);
    let stored: UserEventRow[] = [];
    try {
        stored = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as UserEventRow[];
    } catch {
        stored = [];
    }

    const toFlush = [...stored, ...queued];
    if (toFlush.length === 0) return;

    const payload = JSON.stringify({ events: toFlush });
    const sent = navigator.sendBeacon(
        '/api/track',
        new Blob([payload], { type: 'application/json' })
    );
    if (sent) {
        localStorage.removeItem(QUEUE_KEY);
    } else {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(toFlush));
        EVENT_BUFFER.push(...queued);
    }
}

export function initTrackingTransport(): void {
    if (typeof window === 'undefined' || initialized) return;
    initialized = true;

    flushTimer = setInterval(() => void flushEvents(), 10_000);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            flushWithBeacon();
            void flushEvents();
        }
    });

    window.addEventListener('online', () => void flushEvents());

    window.addEventListener('error', (ev) => {
        track('js_error_caught', 'technical', {
            error_name: ev.error?.name ?? 'Error',
            error_message: String(ev.message ?? '').slice(0, 200),
        });
        void import('@/lib/sentry/capture').then(({ captureClientException }) => {
            captureClientException(ev.error ?? new Error(String(ev.message ?? 'Error')), {
                page_path: window.location.pathname,
            });
        });
    });

    window.addEventListener('unhandledrejection', (ev) => {
        track('js_error_caught', 'technical', {
            error_name: 'UnhandledRejection',
            error_message: String(ev.reason ?? '').slice(0, 200),
        });
        void import('@/lib/sentry/capture').then(({ captureClientException }) => {
            captureClientException(ev.reason, { page_path: window.location.pathname });
        });
    });

    void flushEvents();
}
