'use client';



import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';

import { isSupabaseConfigured } from '@/lib/supabase-data';

import { getPostAuthPath } from '@/lib/auth-routes';

import { waitForSession } from '@/lib/auth-session';

import { userFromSupabaseAuthUser } from '@/lib/auth-user';

import { track } from '@/lib/analytics';

import type { User as SupabaseUser } from '@supabase/supabase-js';

import type { OAuthProvider } from '@/lib/auth-routes';



/** If a session exists, sync context user and leave login/signup. */

export function useRedirectIfAuthenticated(setUser: (user: ReturnType<typeof userFromSupabaseAuthUser> | null) => void) {

    const router = useRouter();

    const [checking, setChecking] = useState(true);



    useEffect(() => {

        if (!isSupabaseConfigured()) {

            setChecking(false);

            return;

        }



        const supabase = createClient();

        let cancelled = false;



        const go = (authUser: SupabaseUser) => {

            if (cancelled) return;

            const provider =

                (authUser.app_metadata?.provider as OAuthProvider | undefined) ??

                (authUser.identities?.[0]?.provider as string | undefined) ??

                'email';

            if (provider !== 'email') {
                track('oauth_callback_received', 'auth', { provider, success: true });
            }

            setUser(userFromSupabaseAuthUser(authUser));

            router.replace(getPostAuthPath(authUser));

        };



        (async () => {

            try {

                const session = await waitForSession(supabase, 6, 200);

                if (session?.user) go(session.user);

            } finally {

                if (!cancelled) setChecking(false);

            }

        })();



        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {

            if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {

                go(session.user);

            }

        });



        return () => {

            cancelled = true;

            subscription.unsubscribe();

        };

    }, [router, setUser]);



    return checking;

}

