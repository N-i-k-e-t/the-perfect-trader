'use client';

import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { BETA_USER_CAP, TWITTER_URL } from '@/lib/config';

export default function BetaFullPage() {
    return (
        <div className="min-h-[100dvh] bg-[#1a1a2e] text-white flex flex-col items-center justify-center px-6 text-center">
            <Link href="/" className="absolute top-8 left-6 text-white/40 hover:text-white font-bold text-[14px] flex items-center gap-2">
                <ArrowLeft size={18} />
                Home
            </Link>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Users size={32} className="text-yellow-500" />
            </div>
            <h1 className="text-[32px] font-black tracking-tight mb-4">Beta is full</h1>
            <p className="text-white/60 font-medium max-w-[400px] mb-8 leading-relaxed">
                {APP_NAME} closed beta is limited to the first {BETA_USER_CAP} traders. New signups are paused while we
                stabilize the product.
            </p>
            <Link
                href="/beta"
                className="h-14 px-10 bg-yellow-500 text-[#1a1a2e] rounded-full font-black flex items-center justify-center mb-4"
            >
                Join the waitlist
            </Link>
            <Link href="/login" className="text-[14px] font-bold text-white/50 hover:text-white">
                Already have an account? Log in
            </Link>
            <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 text-[13px] font-bold text-white/40 hover:text-yellow-500"
            >
                Follow for updates on X →
            </a>
        </div>
    );
}
