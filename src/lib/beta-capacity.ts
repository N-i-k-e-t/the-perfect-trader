import { createClient } from '@/utils/supabase/client';
import { BETA_USER_CAP, IS_BETA } from '@/lib/config';

export type BetaCapacity = {
    max: number;
    current: number;
    remaining: number;
    allowed: boolean;
    full: boolean;
};

const fallback = (): BetaCapacity => {
    const max = BETA_USER_CAP;
    return { max, current: 0, remaining: max, allowed: true, full: false };
};

export async function fetchBetaCapacity(): Promise<BetaCapacity> {
    if (!IS_BETA) {
        return { max: 999999, current: 0, remaining: 999999, allowed: true, full: false };
    }

    try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('get_beta_capacity');
        if (error || !data || typeof data !== 'object') {
            console.warn('[beta] capacity RPC unavailable', error?.message);
            return fallback();
        }
        const row = data as Record<string, unknown>;
        const max = Number(row.max) || BETA_USER_CAP;
        const current = Number(row.current) || 0;
        const remaining = Math.max(0, Number(row.remaining) ?? max - current);
        const full = Boolean(row.full) || current >= max;
        return {
            max,
            current,
            remaining,
            allowed: Boolean(row.allowed) && !full,
            full,
        };
    } catch {
        return fallback();
    }
}
