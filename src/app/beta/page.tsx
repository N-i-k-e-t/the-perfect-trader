'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { BETA_USER_CAP, SUPPORT_EMAIL } from '@/lib/config';
import { fetchBetaCapacity } from '@/lib/beta-capacity';
import { track } from '@/lib/analytics';

const WAITLIST_KEY = 'perfect_trader_beta_waitlist';

export default function BetaPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const [capacity, setCapacity] = useState<{ current: number; max: number; remaining: number } | null>(null);

    useEffect(() => {
        fetchBetaCapacity().then((c) => {
            setCapacity({ current: c.current, max: c.max, remaining: c.remaining });
            if (c.full) router.replace('/beta/full');
        });
    }, [router]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;

        try {
            const res = await fetch('/api/beta-waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmed, source: 'beta_page' }),
            });
            if (!res.ok) throw new Error('waitlist_failed');
        } catch {
            const list = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]') as string[];
            if (!list.includes(trimmed)) list.push(trimmed);
            localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
        }

        track('beta_waitlist_joined', 'settings', { submission_method: 'page' });
        setDone(true);
    };

    return (
        <div className="min-h-[100dvh] bg-[#1a1a2e] text-white flex flex-col items-center justify-center px-6">
            <Link href="/" className="absolute top-8 left-6 text-white/40 hover:text-white font-bold text-[14px] flex items-center gap-2">
                <ArrowLeft size={18} />
                Home
            </Link>
            <div className="w-full max-w-[420px] text-center">
                <div className="w-16 h-16 bg-yellow-500 text-[#1a1a2e] rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-[32px] font-black tracking-tight mb-4">Beta access</h1>
                <p className="text-white/60 font-medium mb-4 leading-relaxed">
                    {APP_NAME} is in closed beta — <strong className="text-white">first {BETA_USER_CAP} traders only</strong>.
                    All features are free during beta.
                </p>
                {capacity !== null && (
                    <p className="text-yellow-500 font-black text-[14px] uppercase tracking-widest mb-6">
                        {capacity.current} / {capacity.max} spots filled · {capacity.remaining} left
                    </p>
                )}
                <ul className="text-left text-[14px] font-bold text-white/70 space-y-2 mb-8 max-w-[360px] mx-auto">
                    <li>✓ Full access to all features during beta</li>
                    <li>✓ Direct line to the founder</li>
                    <li>✓ Founding member pricing when we launch</li>
                </ul>
                {done ? (
                    <div className="bg-white/10 rounded-[24px] p-8 border border-white/10">
                        <p className="font-black text-yellow-500 mb-2">You&apos;re on the list</p>
                        <p className="text-[14px] text-white/70 mb-6">Or claim a spot now while seats last.</p>
                        <Link href="/signup" className="block w-full h-14 bg-yellow-500 text-[#1a1a2e] rounded-full font-black flex items-center justify-center">
                            Create account
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={submit} className="flex flex-col gap-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/20 px-5 font-bold placeholder:text-white/30 focus:outline-none focus:border-yellow-500"
                        />
                        <button type="submit" className="w-full h-14 bg-yellow-500 text-[#1a1a2e] rounded-full font-black">
                            Join waitlist
                        </button>
                        <Link href="/signup" className="text-[13px] font-bold text-white/50 hover:text-white mt-2">
                            Claim a beta spot →
                        </Link>
                    </form>
                )}
                <p className="mt-12 text-[12px] text-white/30 font-bold">
                    Questions: {SUPPORT_EMAIL}
                </p>
            </div>
        </div>
    );
}
