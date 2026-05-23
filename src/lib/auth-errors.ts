/** Map Supabase Auth errors to user-friendly copy. */
export function formatAuthError(message: string): { title: string; hint: string } {
    const m = message.toLowerCase();

    if (m.includes('redirect_uri_mismatch') || m.includes('redirect_uri')) {
        return {
            title: 'Google redirect URI mismatch',
            hint: 'In Google Cloud → Credentials → your OAuth client, add Authorized redirect URI exactly: https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback — then Save.',
        };
    }

    if (m.includes('access_denied') || m.includes('access blocked')) {
        return {
            title: 'Google sign-in blocked',
            hint: 'Add your Gmail under OAuth consent screen → Test users. Or publish the app. Guide: docs/supabase/GOOGLE_OAUTH_FIX.md',
        };
    }

    if (
        m.includes('email') &&
        (m.includes('external') || m.includes('github') || m.includes('provider'))
    ) {
        return {
            title: 'GitHub did not share your email',
            hint: 'On GitHub → Settings → Emails, enable a primary email (or make it public). Or sign in with Google. Then try GitHub again.',
        };
    }

    if (m.includes('bad_oauth_state') || m.includes('code verifier')) {
        return {
            title: 'Sign-in session expired',
            hint: 'Close all incognito windows, open a new one, or visit /auth/reset then try Google or GitHub from /signup.',
        };
    }

    if (m.includes('provider is not enabled') || m.includes('unsupported provider')) {
        return {
            title: 'Google / GitHub login is not enabled yet',
            hint: 'Enable Google or GitHub in Supabase → Authentication → Providers. Guide: docs/supabase/GOOGLE_OAUTH_EASY.md',
        };
    }

    if (m.includes('rate limit') || m.includes('rate exceeded')) {
        return {
            title: 'Too many signup emails sent',
            hint: 'Use Google or GitHub below. Or turn off Confirm email in Supabase Auth to use email signup.',
        };
    }

    if (m.includes('already registered') || m.includes('already been registered')) {
        return {
            title: 'This email is already registered',
            hint: 'Try logging in instead, or use a different email.',
        };
    }

    if (m.includes('invalid') && m.includes('email')) {
        return {
            title: 'Invalid email address',
            hint: 'Use a real email format (e.g. you@gmail.com).',
        };
    }

    if (m.includes('email not confirmed') || m.includes('confirm your email')) {
        return {
            title: 'Confirm your email first',
            hint: 'Check your inbox for the confirmation link, then log in. Or sign in with Google / GitHub if you used that to sign up.',
        };
    }

    if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
        return {
            title: 'Wrong email or password',
            hint: 'If you signed up with Google or GitHub only, use those buttons — or set a password in Settings → Email & password login.',
        };
    }

    if (m.includes('same password') || m.includes('should be different')) {
        return {
            title: 'Choose a different password',
            hint: 'Your new password must not match the current one.',
        };
    }

    if (m.includes('weak') || (m.includes('password') && m.includes('least'))) {
        return {
            title: 'Password too weak',
            hint: 'Use at least 8 characters with letters and numbers.',
        };
    }

    return {
        title: message || 'Something went wrong',
        hint: 'Try again or use Google / GitHub signup.',
    };
}
