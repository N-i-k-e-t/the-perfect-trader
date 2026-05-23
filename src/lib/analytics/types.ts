export const EVENT_CATEGORIES = [
    'auth',
    'onboarding',
    'navigation',
    'rules',
    'playbooks',
    'trades',
    'session',
    'logs',
    'analytics',
    'ai',
    'psychology',
    'calendar',
    'settings',
    'technical',
    'engagement',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Row shape for Supabase `user_events` inserts. */
export type UserEventRow = {
    event_id: string;
    user_id: string | null;
    anonymous_id: string;
    session_id: string;
    event_name: string;
    event_category: string;
    event_properties: Record<string, unknown>;

    timestamp_utc: string;
    timezone: string | null;
    timezone_offset: number | null;

    page_path: string | null;
    page_title: string | null;
    referrer: string | null;

    device_type: string | null;
    os: string | null;
    browser: string | null;
    browser_version: string | null;
    screen_width: number | null;
    screen_height: number | null;
    viewport_width: number | null;
    viewport_height: number | null;
    is_pwa: boolean | null;
    is_touch: boolean | null;
    connection_type: string | null;

    geo_country: string | null;
    geo_country_name: string | null;
    geo_region: string | null;
    geo_region_name: string | null;
    geo_city: string | null;
    geo_lat: number | null;
    geo_lon: number | null;
    geo_isp: string | null;

    app_version: string | null;
    schema_version: string | null;
    is_online: boolean | null;
    analytics_consent: boolean;
    is_beta_user: boolean;
    is_pro_user: boolean;
    is_admin: boolean;

    session_start_utc: string | null;
    session_duration_ms: number | null;
    page_view_count: number | null;
    event_sequence: number | null;
};

export type GeoCache = {
    country: string | null;
    country_name: string | null;
    region: string | null;
    region_name: string | null;
    city: string | null;
    lat: number | null;
    lon: number | null;
    isp: string | null;
    timezone: string | null;
};
