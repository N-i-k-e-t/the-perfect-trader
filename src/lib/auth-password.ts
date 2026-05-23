import type { SupabaseClient, User } from '@supabase/supabase-js';

export type OAuthProviderId = 'google' | 'github';

export type AuthLinkStatus = {
    email: string | null;
    oauthProviders: OAuthProviderId[];
    hasEmailPassword: boolean;
    /** Signed up via Google/GitHub (may still add a password). */
    signedUpWithOAuth: boolean;
};

export function getAuthLinkStatus(authUser: User | null | undefined): AuthLinkStatus {
    const identities = authUser?.identities ?? [];
    const oauthProviders = identities
        .map((i) => i.provider)
        .filter((p): p is OAuthProviderId => p === 'google' || p === 'github');
    const hasEmailPassword = identities.some((i) => i.provider === 'email');
    const signedUpWithOAuth = oauthProviders.length > 0;

    return {
        email: authUser?.email ?? null,
        oauthProviders,
        hasEmailPassword,
        signedUpWithOAuth,
    };
}

export function oauthProviderLabel(providers: OAuthProviderId[]): string {
    if (providers.length === 0) return '';
    return providers.map((p) => (p === 'google' ? 'Google' : 'GitHub')).join(' & ');
}

export function validateNewPassword(password: string, confirm: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
}

/**
 * Link email+password to an existing account (OAuth or change existing password).
 * OAuth-first-time: only new password. Existing email identity: verify current password first.
 */
export async function setAccountPassword(
    supabase: SupabaseClient,
    params: { newPassword: string; currentPassword?: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { ok: false, message: 'You must be signed in to update your password.' };
    }

    const email = user.email?.trim();
    if (!email) {
        return { ok: false, message: 'Your account has no email address. Use Google or GitHub to sign in.' };
    }

    const { hasEmailPassword } = getAuthLinkStatus(user);

    if (hasEmailPassword) {
        const current = params.currentPassword?.trim();
        if (!current) {
            return { ok: false, message: 'Enter your current password to change it.' };
        }
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email,
            password: current,
        });
        if (verifyError) {
            return { ok: false, message: 'Current password is incorrect.' };
        }
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: params.newPassword,
    });

    if (updateError) {
        return { ok: false, message: updateError.message };
    }

    return { ok: true };
}
