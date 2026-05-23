'use client';

import { usePathname } from 'next/navigation';
import { isPhoneFrameRoute } from '@/lib/viewport-routes';

/**
 * App/auth routes: centered 390px column on dark desktop canvas (PWA).
 * Marketing & legal: full viewport width on desktop.
 */
export default function ViewportShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const phoneFrame = isPhoneFrameRoute(pathname);

    if (phoneFrame) {
        return (
            <div className="min-h-[100dvh] w-full bg-[#0a0a12] flex justify-center">
                <div className="w-full max-w-[390px] min-h-[100dvh] relative bg-white shadow-2xl overflow-hidden md:min-h-screen md:shadow-[0_0_60px_rgba(0,0,0,0.35)]">
                    {children}
                </div>
            </div>
        );
    }

    return <div className="min-h-[100dvh] w-full">{children}</div>;
}
