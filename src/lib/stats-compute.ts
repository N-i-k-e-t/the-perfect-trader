import type { Trade, DailyLog, BaselineState } from '@/types/trading';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SESSION_BANDS = [
    { label: '9–10', start: 9, end: 10 },
    { label: '10–12', start: 10, end: 12 },
    { label: '12–2', start: 12, end: 14 },
    { label: '2–3:30', start: 14, end: 16 },
];

function parseTradeHour(trade: Trade): number | null {
    if (!trade.date.includes('T')) return null;
    const h = new Date(trade.date).getHours();
    return Number.isFinite(h) ? h : null;
}

function bandIndex(hour: number): number {
    for (let i = 0; i < SESSION_BANDS.length; i++) {
        if (hour >= SESSION_BANDS[i].start && hour < SESSION_BANDS[i].end) return i;
    }
    return 1;
}

export type HeatCell = { wins: number; total: number; winRate: number };

/** Day-of-week × session band win-rate grid (uses trade timestamp when present). */
export function buildTimeOfDayGrid(trades: Trade[]): HeatCell[][] {
    const grid: HeatCell[][] = Array.from({ length: SESSION_BANDS.length }, () =>
        Array.from({ length: 7 }, () => ({ wins: 0, total: 0, winRate: 0 }))
    );

    for (const t of trades) {
        const hour = parseTradeHour(t);
        if (hour == null) continue;
        const dow = new Date(t.date.split('T')[0]).getDay();
        const row = bandIndex(hour);
        const cell = grid[row][dow];
        cell.total++;
        if ((t.pnl ?? 0) > 0) cell.wins++;
    }

    for (const row of grid) {
        for (const cell of row) {
            cell.winRate = cell.total > 0 ? Math.round((cell.wins / cell.total) * 100) : 0;
        }
    }
    return grid;
}

export function buildDayOfWeekStats(trades: Trade[]) {
    return DAY_LABELS.map((label, dow) => {
        const dayTrades = trades.filter((t) => new Date(t.date.split('T')[0]).getDay() === dow);
        const wins = dayTrades.filter((t) => (t.pnl ?? 0) > 0).length;
        const winRate = dayTrades.length ? Math.round((wins / dayTrades.length) * 100) : 0;
        return { label, total: dayTrades.length, winRate };
    });
}

export function buildSymbolStats(trades: Trade[], limit = 5) {
    const map = new Map<string, { wins: number; total: number; pnl: number }>();
    for (const t of trades) {
        const key = t.pair?.toUpperCase() || 'UNKNOWN';
        const cur = map.get(key) ?? { wins: 0, total: 0, pnl: 0 };
        cur.total++;
        cur.pnl += t.pnl ?? 0;
        if ((t.pnl ?? 0) > 0) cur.wins++;
        map.set(key, cur);
    }
    return [...map.entries()]
        .map(([symbol, s]) => ({
            symbol,
            total: s.total,
            winRate: s.total ? Math.round((s.wins / s.total) * 100) : 0,
            pnl: s.pnl,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
}

export function buildEmotionOutcome(trades: Trade[]) {
    const moods: BaselineState[] = ['very_bad', 'bad', 'neutral', 'good', 'great'];
    return moods.map((m) => {
        const subset = trades.filter((t) => t.emotion === m);
        const wins = subset.filter((t) => (t.pnl ?? 0) > 0).length;
        return {
            mood: m,
            total: subset.length,
            winRate: subset.length ? Math.round((wins / subset.length) * 100) : 0,
        };
    }).filter((e) => e.total > 0);
}

export function buildConsistencyGrid(dailyLogs: DailyLog[], days = 90) {
    const cells: { date: string; grade?: DailyLog['grade']; score?: number }[] = [];
    const d = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const cell = new Date(d);
        cell.setDate(cell.getDate() - i);
        const dateStr = cell.toISOString().split('T')[0];
        const log = dailyLogs.find((l) => l.date === dateStr);
        cells.push({ date: dateStr, grade: log?.grade, score: log?.complianceScore });
    }
    return cells;
}

export function longestPerfectStreak(dailyLogs: DailyLog[]): number {
    let best = 0;
    let cur = 0;
    const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
    for (const log of sorted) {
        if (log.complianceScore === 100 || log.grade === 'A') {
            cur++;
            best = Math.max(best, cur);
        } else {
            cur = 0;
        }
    }
    return best;
}

export function monthlyTradingDna(trades: Trade[], dailyLogs: DailyLog[]) {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prefix = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    const monthTrades = trades.filter((t) => t.date.startsWith(prefix));
    const monthLogs = dailyLogs.filter((l) => l.date.startsWith(prefix));
    const compliance =
        monthLogs.length > 0
            ? Math.round(
                  monthLogs.reduce((s, l) => s + (l.complianceScore ?? 0), 0) / monthLogs.length
              )
            : 0;
    const grades = monthLogs.map((l) => l.grade).filter(Boolean);
    const gradeAvg =
        grades.length > 0
            ? grades.filter((g) => g === 'A' || g === 'B').length / grades.length
            : 0;

    const dayStats = buildDayOfWeekStats(monthTrades);
    const bestDay = [...dayStats].sort((a, b) => b.winRate - a.winRate).find((d) => d.total > 0);
    const symbolStats = buildSymbolStats(monthTrades, 1);

    return {
        monthLabel: prev.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        tradeCount: monthTrades.length,
        compliance,
        gradeLabel: gradeAvg >= 0.6 ? 'Strong' : gradeAvg >= 0.35 ? 'Mixed' : 'Building',
        insights: [
            bestDay ? `Best day: ${bestDay.label} (${bestDay.winRate}% win rate)` : 'Log more trades to find your best day',
            symbolStats[0]
                ? `Top symbol: ${symbolStats[0].symbol} (${symbolStats[0].total} trades)`
                : 'Add symbols to see where you perform best',
            monthTrades.filter((t) => (t.rules_broken?.length ?? 0) > 0).length > 0
                ? `${monthTrades.filter((t) => (t.rules_broken?.length ?? 0) > 0).length} trades had rule breaks — focus on one rule next month`
                : 'Clean month on rules — keep the streak',
        ],
    };
}
