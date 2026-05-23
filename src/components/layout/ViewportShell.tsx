'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { isPhoneFrameRoute } from '@/lib/viewport-routes';

/** App routes: 390px column. Desktop: phone frame on #0f0f0f. Marketing: full width. */
export default function ViewportShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const phoneFrame = isPhoneFrameRoute(pathname);

    if (phoneFrame) {
        return (
            <motion.div className="min-h-[100dvh] w-full bg-[#0f0f0f] flex justify-center">
                <div className="w-full max-w-[390px] min-h-[100dvh] relative bg-white shadow-2xl overflow-x-hidden md:min-h-[100dvh] md:shadow-[0_0_48px_rgba(0,0,0,0.45)]">
                    {children}
                </div>
            </motion.div>
        );
    }

    return <motion.div className="min-h-[100dvh] w-full">{children}</motion.div>;
}
