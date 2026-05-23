const CONSENT_KEY = 'perfect_trader_cookie_consent';

export function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false;
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    if (raw === 'true') return true;
    try {
        const parsed = JSON.parse(raw) as { analytics?: boolean };
        return parsed.analytics === true;
    } catch {
        return false;
    }
}
