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
            ? 'bg-green-50 border-green-200 text-green-800'
            : status === 'pre_open'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-gray-50 border-gray-200 text-gray-600';

    return (
        <div className={`w-full mb-4 px-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest text-center ${styles}`}>
            {label}
        </div>
    );
}
