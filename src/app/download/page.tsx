'use client';

import Link from 'next/link';
import { ArrowLeft, Smartphone, Globe } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { IS_BETA } from '@/lib/config';

export default function DownloadPage() {
    return (
        <div className="min-h-[100dvh] bg-white text-[#1a1a2e] flex flex-col items-center justify-center px-6">
            <Link href="/" className="absolute top-8 left-6 text-gray-400 font-bold text-[14px] flex items-center gap-2">
                <ArrowLeft size={18} />
                Home
            </Link>
            <div className="max-w-[400px] text-center">
                <h1 className="text-[32px] font-black tracking-tight mb-4">Get {APP_NAME}</h1>
                <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                    {IS_BETA
                        ? 'Web app is live now. Native iOS and Android apps are in development.'
                        : 'Use the web app on any device, or install from the stores when available.'}
                </p>
                <div className="flex flex-col gap-4">
                    <Link
                        href="/signup"
                        className="h-16 rounded-[24px] bg-[#1a1a2e] text-white font-black flex items-center justify-center gap-3"
                    >
                        <Globe size={22} />
                        Use web app (beta)
                    </Link>
                    <div className="h-16 rounded-[24px] bg-gray-50 border border-gray-100 font-black flex items-center justify-center gap-3 text-gray-400">
                        <Smartphone size={22} />
                        App Store — coming soon
                    </div>
                    <div className="h-16 rounded-[24px] bg-gray-50 border border-gray-100 font-black flex items-center justify-center gap-3 text-gray-400">
                        <Smartphone size={22} />
                        Google Play — coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}
