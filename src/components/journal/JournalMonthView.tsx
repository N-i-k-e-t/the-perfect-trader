'use client';

import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Trade } from '@/types/trading';

type Props = {
    trades: Trade[];
    onSelectDate?: (dateStr: string) => void;
};

export function JournalMonthView({ trades, onSelectDate }: Props) {
    const [month, setMonth] = useState(new Date());

    const pnlByDate = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of trades) {
            const d = t.date?.split('T')[0];
            if (!d) continue;
            map.set(d, (map.get(d) ?? 0) + (t.pnl ?? 0));
        }
        return map;
    }, [trades]);

    const days = useMemo(() => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const interval = eachDayOfInterval({ start, end });
        const pad = Array.from({ length: getDay(start) }).map(() => null);
        return [...pad, ...interval];
    }, [month]);

    const monthTrades = useMemo(
        () => trades.filter((t) => t.date?.startsWith(format(month, 'yyyy-MM'))),
        [trades, month]
    );

    const best = useMemo(() => {
        if (monthTrades.length === 0) return null;
        return monthTrades.reduce((a, b) => ((b.pnl ?? 0) > (a.pnl ?? 0) ? b : a));
    }, [monthTrades]);

    const worst = useMemo(() => {
        if (monthTrades.length === 0) return null;
        return monthTrades.reduce((a, b) => ((b.pnl ?? 0) < (a.pnl ?? 0) ? b : a));
    }, [monthTrades]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setMonth(subMonths(month, 1))}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-50"
                    aria-label="Previous month"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-[15px] font-black text-[#1a1a2e]">{format(month, 'MMMM yyyy')}</span>
                <button
                    type="button"
                    onClick={() => setMonth(addMonths(month, 1))}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-50"
                    aria-label="Next month"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {(best || worst) && (
                <div className="grid grid-cols-2 gap-3">
                    {best && (best.pnl ?? 0) > 0 && (
                        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                            <p className="text-[10px] font-black uppercase text-green-600 mb-1">Best trade</p>
                            <p className="text-[14px] font-black text-[#1a1a2e] truncate">{best.pair}</p>
                            <p className="text-[16px] font-black text-green-600">+₹{(best.pnl ?? 0).toFixed(0)}</p>
                        </div>
                    )}
                    {worst && (worst.pnl ?? 0) < 0 && (
                        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                            <p className="text-[10px] font-black uppercase text-red-600 mb-1">Worst trade</p>
                            <p className="text-[14px] font-black text-[#1a1a2e] truncate">{worst.pair}</p>
                            <p className="text-[16px] font-black text-red-600">₹{(worst.pnl ?? 0).toFixed(0)}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-300 uppercase">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                    <span key={d}>{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (!day) return <div key={`pad-${i}`} />;
                    const key = format(day, 'yyyy-MM-dd');
                    const pnl = pnlByDate.get(key);
                    const has = pnl !== undefined;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSelectDate?.(key)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-black transition-all ${
                                isToday(day) ? 'ring-2 ring-[#1a1a2e]/20' : ''
                            } ${
                                !has
                                    ? 'bg-gray-50 text-gray-300'
                                    : pnl! >= 0
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                            }`}
                        >
                            <span>{format(day, 'd')}</span>
                            {has && (
                                <span className="text-[8px] tabular-nums opacity-80">
                                    {pnl! >= 0 ? '+' : ''}
                                    {Math.abs(pnl!) >= 1000 ? `${(pnl! / 1000).toFixed(0)}k` : pnl!.toFixed(0)}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
