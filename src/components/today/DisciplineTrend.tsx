'use client';

import type { DailyLog } from '@/types/trading';
import { scoreToGrade } from '@/lib/discipline';

export default function DisciplineTrend({
    dailyLogs,
    today,
    todayScore,
}: {
    dailyLogs: DailyLog[];
    today: string;
    todayScore: number;
}) {
    const last7 = [...dailyLogs]
        .filter((l) => l.date <= today)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7)
        .reverse();

    const scores =
        last7.length > 0
            ? last7.map((l) => l.complianceScore ?? 0)
            : [0, 0, 0, 0, 0, 0, todayScore];

    const max = Math.max(...scores, 1);
    const best = dailyLogs.reduce(
        (acc, l) => {
            const s = l.complianceScore ?? 0;
            if (s > acc.score) return { date: l.date, score: s };
            return acc;
        },
        { date: '', score: -1 }
    );
    const isBestToday = best.date === today && todayScore > 0;

    return (
        <div className="w-full flex flex-col gap-2 mt-4">
            <div className="flex items-end justify-between gap-1 h-10 px-1">
                {scores.map((s, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t-md bg-[#10b981]/80 min-h-[4px]"
                        style={{ height: `${Math.max(12, (s / max) * 100)}%` }}
                        title={`${s}%`}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-[#9ca3af] uppercase tracking-wide">
                    7-day discipline
                </span>
                {isBestToday && (
                    <span className="text-[12px] font-medium text-[#10b981] uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded-full">
                        Best day · {scoreToGrade(todayScore)}
                    </span>
                )}
            </div>
        </div>
    );
}
