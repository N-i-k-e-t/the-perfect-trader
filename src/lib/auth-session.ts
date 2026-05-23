import type { SupabaseClient, Session } from '@supabase/supabase-js';

/** Wait for session after OAuth redirect (cookies may lag one tick). */
export async function waitForSession(
    supabase: SupabaseClient,
    attempts = 8,
    delayMs = 250
): Promise<Session | null> {
    for (let i = 0; i < attempts; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return session;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const again = await supabase.auth.getSession();
            if (again.data.session?.user) return again.data.session;
        }

        if (i < attempts - 1) {
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    return null;
}
