import type { SupabaseClient } from '@supabase/supabase-js';

export const DATA_VERSION = '1.1.0';

export type PersistableTraderData = Record<string, unknown> & { version?: string };

export function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    return (
        url.length > 0 &&
        key.length > 0 &&
        !url.includes('your-project-id') &&
        !url.includes('placeholder.supabase.co') &&
        !key.includes('your-anon-key') &&
        key !== 'placeholder_key'
    );
}

export async function loadTraderData(
    supabase: SupabaseClient,
    userId: string
): Promise<PersistableTraderData | null> {
    const { data, error } = await supabase
        .from('trader_snapshots')
        .select('data, version')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('[supabase] load failed', error.message);
        return null;
    }
    if (!data?.data || typeof data.data !== 'object') return null;
    return { ...(data.data as PersistableTraderData), version: data.version ?? DATA_VERSION };
}

export async function saveTraderData(
    supabase: SupabaseClient,
    userId: string,
    payload: PersistableTraderData
): Promise<boolean> {
    const { error } = await supabase.from('trader_snapshots').upsert(
        {
            user_id: userId,
            data: payload,
            version: DATA_VERSION,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
    );

    if (error) {
        console.error('[supabase] save failed', error.message);
        return false;
    }
    return true;
}
