'use client';

import type { DailyLog } from '@/types/trading';
import { buildConsistencyGrid, longestPerfectStreak } from '@/lib/stats-compute';

function cellColor(grade?: DailyLog['grade'], score?: number): string {
    if (grade === 'A' || score === 100) return 'bg-green-500';
    if (grade === 'B' || (score != null && score >= 80)) return 'bg-green-300';
    if (grade === 'C' || (score != null && score >= 60)) return 'bg-yellow-300';
    if (grade === 'D' || grade === 'F' || (score != null && score < 60)) return 'bg-red-300';
    return 'bg-gray-100';
}

export function ConsistencyHeatmap({ dailyLogs }: { dailyLogs: DailyLog[] }) {
    const cells = buildConsistencyGrid(dailyLogs, 90);
    const best = longestPerfectStreak(dailyLogs);

    return (
        <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    90-day consistency
                </h3>
                {best > 0 && (
                    <span className="text-[11px] font-black text-orange-600">{best}d best streak</span>
                )}
            </div>
            <div className="flex flex-wrap gap-1">
                {cells.map((c) => (
                    <div
                        key={c.date}
                        title={`${c.date}${c.grade ? ` · ${c.grade}` : ''}`}
                        className={`w-2.5 h-2.5 rounded-sm ${cellColor(c.grade, c.score)}`}
                    />
                ))}
            </div>
            <div className="flex gap-3 mt-4 text-[9px] font-bold text-gray-400">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-gray-100" /> None
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-green-500" /> A / 100%
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-red-300" /> Below target
                </span>
            </div>
        </section>
    );
}
