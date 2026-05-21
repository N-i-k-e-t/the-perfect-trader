'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePerfectTrader } from '@/lib/context';

export default function TradeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { trades, rules } = usePerfectTrader();

    const trade = useMemo(() => trades.find((t) => t.id === id), [trades, id]);
    const brokenRules = useMemo(
        () => rules.filter((r) => trade?.rules_broken.includes(r.id)),
        [rules, trade]
    );
    const followedRules = useMemo(
        () => rules.filter((r) => trade?.rules_followed.includes(r.id)),
        [rules, trade]
    );

    if (!trade) {
        return (
            <div className="px-6 py-12 text-center">
                <p className="text-gray-500 font-bold mb-6">Trade not found.</p>
                <button
                    type="button"
                    onClick={() => router.push('/journal')}
                    className="text-[#1a1a2e] font-black underline"
                >
                    Back to journal
                </button>
            </div>
        );
    }

    return (
        <div className="px-5 py-6 pb-24 flex flex-col gap-6">
            <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-400 font-bold text-[14px]"
            >
                <ArrowLeft size={18} />
                Journal
            </button>

            <header className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <h1 className="text-[24px] font-black text-[#1a1a2e] mb-1">{trade.pair}</h1>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    {trade.date} · {trade.type}
                </p>
                <p
                    className={`text-[32px] font-black tabular-nums mt-4 ${
                        (trade.pnl ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {(trade.pnl ?? 0) >= 0 ? '+' : ''}
                    {(trade.pnl ?? 0).toFixed(2)}R
                </p>
            </header>

            <section className="bg-white rounded-[28px] p-6 border border-gray-100">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-4">Execution</h2>
                <dl className="grid grid-cols-2 gap-4 text-[14px]">
                    <div>
                        <dt className="font-bold text-gray-400">Entry</dt>
                        <dd className="font-black">{trade.entry || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Exit</dt>
                        <dd className="font-black">{trade.exit || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Emotion</dt>
                        <dd className="font-black capitalize">{trade.emotion}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Setup</dt>
                        <dd className="font-black">{trade.setupId || '—'}</dd>
                    </div>
                </dl>
            </section>

            {followedRules.length > 0 && (
                <section className="bg-green-50 rounded-[28px] p-6 border border-green-100">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-green-600 mb-3">Rules followed</h2>
                    <ul className="flex flex-col gap-2">
                        {followedRules.map((r) => (
                            <li key={r.id} className="text-[14px] font-bold text-green-800">
                                {r.emoji} {r.text}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {brokenRules.length > 0 && (
                <section className="bg-red-50 rounded-[28px] p-6 border border-red-100">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-3">Rules broken</h2>
                    <ul className="flex flex-col gap-2">
                        {brokenRules.map((r) => (
                            <li key={r.id} className="text-[14px] font-bold text-red-800">
                                {r.emoji} {r.text}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {trade.notes && (
                <section className="bg-white rounded-[28px] p-6 border border-gray-100">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-3">Notes</h2>
                    <p className="text-[15px] font-medium text-gray-600 leading-relaxed">{trade.notes}</p>
                </section>
            )}

            <Link href="/journal" className="text-center text-[13px] font-black text-gray-400">
                ← All trades
            </Link>
        </div>
    );
}
