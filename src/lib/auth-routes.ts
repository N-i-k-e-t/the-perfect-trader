import type { User as SupabaseUser } from '@supabase/supabase-js';

/** Where to send someone after a successful sign-in or sign-up. */
export function getPostAuthPath(authUser: SupabaseUser | null | undefined): '/today' | '/onboarding' {
    if (!authUser) return '/onboarding';
    const completed = authUser.user_metadata?.onboarding_completed === true;
    return completed ? '/today' : '/onboarding';
}

export const OAUTH_PROVIDERS = ['google', 'github'] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/** Must match an entry in Supabase Auth → URL configuration → Redirect URLs. */
export function oauthCallbackUrl(): string {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/auth/callback`;
}
