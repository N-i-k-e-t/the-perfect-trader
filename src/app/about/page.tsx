'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Shield, Brain, Heart } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { IS_BETA } from '@/lib/config';

export default function AboutPage() {
    return (
        <div className="min-h-[100dvh] bg-white text-[#1a1a2e]">
            <header className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1a1a2e] font-bold text-[14px]">
                    <ArrowLeft size={18} />
                    Home
                </Link>
                <Link href="/signup" className="h-11 px-6 bg-[#1a1a2e] text-white rounded-full font-black text-[13px] flex items-center">
                    {IS_BETA ? 'Join beta' : 'Get started'}
                </Link>
            </header>

            <main className="max-w-4xl mx-auto px-6 pb-24">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-14 h-14 bg-[#1a1a2e] text-white rounded-2xl flex items-center justify-center mb-8">
                        <Target size={28} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter mb-6 leading-[1.05]">
                        Built for discipline,<br />not dopamine.
                    </h1>
                    <p className="text-[18px] font-medium text-gray-500 leading-relaxed max-w-2xl mb-12">
                        {APP_NAME} is a psychology-first trading journal. We help active traders measure rule
                        adherence, emotional baseline, and daily grades — so P&amp;L becomes a byproduct of process.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: Brain, title: 'Psychology first', desc: 'Pre-session mood, tilt awareness, and coaching memory — not buy/sell signals.' },
                        { icon: Shield, title: 'Your data', desc: 'Cloud sync with row-level security. Work data (trades) separated from thoughts (diary, notes).' },
                        { icon: Heart, title: 'Beta now', desc: IS_BETA ? 'All features free while we learn from real traders. Pricing comes after validation.' : 'Pro plans available on web and mobile.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="p-8 rounded-[32px] border border-gray-100 bg-gray-50/50">
                            <Icon className="text-[#f59e0b] mb-4" size={28} />
                            <h2 className="text-[18px] font-black mb-2">{title}</h2>
                            <p className="text-[14px] font-medium text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                <section className="bg-[#1a1a2e] text-white rounded-[40px] p-10 md:p-14">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-4">Mission</h2>
                    <p className="text-[20px] font-bold leading-relaxed text-white/90 mb-8">
                        We are not a broker, signal service, or financial advisor. We are a behavioral operating system
                        for traders who already know what to do — but need architecture to do it under stress.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/features" className="h-12 px-6 rounded-full bg-white/10 font-black text-[13px] flex items-center hover:bg-white/20">
                            See features
                        </Link>
                        <Link href="/blog" className="h-12 px-6 rounded-full bg-yellow-500 text-[#1a1a2e] font-black text-[13px] flex items-center">
                            Read the blog
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
