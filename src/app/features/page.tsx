'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';

const FEATURES = [
    { title: 'Today & pre-session', desc: 'Emotional baseline, rule lock, daily discipline grade.', route: '/today' },
    { title: 'Rules engine', desc: 'Library, toggles, compliance % tied to every trade.', route: '/rules' },
    { title: 'Journal', desc: 'Log trades in under 30 seconds; link violations to rules.', route: '/journal' },
    { title: 'Diary scans', desc: 'Digitize handwritten journals; optional AI extraction.', route: '/diary' },
    { title: 'Stats & coach', desc: 'Streaks, patterns, AI discipline cards from your behavior.', route: '/stats' },
    { title: 'Calendar', desc: 'Heatmap of discipline and P&L by day.', route: '/calendar' },
    { title: 'Cloud sync', desc: 'Secure per-user storage on Supabase with RLS.', route: '/settings' },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-[100dvh] bg-white text-[#1a1a2e]">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 font-bold text-[14px] mb-10">
                    <ArrowLeft size={18} />
                    Home
                </Link>
                <h1 className="text-[36px] md:text-[48px] font-black tracking-tighter mb-4">Features</h1>
                <p className="text-gray-500 font-medium mb-12 max-w-xl">
                    Everything in {APP_NAME} supports one loop: prepare → execute → review → improve.
                </p>
                <div className="flex flex-col gap-4">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="flex gap-4 p-6 rounded-[28px] border border-gray-100 bg-gray-50/30">
                            <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={22} />
                            <div>
                                <h2 className="text-[18px] font-black mb-1">{f.title}</h2>
                                <p className="text-[14px] text-gray-500 font-medium">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Link
                    href="/signup"
                    className="inline-flex mt-12 h-14 px-10 bg-[#1a1a2e] text-white rounded-full font-black items-center"
                >
                    Start free beta
                </Link>
            </div>
        </div>
    );
}
