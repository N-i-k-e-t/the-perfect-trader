'use client';

import type { MarketEvent } from '@/types/trading';
import { formatCountdownTo } from '@/lib/nse-expiry';
import { Clock } from 'lucide-react';

export function EventCountdownBanner({ event }: { event: MarketEvent }) {
    const countdown = formatCountdownTo(event.date, event.time ?? '09:15');

    return (
        <div className="bg-red-50 border border-red-100 rounded-[24px] px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0">
                <Clock size={22} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Next high-impact</p>
                <p className="text-[15px] font-black text-[#1a1a2e] truncate">{event.title}</p>
                <p className="text-[12px] font-bold text-gray-500">
                    {event.date} · in {countdown}
                </p>
            </div>
        </div>
    );
}
