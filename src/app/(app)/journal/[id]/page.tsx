'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { usePerfectTrader } from '@/lib/context';
export default function TradeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { trades, rules, openCaptureForEdit, removeTrade, showToast } = usePerfectTrader();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const trade = useMemo(() => trades.find((t) => t.id === id), [trades, id]);
    const brokenRules = useMemo(
        () => rules.filter((r) => trade?.rules_broken?.includes(r.id)),
        [rules, trade]
    );
    const followedRules = useMemo(
        () => rules.filter((r) => trade?.rules_followed?.includes(r.id)),
        [rules, trade]
    );

    const compliancePct = useMemo(() => {
        if (!trade) return 0;
        const total = (trade.rules_followed?.length ?? 0) + (trade.rules_broken?.length ?? 0);
        if (total === 0) return 100;
        return Math.round(((trade.rules_followed?.length ?? 0) / total) * 100);
    }, [trade]);

    if (!trade) {
        return (
            <div className="px-6 py-12 text-center max-w-[480px] mx-auto">
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

    const handleDelete = () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        removeTrade(trade.id);
        showToast('Trade deleted', 'success');
        router.push('/journal');
    };

    return (
        <div className="px-5 py-6 pb-24 flex flex-col gap-6 max-w-[480px] mx-auto">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-400 font-bold text-[14px] min-h-[44px]"
                >
                    <ArrowLeft size={18} />
                    Journal
                </button>
                <button
                    type="button"
                    onClick={() => openCaptureForEdit(trade)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center btn-primary rounded-full active:scale-95 shadow-lg"
                    aria-label="Edit trade"
                >
                    <Pencil size={18} />
                </button>
            </div>

            <header className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <h1 className="text-[24px] font-black text-[#1a1a2e] mb-1">{trade.pair}</h1>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    {trade.date?.split('T')[0]} · {trade.type}
                </p>
                <p
                    className={`text-[32px] font-black tabular-nums mt-4 ${
                        (trade.pnl ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {(trade.pnl ?? 0) >= 0 ? '+' : ''}
                    ₹{(trade.pnl ?? 0).toFixed(0)}
                </p>
                {trade.pnlR != null && (
                    <p className="text-[13px] font-bold text-gray-400 mt-1">{trade.pnlR.toFixed(2)}R</p>
                )}
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
                        <dt className="font-bold text-gray-400">Planned SL</dt>
                        <dd className="font-black">{trade.plannedSL || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Actual SL</dt>
                        <dd className="font-black">{trade.actualSL || '—'}</dd>
                    </div>
                </dl>
            </section>

            <section className="bg-white rounded-[28px] p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300">Rules</h2>
                    <span className="text-[12px] font-black text-blue-600">{compliancePct}% followed</span>
                </div>
                {followedRules.length > 0 && (
                    <ul className="flex flex-col gap-2 mb-4">
                        {followedRules.map((r) => (
                            <li key={r.id} className="text-[14px] font-bold text-green-700 flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                {r.emoji} {r.text}
                            </li>
                        ))}
                    </ul>
                )}
                {brokenRules.length > 0 && (
                    <ul className="flex flex-col gap-2">
                        {brokenRules.map((r) => (
                            <li key={r.id} className="text-[14px] font-bold text-red-700 flex items-center gap-2">
                                <span className="text-red-500">✕</span>
                                {r.emoji} {r.text}
                            </li>
                        ))}
                    </ul>
                )}
                {followedRules.length === 0 && brokenRules.length === 0 && (
                    <p className="text-[13px] font-bold text-gray-400">No rules logged for this trade.</p>
                )}
            </section>

            <section className="bg-white rounded-[28px] p-6 border border-gray-100">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-4">Psychology</h2>
                <dl className="grid grid-cols-2 gap-4 text-[14px]">
                    <div>
                        <dt className="font-bold text-gray-400">Emotion</dt>
                        <dd className="font-black capitalize">{trade.emotion || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Mood before</dt>
                        <dd className="font-black capitalize">{trade.moodBefore || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Mood after</dt>
                        <dd className="font-black capitalize">{trade.moodAfter || '—'}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-gray-400">Setup</dt>
                        <dd className="font-black">{trade.setupId || '—'}</dd>
                    </div>
                </dl>
            </section>

            {trade.notes && (
                <section className="bg-white rounded-[28px] p-6 border border-gray-100">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-3">Notes</h2>
                    <p className="text-[15px] font-medium text-gray-600 leading-relaxed">{trade.notes}</p>
                </section>
            )}

            <div className="flex flex-col gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => openCaptureForEdit(trade)}
                    className="w-full h-14 btn-primary rounded-[24px] font-black text-[15px]"
                >
                    Edit trade
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className={`w-full h-14 rounded-[24px] font-black text-[15px] flex items-center justify-center gap-2 ${
                        confirmDelete ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                >
                    <Trash2 size={18} />
                    {confirmDelete ? 'Tap again to confirm delete' : 'Delete trade'}
                </button>
            </div>
        </div>
    );
}
