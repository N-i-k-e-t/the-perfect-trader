'use client';

import { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';

type Row = {
    id: string;
    email: string;
    source: string;
    created_at: string;
    invited_at: string | null;
};

export default function BetaWaitlistPanel() {
    const [rows, setRows] = useState<Row[]>([]);
    const [count, setCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/beta-waitlist');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Failed to load');
            setRows(data.rows ?? []);
            setCount(data.count ?? 0);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Load failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const invite = async (email: string) => {
        setInviting(email);
        setError(null);
        try {
            const res = await fetch('/api/admin/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Invite failed');
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invite failed');
        } finally {
            setInviting(null);
        }
    };

    return (
        <div className="bg-white rounded-[40px] border border-[#1a1a2e]/5 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-[#1a1a2e]">Beta waitlist</h3>
                    <p className="text-[12px] font-bold text-gray-400 mt-1">
                        Invite sends Resend email and marks row as invited
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void load()}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Refresh waitlist"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            {error && (
                <p className="px-8 py-4 text-[13px] font-bold text-red-600">{error}</p>
            )}
            <p className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                {count} on waitlist
            </p>
            <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
                {rows.length === 0 && !loading && !error && (
                    <p className="p-8 text-[14px] font-bold text-gray-400">No entries yet.</p>
                )}
                {rows.map((row) => (
                    <div key={row.id} className="px-8 py-4 flex items-center gap-3">
                        <Mail size={16} className="text-gray-300 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold text-[#1a1a2e] truncate">{row.email}</p>
                            <p className="text-[11px] font-bold text-gray-400">
                                {row.source} · {new Date(row.created_at).toLocaleString()}
                            </p>
                        </div>
                        {row.invited_at ? (
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider shrink-0">
                                Invited ✓
                            </span>
                        ) : (
                            <button
                                type="button"
                                disabled={inviting === row.email}
                                onClick={() => void invite(row.email)}
                                className="shrink-0 min-h-[44px] px-4 rounded-full bg-[#1a1a2e] text-white text-[11px] font-black uppercase tracking-wider"
                            >
                                {inviting === row.email ? '…' : 'Invite'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
