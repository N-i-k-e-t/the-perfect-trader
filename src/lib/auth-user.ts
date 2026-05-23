import type { User } from '@/types/trading';

const ALLOWED_PRO_EMAILS = ['niketpatil1624@gmail.com', 'adityaparerao8@gmail.com'];

export function userFromSupabaseAuthUser(authUser: {
    email?: string | null;
    user_metadata?: { full_name?: string };
}): User {
    const email = authUser.email || '';
    const isPro = ALLOWED_PRO_EMAILS.includes(email.toLowerCase());
    return {
        email,
        name: authUser.user_metadata?.full_name || 'Trader',
        isPro,
        isAdmin: isPro && email === 'niketpatil1624@gmail.com',
    };
}

export function userFromAuthSession(session: {
    user: { email?: string | null; user_metadata?: { full_name?: string } };
}): User {
    return userFromSupabaseAuthUser(session.user);
}
