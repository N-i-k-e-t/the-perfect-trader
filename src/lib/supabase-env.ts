/** Supabase public key — publishable (new) or anon JWT (legacy). */
export function getSupabaseAnonKey(): string {
    return (
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        'placeholder_key'
    );
}

export function getSupabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
}

export function getSiteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-perfect-trader.vercel.app';
}
