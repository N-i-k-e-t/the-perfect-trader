import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Server-only Supabase client (service role). Never import from client components. */
export function createAdminClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export function isFounderAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const normalized = email.toLowerCase();
    const fromEnv = process.env.ADMIN_EMAILS?.split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    if (fromEnv && fromEnv.length > 0) {
        return fromEnv.includes(normalized);
    }
    return normalized === 'niketpatil1624@gmail.com';
}
