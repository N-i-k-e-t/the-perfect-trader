'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/lib/brand';
import { SUPPORT_EMAIL } from '@/lib/config';

const WAITLIST_KEY = 'perfect_trader_beta_waitlist';

export default function BetaPage() {
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        const list = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]') as string[];
        if (!list.includes(email.trim())) list.push(email.trim());
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
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
                <p className="text-white/60 font-medium mb-8 leading-relaxed">
                    {APP_NAME} is in closed beta. All features are free. Help us shape the product before Pro launches.
                </p>
                {done ? (
                    <div className="bg-white/10 rounded-[24px] p-8 border border-white/10">
                        <p className="font-black text-yellow-500 mb-2">You&apos;re on the list</p>
                        <p className="text-[14px] text-white/70 mb-6">Or skip the wait — create an account now.</p>
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
                            Already invited? Sign up →
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
