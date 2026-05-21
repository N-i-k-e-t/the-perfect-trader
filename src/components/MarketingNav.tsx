'use client';

import Link from 'next/link';
import { Target } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { IS_BETA } from '@/lib/config';

export default function MarketingNav() {
    return (
        <nav
            className="fixed top-0 left-0 right-0 h-[64px] z-[1000] backdrop-blur-xl bg-white/80 border-b border-gray-100/50 flex items-center justify-between"
            style={{
                paddingLeft: 'max(env(safe-area-inset-left), 24px)',
                paddingRight: 'max(env(safe-area-inset-right), 24px)',
            }}
        >
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a1a2e] text-white rounded-lg flex items-center justify-center shadow-lg">
                    <Target size={18} strokeWidth={3} />
                </div>
                <span className="text-[18px] font-black tracking-tight text-[#1a1a2e] hidden sm:inline">{APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/features" className="hidden md:block text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a2e]">
                    Features
                </Link>
                <Link href="/blog" className="hidden md:block text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a2e]">
                    Blog
                </Link>
                <Link href="/about" className="hidden sm:block text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a2e]">
                    About
                </Link>
                <Link href="/pricing" className="hidden sm:block text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a2e]">
                    Pricing
                </Link>
                <Link
                    href={IS_BETA ? '/beta' : '/signup'}
                    className="text-[13px] font-black text-white bg-[#1a1a2e] px-4 sm:px-5 py-2 rounded-full"
                >
                    {IS_BETA ? 'Join beta' : 'Start free'}
                </Link>
                <Link href="/login" className="text-[13px] font-bold text-[#1a1a2e] hidden sm:block">
                    Log in
                </Link>
            </div>
        </nav>
    );
}
