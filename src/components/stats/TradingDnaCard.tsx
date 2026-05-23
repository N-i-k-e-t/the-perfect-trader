'use client';

import type { Trade, DailyLog } from '@/types/trading';
import { monthlyTradingDna } from '@/lib/stats-compute';
import { Sparkles } from 'lucide-react';

export function TradingDnaCard({ trades, dailyLogs }: { trades: Trade[]; dailyLogs: DailyLog[] }) {
    const dna = monthlyTradingDna(trades, dailyLogs);
    if (dna.tradeCount === 0 && dailyLogs.length < 3) return null;

    return (
        <section className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 opacity-20" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Trading DNA</p>
            <h3 className="text-[18px] font-black mb-4">{dna.monthLabel}</h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div>
                    <p className="text-[20px] font-black tabular-nums">{dna.tradeCount}</p>
                    <p className="text-[9px] font-bold text-white/50 uppercase">Trades</p>
                </div>
                <div>
                    <p className="text-[20px] font-black tabular-nums">{dna.compliance}%</p>
                    <p className="text-[9px] font-bold text-white/50 uppercase">Compliance</p>
                </div>
                <div>
                    <p className="text-[20px] font-black">{dna.gradeLabel}</p>
                    <p className="text-[9px] font-bold text-white/50 uppercase">Grade trend</p>
                </div>
            </div>
            <ul className="flex flex-col gap-2 relative z-10">
                {dna.insights.map((line, i) => (
                    <li key={i} className="text-[13px] font-bold text-white/85 flex gap-2">
                        <span className="text-emerald-400">→</span>
                        {line}
                    </li>
                ))}
            </ul>
        </section>
    );
}
