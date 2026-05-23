import type { OAuthProvider } from '@/lib/auth-routes';
import { oauthCallbackUrl } from '@/lib/auth-routes';

/** Provider-specific options for signInWithOAuth. */
export function getOAuthSignInOptions(provider: OAuthProvider) {
    const base = {
        redirectTo: oauthCallbackUrl(),
        skipBrowserRedirect: false as const,
    };

    if (provider === 'github') {
        return {
            ...base,
            scopes: 'read:user user:email',
        };
    }

    if (provider === 'google') {
        return {
            ...base,
            scopes: 'email profile openid',
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        };
    }

    return base;
}
