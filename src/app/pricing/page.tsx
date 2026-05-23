'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { Check, ShieldCheck } from 'lucide-react';
import { IS_BETA } from '@/lib/config';
import { APP_NAME } from '@/lib/brand';
import { track } from '@/lib/analytics';

export default function PricingPage() {
    const { user } = usePerfectTrader();
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(600);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => setHydrated(true), []);
    useEffect(() => {
        if (hydrated && user) router.push('/today');
    }, [hydrated, user, router]);
    useEffect(() => {
        const stored = localStorage.getItem('The Perfect Trader_pricing_timer');
        if (stored) setTimeLeft(Number(stored) || 600);
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev > 0 ? prev - 1 : 600;
                localStorage.setItem('The Perfect Trader_pricing_timer', String(next));
                return next;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    if (!hydrated || user) return <div className="min-h-[100dvh] bg-[#fafafa]" />;

    return (
        <div className="min-h-[100dvh] bg-[#fafafa] pb-24">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between max-w-[900px] mx-auto">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Founding offer</p>
                    <p className="text-lg font-black text-[#1a1a2e] tabular-nums">{formatTime(timeLeft)}</p>
                </div>
                <Link
                    href="/beta"
                    onClick={() => track('external_link_clicked', 'navigation', { path: '/beta' })}
                    className="btn-primary h-11 px-6 rounded-full font-black text-[13px] flex items-center"
                >
                    Join Beta
                </Link>
            </div>

            <main className="max-w-[900px] mx-auto px-6 pt-12">
                <h1 className="text-[36px] font-black text-[#1a1a2e] text-center tracking-tight mb-3">Pricing</h1>
                <p className="text-center text-[15px] font-bold text-gray-500 mb-12 max-w-[480px] mx-auto">
                    {IS_BETA
                        ? `${APP_NAME} is free during beta. Lock founding pricing before we launch billing.`
                        : 'Choose the plan that matches your discipline journey.'}
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* FREE / BETA */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm flex flex-col">
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Beta</p>
                        <h2 className="text-[24px] font-black text-[#1a1a2e] mb-1">Free</h2>
                        <p className="text-[32px] font-black text-[#1a1a2e] mb-6">
                            ₹0 <span className="text-[14px] font-bold text-gray-400">/ during beta</span>
                        </p>
                        <ul className="flex flex-col gap-3 mb-8 flex-1 text-[14px] font-bold text-gray-600">
                            {['All features during beta', 'Rules + journal + grades', 'AI coach insights', 'No credit card'].map(
                                (f) => (
                                    <li key={f} className="flex gap-2">
                                        <Check size={18} className="text-emerald-500 shrink-0" />
                                        {f}
                                    </li>
                                )
                            )}
                        </ul>
                        <Link
                            href="/beta"
                            className="w-full h-14 btn-primary rounded-full font-black flex items-center justify-center"
                        >
                            Join Beta →
                        </Link>
                    </div>

                    {/* PRO */}
                    <div className="bg-[#1a1a2e] rounded-[32px] p-8 text-white shadow-xl flex flex-col relative overflow-hidden">
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-2">Post-beta</p>
                        <h2 className="text-[24px] font-black mb-1">Pro</h2>
                        <p className="text-[32px] font-black mb-1">
                            ₹499 <span className="text-[14px] font-bold text-white/50">/ mo</span>
                        </p>
                        <p className="text-[13px] font-bold text-white/40 mb-6">or ₹3,999 / year</p>
                        <ul className="flex flex-col gap-3 mb-8 flex-1 text-[14px] font-bold text-white/70">
                            {[
                                'Everything in Free',
                                'AI coach + advanced analytics',
                                'Trading DNA monthly reports',
                                'CSV export',
                            ].map((f) => (
                                <li key={f} className="flex gap-2">
                                    <Check size={18} className="text-emerald-400 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            disabled
                            className="w-full h-14 rounded-full font-black bg-white/10 text-white/40 cursor-not-allowed"
                        >
                            Coming Soon
                        </button>
                    </div>

                    {/* FOUNDING */}
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-[32px] border-2 border-emerald-200 p-8 flex flex-col">
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-2">Limited</p>
                        <h2 className="text-[24px] font-black text-[#1a1a2e] mb-1">Founding Member</h2>
                        <p className="text-[32px] font-black text-emerald-700 mb-2">
                            ₹299 <span className="text-[14px] font-bold text-gray-500">/ mo forever</span>
                        </p>
                        <p className="text-[13px] font-bold text-gray-500 mb-6">
                            For beta users only — price increases at launch
                        </p>
                        <ul className="flex flex-col gap-3 mb-8 flex-1 text-[14px] font-bold text-gray-600">
                            {['Lock lifetime rate', 'All Pro features', 'Founder support line'].map((f) => (
                                <li key={f} className="flex gap-2">
                                    <Check size={18} className="text-emerald-600 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/beta"
                            className="w-full h-14 bg-[#1a1a2e] text-white rounded-full font-black flex items-center justify-center"
                        >
                            Join Beta to Qualify →
                        </Link>
                    </div>
                </div>

                <p className="flex items-center justify-center gap-2 text-[13px] font-bold text-gray-400 mt-12">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    No Stripe billing yet — marketing pricing only
                </p>
            </main>
        </div>
    );
}
