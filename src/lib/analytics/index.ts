export { track, flushEvents, initTrackingTransport } from '@/lib/analytics/track';
export { initGeoEnrichment } from '@/lib/analytics/geo';
export {
    setTrackingSnapshot,
    getTrackingSnapshot,
    getActiveSessionFlag,
    getRuleCount,
    getTodayTradeCount,
} from '@/lib/analytics/registry';
export { useModalTracking } from '@/lib/analytics/modal-tracking';
export { incrementPageView } from '@/lib/analytics/session';
export { hasAnalyticsConsent } from '@/lib/analytics/consent';
export type { EventCategory } from '@/lib/analytics/types';
