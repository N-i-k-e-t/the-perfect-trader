import { STORAGE_KEY, STORAGE_KEY_LEGACY } from '@/lib/brand';

const EXTRA_KEYS = [
    'perfect_trader_cookie_consent',
    'perfect_trader_pwa_dismissed',
    'The Perfect Trader_welcome_dismissed',
    'The Perfect Trader_pricing_timer',
] as const;

/** Remove local app cache that can show a "logged in" user without a valid Supabase session. */
export function clearLocalAuthCache() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_LEGACY);
    for (const key of EXTRA_KEYS) {
        localStorage.removeItem(key);
    }
}

/**
 * Full client reset: Supabase sign-out + local cache.
 * Use when an old tab/incognito window is stuck after OAuth glitches.
 */
export async function clearStuckAuthSession(signOut?: () => Promise<void>) {
    clearLocalAuthCache();
    if (signOut) {
        try {
            await signOut();
        } catch {
            /* session may already be invalid */
        }
    }
}
