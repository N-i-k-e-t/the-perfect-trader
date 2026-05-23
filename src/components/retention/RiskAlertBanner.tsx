'use client';

import { AlertTriangle, X } from 'lucide-react';
import type { RiskAlert } from '@/types/trading';

export default function RiskAlertBanner({
    alert,
    onDismiss,
    onAction,
}: {
    alert: RiskAlert;
    onDismiss: () => void;
    onAction?: () => void;
}) {
    const isCritical = alert.severity === 'critical';
    const surface = isCritical
        ? 'bg-red-50 border-[#ef4444]/30'
        : 'bg-amber-50 border-[#f59e0b]/30';
    const text = isCritical ? 'text-[#ef4444]' : 'text-[#f59e0b]';
    const btn = isCritical ? 'bg-[#ef4444] text-white' : 'bg-[#f59e0b] text-[#1a1a2e]';

    return (
        <div
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border ${surface} mb-4`}
            role="alert"
        >
            <AlertTriangle size={20} className={`shrink-0 ${text}`} />
            <p className={`flex-1 text-[14px] font-medium leading-snug text-[#111827]`}>{alert.alert}</p>
            {alert.action && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className={`shrink-0 min-h-[44px] min-w-[44px] px-4 rounded-xl text-[12px] font-semibold ${btn} active:scale-[0.97]`}
                >
                    Pause
                </button>
            )}
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#9ca3af] active:scale-[0.97]"
                aria-label="Dismiss alert"
            >
                <X size={18} />
            </button>
        </div>
    );
}
