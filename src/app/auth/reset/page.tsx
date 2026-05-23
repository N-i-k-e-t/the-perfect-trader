'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { clearStuckAuthSession } from '@/lib/clear-auth-state';

/** Deep link to wipe stale auth from old Chrome/incognito tabs. */
export default function AuthResetPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Clearing old sign-in data…');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const supabase = createClient();
            await clearStuckAuthSession(async () => {
                await supabase.auth.signOut();
            });
            if (cancelled) return;
            setStatus('Done. Opening signup…');
            router.replace('/signup');
            router.refresh();
        })();
        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white px-8 text-center">
            <div className="w-8 h-8 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-600">{status}</p>
            <p className="text-[11px] text-gray-400 mt-2 max-w-xs">
                Use this after closing old incognito windows, or if sign-in still feels stuck.
            </p>
        </div>
    );
}
