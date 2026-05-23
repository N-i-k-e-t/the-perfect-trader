'use client';

import Link from 'next/link';
import { BookMarked, X } from 'lucide-react';

export default function PlaybookNudgeBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <BookMarked className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-[#1a1a2e]">Try your first playbook</p>
                <p className="text-[12px] font-semibold text-gray-500 mt-1">
                    Group rules by strategy on the Rules page → Playbooks tab.
                </p>
                <Link
                    href="/rules"
                    className="inline-block mt-2 text-[12px] font-black text-blue-600 uppercase tracking-wider"
                >
                    Open Playbooks
                </Link>
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}
