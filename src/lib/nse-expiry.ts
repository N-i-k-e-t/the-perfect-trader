import type { MarketEvent } from '@/types/trading';

/** Last Thursday of month — NSE F&O monthly expiry (IST calendar date). */
export function lastThursdayOfMonth(year: number, monthIndex: number): Date {
    const d = new Date(year, monthIndex + 1, 0);
    while (d.getDay() !== 4) d.setDate(d.getDate() - 1);
    return d;
}

export function generateNseFoExpiryEvents(monthsAhead = 6): MarketEvent[] {
    const events: MarketEvent[] = [];
    const start = new Date();
    for (let i = 0; i < monthsAhead; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const expiry = lastThursdayOfMonth(d.getFullYear(), d.getMonth());
        const dateStr = expiry.toISOString().split('T')[0];
        events.push({
            id: `nse_fo_${dateStr}`,
            date: dateStr,
            time: '15:30',
            title: 'NSE F&O Monthly Expiry',
            impact: 'high',
            country: 'India',
            type: 'Expiry',
        });
    }
    return events;
}

export function mergeMarketEvents(base: MarketEvent[], extra: MarketEvent[]): MarketEvent[] {
    const seen = new Set(base.map((e) => `${e.date}-${e.title}`));
    const merged = [...base];
    for (const e of extra) {
        const key = `${e.date}-${e.title}`;
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(e);
        }
    }
    return merged.sort((a, b) => a.date.localeCompare(b.date));
}

export function nextHighImpactEvent(events: MarketEvent[]): MarketEvent | null {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = events
        .filter((e) => e.date >= today && (e.impact === 'high' || e.impact === 'critical'))
        .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] ?? null;
}

export function formatCountdownTo(dateStr: string, timeStr = '09:15'): string {
    const target = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const ms = target.getTime() - now.getTime();
    if (ms <= 0) return 'Now';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}
