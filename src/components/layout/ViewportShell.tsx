'use client';

import { usePathname } from 'next/navigation';
import { isPhoneFrameRoute } from '@/lib/viewport-routes';

/**
 * App routes: 390px phone column on mobile; full viewport on md+ (sidebar / auth panels).
 * Marketing & legal: always full width.
 */
export default function ViewportShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const phoneFrame = isPhoneFrameRoute(pathname);

    if (phoneFrame) {
        return (
            <div className="min-h-[100dvh] w-full bg-[#0a0a12] flex justify-center md:block">
                <div className="w-full max-w-[390px] min-h-[100dvh] relative bg-white shadow-2xl overflow-x-hidden md:max-w-none md:w-full md:min-h-screen md:shadow-none md:bg-transparent">
                    {children}
                </div>
            </div>
        );
    }

    return <div className="min-h-[100dvh] w-full">{children}</div>;
}
