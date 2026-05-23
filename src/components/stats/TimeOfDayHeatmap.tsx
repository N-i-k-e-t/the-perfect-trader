'use client';

import type { Trade } from '@/types/trading';
import { buildDayOfWeekStats, buildTimeOfDayGrid } from '@/lib/stats-compute';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const BAND_LABELS = ['9–10', '10–12', '12–2', '2–3:30'];

export function TimeOfDayHeatmap({ trades }: { trades: Trade[] }) {
    const grid = buildTimeOfDayGrid(trades);
    const hasTimed = grid.some((row) => row.some((c) => c.total > 0));
    const dow = buildDayOfWeekStats(trades);

    return (
        <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Performance by day
            </h3>
            <div className="grid grid-cols-7 gap-1.5 mb-6">
                {dow.map((d) => (
                    <div key={d.label} className="flex flex-col items-center gap-1">
                        <div
                            className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-black ${
                                d.total === 0
                                    ? 'bg-gray-50 text-gray-300'
                                    : d.winRate >= 55
                                      ? 'bg-green-100 text-green-800'
                                      : d.winRate >= 40
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {d.total > 0 ? `${d.winRate}%` : '—'}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400">{d.label}</span>
                    </div>
                ))}
            </div>

            {hasTimed ? (
                <>
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        Time of day (when logged with time)
                    </h3>
                    <div className="grid grid-cols-8 gap-1 text-[9px] font-black text-gray-400 mb-1">
                        <span />
                        {DAY_LABELS.map((d, i) => (
                            <span key={i} className="text-center">
                                {d}
                            </span>
                        ))}
                    </div>
                    {grid.map((row, ri) => (
                        <div key={ri} className="grid grid-cols-8 gap-1 mb-1">
                            <span className="text-[9px] font-bold text-gray-400 self-center">{BAND_LABELS[ri]}</span>
                            {row.map((cell, ci) => (
                                <div
                                    key={ci}
                                    title={cell.total ? `${cell.winRate}% win (${cell.total})` : 'No data'}
                                    className={`aspect-square rounded-md ${
                                        cell.total === 0
                                            ? 'bg-gray-50'
                                            : cell.winRate >= 55
                                              ? 'bg-green-400'
                                              : cell.winRate >= 40
                                                ? 'bg-yellow-300'
                                                : 'bg-red-300'
                                    }`}
                                />
                            ))}
                        </div>
                    ))}
                </>
            ) : (
                <p className="text-[12px] font-bold text-gray-400">
                    Log trades with a timestamp for time-of-day heatmaps (coming from capture flow).
                </p>
            )}
        </section>
    );
}
