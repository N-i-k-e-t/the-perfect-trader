/** NSE/BSE cash session — 9:15 AM – 3:30 PM IST */

export type MarketStatus = 'pre_open' | 'live' | 'closed';

function istMinutes(now: Date): number {
    const parts = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    }).formatToParts(now);
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    return h * 60 + m;
}

const OPEN_MIN = 9 * 60 + 15;
const CLOSE_MIN = 15 * 60 + 30;

export function getNseMarketStatus(now = new Date()): { status: MarketStatus; label: string } {
    const mins = istMinutes(now);
    const day = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' })
        .format(now);
    if (day === 'Sat' || day === 'Sun') {
        return { status: 'closed', label: 'Market closed (weekend)' };
    }
    if (mins < OPEN_MIN) {
        const until = OPEN_MIN - mins;
        const h = Math.floor(until / 60);
        const m = until % 60;
        const part = h > 0 ? `${h}h ${m}m` : `${m}m`;
        return { status: 'pre_open', label: `Market opens in ${part}` };
    }
    if (mins <= CLOSE_MIN) {
        return { status: 'live', label: 'Market is LIVE' };
    }
    return { status: 'closed', label: 'Market closed' };
}
