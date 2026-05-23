'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';

const CONSENT_KEY = 'perfect_trader_cookie_consent';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) {
            setVisible(true);
            track('cookie_consent_shown', 'settings', { is_first_time: true });
        }
    }, []);

    const accept = (analytics: boolean) => {
        localStorage.setItem(
            CONSENT_KEY,
            JSON.stringify({ acceptedAt: new Date().toISOString(), analytics })
        );
        track(analytics ? 'cookie_consent_accepted' : 'cookie_consent_rejected', 'settings', {});
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed bottom-0 left-0 right-0 z-[500] p-4 md:p-6 pointer-events-none"
        >
            <div className="max-w-[640px] mx-auto bg-white text-[#1a1a2e] rounded-[24px] border border-gray-200 shadow-2xl p-6 pointer-events-auto">
                <p className="text-[14px] font-bold text-gray-600 leading-relaxed mb-4">
                    We use essential cookies for sign-in and sync. Optional analytics cookies help us improve
                    the product. See our{' '}
                    <Link href="/cookies" className="text-[#2563eb] underline font-black">
                        Cookie Policy
                    </Link>
                    .
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => accept(true)}
                        className="flex-1 h-12 btn-primary rounded-full font-black text-[13px] uppercase tracking-wider"
                    >
                        Accept all
                    </button>
                    <button
                        type="button"
                        onClick={() => accept(false)}
                        className="flex-1 h-12 bg-gray-100 text-[#1a1a2e] rounded-full font-black text-[13px] uppercase tracking-wider"
                    >
                        Essential only
                    </button>
                </div>
            </div>
        </div>
    );
}
