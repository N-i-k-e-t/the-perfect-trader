'use client';

import { useEffect, useState } from 'react';
import { getNseMarketStatus } from '@/lib/market-hours';

export default function MarketHoursBanner() {
    const [label, setLabel] = useState('');
    const [status, setStatus] = useState<'pre_open' | 'live' | 'closed'>('closed');

    useEffect(() => {
        const tick = () => {
            const m = getNseMarketStatus();
            setLabel(m.label);
            setStatus(m.status);
        };
        tick();
        const id = setInterval(tick, 60_000);
        return () => clearInterval(id);
    }, []);

    if (!label) return null;

    const styles =
        status === 'live'
            ? 'bg-emerald-50 border-[#10b981]/30 text-[#10b981]'
            : status === 'pre_open'
              ? 'bg-amber-50 border-[#f59e0b]/30 text-[#f59e0b]'
              : 'bg-[#f3f4f6] border-[#f3f4f6] text-[#6b7280]';

    return (
        <div
            className={`w-full mb-4 px-4 py-3 rounded-2xl border text-[12px] font-medium uppercase tracking-wide text-center min-h-[44px] flex items-center justify-center ${styles}`}
        >
            {label}
        </div>
    );
}
