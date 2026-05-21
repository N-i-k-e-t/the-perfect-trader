'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RESOURCE_DASHBOARD, type ResourceRow, type ResourceStatus } from '@/data/resource-dashboard';

const STATUS_KEY = 'perfect_trader_resource_status';

const STATUS_OPTIONS: ResourceStatus[] = ['backlog', 'in_progress', 'done', 'blocked'];

export default function ResourcesPage() {
    const [rows, setRows] = useState<ResourceRow[]>(RESOURCE_DASHBOARD);

    useEffect(() => {
        const saved = localStorage.getItem(STATUS_KEY);
        if (!saved) return;
        try {
            const map = JSON.parse(saved) as Record<string, ResourceStatus>;
            setRows(RESOURCE_DASHBOARD.map((r) => ({ ...r, status: map[r.id] ?? r.status })));
        } catch {
            /* ignore */
        }
    }, []);

    const setStatus = (id: string, status: ResourceStatus) => {
        setRows((prev) => {
            const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
            const map = Object.fromEntries(next.map((r) => [r.id, r.status]));
            localStorage.setItem(STATUS_KEY, JSON.stringify(map));
            return next;
        });
    };

    const byPriority = (p: string) => rows.filter((r) => r.priority === p);
    const counts = {
        done: rows.filter((r) => r.status === 'done').length,
        total: rows.length,
    };

    return (
        <div className="min-h-[100dvh] bg-[#f8f9fa] text-[#1a1a2e]">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 font-bold text-[14px] mb-8">
                    <ArrowLeft size={18} />
                    Home
                </Link>
                <h1 className="text-[32px] font-black tracking-tight mb-2">Resource dashboard</h1>
                <p className="text-gray-500 font-medium mb-2">
                    Allocator for launch work — {counts.done}/{counts.total} done (saved in this browser).
                </p>
                <p className="text-[12px] text-gray-400 mb-8">
                    Source: docs/platform + prompt-13 plan. Export status from localStorage for standups.
                </p>

                {(['P0', 'P1', 'P2'] as const).map((prio) => (
                    <section key={prio} className="mb-10">
                        <h2 className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-4">{prio}</h2>
                        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Resource</th>
                                        <th className="p-4">Cat</th>
                                        <th className="p-4">For</th>
                                        <th className="p-4">Owner</th>
                                        <th className="p-4">Effort</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {byPriority(prio).map((r) => (
                                        <tr key={r.id} className="border-t border-gray-100">
                                            <td className="p-4 font-black">{r.id}</td>
                                            <td className="p-4 font-bold">{r.name}</td>
                                            <td className="p-4 text-gray-500">{r.category}</td>
                                            <td className="p-4 text-gray-500">{r.neededFor}</td>
                                            <td className="p-4">{r.owner}</td>
                                            <td className="p-4">{r.effort}</td>
                                            <td className="p-4">
                                                <select
                                                    value={r.status}
                                                    onChange={(e) => setStatus(r.id, e.target.value as ResourceStatus)}
                                                    className="rounded-lg border border-gray-200 px-2 py-1 font-bold text-[12px]"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
