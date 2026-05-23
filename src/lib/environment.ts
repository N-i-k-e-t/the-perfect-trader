/** Deployment target — drives Sentry environment tags and docs. */
export type AppEnvironment = 'development' | 'staging' | 'production';

/** Production Supabase project (Tokyo). Staging uses a separate project ref in env. */
export const PRODUCTION_SUPABASE_REF = 'firqlsjixojnrofycwbs';

export function getAppEnvironment(): AppEnvironment {
    const explicit = process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase();
    if (explicit === 'staging' || explicit === 'production' || explicit === 'development') {
        return explicit;
    }
    if (process.env.VERCEL_ENV === 'production') return 'production';
    if (process.env.VERCEL_ENV === 'preview') return 'staging';
    if (process.env.NODE_ENV === 'development') return 'development';
    return 'production';
}

export function isStaging(): boolean {
    return getAppEnvironment() === 'staging';
}

export function isProduction(): boolean {
    return getAppEnvironment() === 'production';
}

export function getSupabaseProjectRef(): string | null {
    return (
        process.env.SUPABASE_PROJECT_REF ??
        process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF ??
        null
    );
}
