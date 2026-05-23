'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { clearStuckAuthSession } from '@/lib/clear-auth-state';

type Props = {
    className?: string;
    label?: string;
};

/** Clears stale cookies + localStorage from pre-fix OAuth attempts. */
export default function ClearStuckSessionLink({
    className = 'text-[12px] font-bold text-gray-400 hover:text-[#1a1a2e] underline underline-offset-2',
    label = 'Stuck from an old tab? Clear session',
}: Props) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const handleClear = async () => {
        setBusy(true);
        const supabase = createClient();
        await clearStuckAuthSession(async () => {
            await supabase.auth.signOut();
        });
        router.replace('/signup');
        router.refresh();
        setBusy(false);
    };

    return (
        <button type="button" onClick={handleClear} disabled={busy} className={className}>
            {busy ? 'Clearing…' : label}
        </button>
    );
}
