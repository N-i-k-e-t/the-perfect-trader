'use client';

import { useState } from 'react';

export default function ContactForm({ compact = false }: { compact?: boolean }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error ?? 'Something went wrong');
                setStatus('error');
                return;
            }
            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');
        } catch {
            setErrorMsg('Network error — try again');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <p className="text-emerald-400 font-bold text-[16px] py-4">
                Got it — I&apos;ll reply within 24 hours.
            </p>
        );
    }

    return (
        <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${compact ? '' : 'mt-6'}`}>
            <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-medium text-[15px] outline-none focus:border-emerald-500"
            />
            <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-medium text-[15px] outline-none focus:border-emerald-500"
            />
            <textarea
                required
                minLength={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message (min 10 characters)"
                rows={compact ? 4 : 6}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-medium text-[15px] outline-none focus:border-emerald-500 resize-none"
            />
            {status === 'error' && (
                <p className="text-red-400 text-[14px] font-bold">{errorMsg}</p>
            )}
            <button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 rounded-lg bg-emerald-500 text-[#1a1a2e] font-black text-[15px] hover:bg-emerald-400 "
            >
                {status === 'loading' ? 'Sending…' : 'Send message'}
            </button>
        </form>
    );
}
