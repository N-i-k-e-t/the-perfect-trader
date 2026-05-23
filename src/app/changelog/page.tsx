'use client';

import { useState } from 'react';
import MarketingDocLayout from '@/components/marketing/MarketingDocLayout';

const ENTRIES = [
    {
        version: 'v1.1.0',
        date: 'May 2026',
        title: 'Beta Launch',
        items: [
            '33 UX/UI improvements across all screens',
            '49-event analytics tracking system',
            'Desktop phone-frame layout',
            'Market hours indicator (IST)',
            'Trading DNA card (monthly)',
            'Canvas confetti on perfect discipline days',
            'Pull-to-refresh on all list pages',
            'Swipe-to-dismiss coach cards',
        ],
    },
    {
        version: 'v1.0.0',
        date: 'April 2026',
        title: 'Private Alpha',
        items: [
            'Core app: rules, journal, today, stats, calendar',
            'Onboarding 12-step quiz',
            'AI trade parsing via Gemini',
            'Supabase sync + offline cache',
            'PWA install support',
        ],
    },
];

export default function ChangelogPage() {
    const [email, setEmail] = useState('');
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

    async function subscribe(e: React.FormEvent) {
        e.preventDefault();
        setSubStatus('loading');
        try {
            const res = await fetch('/api/changelog-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                setSubStatus('err');
                return;
            }
            setSubStatus('ok');
            setEmail('');
        } catch {
            setSubStatus('err');
        }
    }

    return (
        <MarketingDocLayout title="Changelog" subtitle="What shipped, when. Newest first.">
            <div className="flex flex-col gap-10 border-l-2 border-emerald-500/40 pl-6 ml-2">
                {ENTRIES.map((entry) => (
                    <article key={entry.version} className="relative">
                        <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-emerald-500" />
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-2">
                            {entry.date}
                        </div>
                        <h2 className="text-[22px] font-black text-white">
                            {entry.version} — {entry.title}
                        </h2>
                        <ul className="mt-3 list-disc pl-5 space-y-2 text-white/70 text-[14px]">
                            {entry.items.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>

            <section className="mt-12 pt-8 border-t border-white/10">
                <h2 className="text-[18px] font-black text-white mb-2">Subscribe to changelog</h2>
                <p className="text-white/60 text-[14px] mb-4">Get an email when we ship major updates.</p>
                {subStatus === 'ok' ? (
                    <p className="text-emerald-400 font-bold">You&apos;re subscribed.</p>
                ) : (
                    <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-medium outline-none focus:border-emerald-500"
                        />
                        <button
                            type="submit"
                            disabled={subStatus === 'loading'}
                            className="h-12 px-6 rounded-xl bg-emerald-500 text-[#1a1a2e] font-black disabled:opacity-60"
                        >
                            Subscribe
                        </button>
                    </form>
                )}
                {subStatus === 'err' && (
                    <p className="text-red-400 text-[13px] mt-2 font-bold">Could not subscribe — try again.</p>
                )}
            </section>
        </MarketingDocLayout>
    );
}
