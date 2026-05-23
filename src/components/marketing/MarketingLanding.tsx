'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePerfectTrader } from '@/lib/context';
import { IS_BETA } from '@/lib/config';
import { APP_NAME } from '@/lib/brand';
import { track } from '@/lib/analytics';
import { fetchBetaCapacity } from '@/lib/beta-capacity';
import { PhoneMockup } from './PhoneMockup';
import {
    Target,
    BrainCircuit,
    Flame,
    Award,
    TrendingDown,
    ShieldOff,
    MessageSquare,
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MarketingLanding() {
    const { user } = usePerfectTrader();
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);
    const [spots, setSpots] = useState<{ current: number; max: number } | null>(null);

    useEffect(() => setHydrated(true), []);
    useEffect(() => {
        if (hydrated && user) router.push('/today');
    }, [hydrated, user, router]);
    useEffect(() => {
        fetchBetaCapacity().then((c) => setSpots({ current: c.current, max: c.max }));
    }, []);

    const cta = (label: string, href: string, className: string) => (
        <Link
            href={href}
            onClick={() => track('external_link_clicked', 'navigation', { path: href, label })}
            className={className}
        >
            {label}
        </Link>
    );

    if (!hydrated || user) {
        return <div className="min-h-[100dvh] bg-[#1a1a2e]" />;
    }

    return (
        <div className="min-h-[100dvh] bg-[#1a1a2e] text-white overflow-x-hidden">
            {/* HERO */}
            <section className="relative pt-24 pb-20 px-6 max-w-[1200px] mx-auto">
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="flex-1 text-center lg:text-left"
                    >
                        <h1 className="text-[40px] sm:text-[52px] lg:text-[56px] font-black tracking-tight leading-[1.05] mb-6">
                            Trade your plan.
                            <br />
                            <span className="text-emerald-400">Every session.</span>
                        </h1>
                        <p className="text-[17px] font-bold text-white/60 max-w-[480px] mx-auto lg:mx-0 mb-8 leading-relaxed">
                            The discipline OS for serious traders — rules, grades, AI coach.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                            {cta(
                                'Join Beta →',
                                '/beta',
                                'btn-primary h-14 px-10 rounded-full font-black text-[16px] flex items-center justify-center gap-2 min-h-[44px]'
                            )}
                            <a
                                href="#how-it-works"
                                className="h-14 px-8 rounded-full font-black text-[15px] text-white/80 border border-white/20 flex items-center justify-center min-h-[44px] hover:bg-white/5"
                            >
                                See how it works ↓
                            </a>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <PhoneMockup />
                    </motion.div>
                </div>
            </section>

            {/* PROBLEM */}
            <section className="py-20 px-6 bg-[#0f0f1a]">
                <div className="max-w-[900px] mx-auto text-center mb-12">
                    <motion.h2
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-[28px] sm:text-[36px] font-black tracking-tight"
                    >
                        Most traders know what to do. They just don&apos;t do it.
                    </motion.h2>
                </div>
                <div className="max-w-[1000px] mx-auto grid md:grid-cols-3 gap-4">
                    {[
                        { icon: TrendingDown, title: 'Revenge trades', desc: 'One loss becomes three — because emotion overrides the plan.' },
                        { icon: ShieldOff, title: 'Rule breaks', desc: 'You wrote the rules. You broke them anyway. No one called it out.' },
                        { icon: MessageSquare, title: 'No feedback loop', desc: 'PnL tells you what happened. Not whether you traded like a pro.' },
                    ].map((card) => (
                        <motion.div
                            key={card.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="bg-white/5 border border-white/10 rounded-[28px] p-6 text-left"
                        >
                            <card.icon className="text-emerald-400 mb-4" size={28} />
                            <h3 className="text-[17px] font-black mb-2">{card.title}</h3>
                            <p className="text-[14px] font-bold text-white/50 leading-relaxed">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-20 px-6">
                <div className="max-w-[1000px] mx-auto">
                    <h2 className="text-[13px] font-black text-emerald-400 uppercase tracking-[0.3em] text-center mb-4">How it works</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { n: '1', title: 'Set your rules', desc: 'Define the behaviors that protect your edge.' },
                            { n: '2', title: 'Plan your session', desc: 'Pre-market checklist before the open.' },
                            { n: '3', title: 'Log your trades', desc: '30-second capture with rules + emotion.' },
                            { n: '4', title: 'Get your grade', desc: 'A–F for how you traded — not what you made.' },
                        ].map((step) => (
                            <motion.div
                                key={step.n}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className="text-center lg:text-left"
                            >
                                <span className="inline-flex w-10 h-10 rounded-full bg-emerald-500 text-[#1a1a2e] font-black items-center justify-center mb-4">
                                    {step.n}
                                </span>
                                <h3 className="text-[16px] font-black mb-2">{step.title}</h3>
                                <p className="text-[13px] font-bold text-white/50">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-20 px-6 bg-[#0f0f1a]">
                <div className="max-w-[1000px] mx-auto grid md:grid-cols-3 gap-4">
                    {[
                        { icon: BrainCircuit, title: 'AI Coaching', desc: 'Catches tilt before it costs you. Real-time nudges from your behavior.' },
                        { icon: Flame, title: 'Rule Streaks', desc: 'Gamified discipline — not P&L. Build the habit loop that scales.' },
                        { icon: Award, title: 'Daily Grade', desc: 'A–F for how you traded, not what you made. Process over outcome.' },
                    ].map((f) => (
                        <motion.div
                            key={f.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="bg-[#1a1a2e] border border-emerald-500/20 rounded-[28px] p-6"
                        >
                            <f.icon className="text-emerald-400 mb-4" size={32} />
                            <h3 className="text-[18px] font-black text-emerald-400 mb-2">{f.title}</h3>
                            <p className="text-[14px] font-bold text-white/60 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SOCIAL PROOF */}
            <section className="py-16 px-6 text-center">
                <p className="text-[18px] font-black text-white/80 max-w-[520px] mx-auto">
                    Join {spots ? `${spots.max}` : '10'} beta traders building consistency — not chasing hot tips.
                </p>
                <blockquote className="mt-8 max-w-[560px] mx-auto text-[15px] font-bold text-white/50 italic border-l-2 border-emerald-500 pl-6 text-left">
                    &ldquo;Finally an app that grades my discipline, not my P&L. I stopped revenge trading in week two.&rdquo;
                    <footer className="mt-3 text-[12px] font-black text-white/30 not-italic uppercase tracking-widest">
                        — Beta trader, NIFTY options
                    </footer>
                </blockquote>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 px-6">
                <div className="max-w-[560px] mx-auto text-center">
                    <h2 className="text-[32px] font-black tracking-tight mb-4">
                        {spots ? `${spots.max - spots.current} beta spots left.` : '10 beta spots.'} First come, first served.
                    </h2>
                    {cta(
                        'Claim Your Spot →',
                        '/beta',
                        'btn-primary w-full sm:w-auto inline-flex h-16 px-12 rounded-full font-black text-[17px] items-center justify-center gap-2 min-h-[44px]'
                    )}
                    <p className="mt-4 text-[13px] font-bold text-white/40">Free during beta. No credit card.</p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 py-12 px-6 pb-[calc(env(safe-area-inset-bottom)+48px)]">
                <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-[#1a1a2e] rounded-xl flex items-center justify-center">
                            <Target size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <p className="font-black">{APP_NAME}</p>
                            <p className="text-[12px] font-bold text-white/40">Built by a trader, for traders.</p>
                        </div>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-6 text-[13px] font-bold text-white/50">
                        <Link href="/privacy" className="hover:text-white">Privacy</Link>
                        <Link href="/terms" className="hover:text-white">Terms</Link>
                        <Link href="/beta" className="hover:text-white">Beta</Link>
                        <Link href="/about" className="hover:text-white">About</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
