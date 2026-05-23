import type { GeoCache } from '@/lib/analytics/types';

const GEO_KEY = 'pt_geo';

const emptyGeo = (): GeoCache => ({
    country: null,
    country_name: null,
    region: null,
    region_name: null,
    city: null,
    lat: null,
    lon: null,
    isp: null,
    timezone: null,
});

export function getGeoData(): GeoCache {
    if (typeof window === 'undefined') return emptyGeo();
    try {
        const raw = sessionStorage.getItem(GEO_KEY);
        if (raw) return JSON.parse(raw) as GeoCache;
    } catch {
        /* ignore */
    }
    return emptyGeo();
}

/** Fire-and-forget IP geo lookup once per tab session. */
export function initGeoEnrichment(): void {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(GEO_KEY)) return;

    void fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
            if (!data) return;
            const geo: GeoCache = {
                country: data.country_code ?? null,
                country_name: data.country_name ?? null,
                region: data.region_code ?? null,
                region_name: data.region ?? null,
                city: data.city ?? null,
                lat: typeof data.latitude === 'number' ? data.latitude : null,
                lon: typeof data.longitude === 'number' ? data.longitude : null,
                isp: data.org ?? null,
                timezone: data.timezone ?? null,
            };
            sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
        })
        .catch(() => {
            /* geo optional */
        });
}
