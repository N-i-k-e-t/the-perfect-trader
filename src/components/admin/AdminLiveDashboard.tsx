'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import BetaWaitlistPanel from './BetaWaitlistPanel';

type Overview = {
    metrics: {
        total_users: number;
        dau: number;
        wau: number;
        beta_current: number;
        beta_max: number;
        waitlist_count: number;
        events_today: number;
    };
    recent_events: {
        event_name: string;
        event_category?: string;
        page_path?: string;
        timestamp_utc: string;
        user_id?: string;
    }[];
    feature_adoption: { event_name: string; unique_users: number }[];
};

export default function AdminLiveDashboard() {
    const [data, setData] = useState<Overview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/overview');
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Failed');
            setData(json);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Load failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
        const t = setInterval(() => void load(), 30000);
        return () => clearInterval(t);
    }, [load]);

    const m = data?.metrics;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-black text-[#1a1a2e]">Live metrics</h2>
                <button
                    type="button"
                    onClick={() => void load()}
                    className="p-3 rounded-2xl bg-gray-50"
                    aria-label="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            {error && <p className="text-red-600 font-bold text-[14px]">{error}</p>}
            {m && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Users', value: m.total_users },
                        { label: 'DAU', value: m.dau },
                        { label: 'WAU', value: m.wau },
                        { label: 'Events today', value: m.events_today },
                        { label: 'Beta', value: `${m.beta_current}/${m.beta_max}` },
                        { label: 'Waitlist', value: m.waitlist_count },
                    ].map((card) => (
                        <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                            <p className="text-[28px] font-black text-[#1a1a2e] tabular-nums">{card.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] border border-gray-100 p-6">
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-4">Event stream</h3>
                    <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                        {(data?.recent_events ?? []).map((e, i) => (
                            <div key={i} className="text-[12px] font-bold border-b border-gray-50 py-2">
                                <span className="text-[#1a1a2e]">{e.event_name}</span>
                                <span className="text-gray-400 ml-2">
                                    {e.page_path ?? e.event_category} ·{' '}
                                    {new Date(e.timestamp_utc).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                        {!data?.recent_events?.length && (
                            <p className="text-gray-400 font-bold text-[13px]">No events yet</p>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-[32px] border border-gray-100 p-6">
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-4">
                        Feature adoption
                    </h3>
                    <div className="flex flex-col gap-3">
                        {(data?.feature_adoption ?? []).map((row) => (
                            <div key={row.event_name} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-[#1a1a2e] truncate">{row.event_name}</p>
                                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{
                                                width: `${Math.min(100, row.unique_users * 12)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-[12px] font-black text-gray-500 tabular-nums">
                                    {row.unique_users}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <BetaWaitlistPanel />
        </div>
    );
}
