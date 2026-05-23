'use client';

import { ReactNode } from 'react';

type Variant = 'auth-card' | 'flow-wide';

/**
 * Mobile: full-bleed white screen inside the phone shell.
 * Desktop: centered panel on navy canvas (auth card or wide flow for onboarding).
 */
export default function AppScreenLayout({
    children,
    variant = 'auth-card',
}: {
    children: ReactNode;
    variant?: Variant;
}) {
    const panelMax = variant === 'flow-wide' ? 'md:max-w-3xl' : 'md:max-w-[480px]';

    return (
        <div className="min-h-[100dvh] w-full bg-white md:bg-[#0a0a12] md:flex md:items-center md:justify-center md:p-6 lg:p-10">
            <div
                className={`w-full min-h-[100dvh] md:min-h-0 ${panelMax} md:rounded-[32px] md:shadow-[0_32px_100px_rgba(0,0,0,0.4)] md:overflow-hidden md:max-h-[min(94vh,920px)] md:overflow-y-auto bg-white relative mx-auto`}
            >
                {children}
            </div>
        </div>
    );
}
