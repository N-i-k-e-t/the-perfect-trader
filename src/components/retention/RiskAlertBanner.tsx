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
    const bg = isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
    const text = isCritical ? 'text-red-800' : 'text-amber-900';
    const btn = isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white';

    return (
        <div
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border ${bg} mb-4`}
            role="alert"
        >
            <AlertTriangle
                size={20}
                className={`shrink-0 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}
            />
            <p className={`flex-1 text-[13px] font-bold leading-snug ${text}`}>{alert.alert}</p>
            {alert.action && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className={`shrink-0 h-9 px-3 rounded-full text-[11px] font-black uppercase tracking-wide ${btn} active:scale-95`}
                >
                    Pause
                </button>
            )}
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-400 active:scale-90"
                aria-label="Dismiss alert"
            >
                <X size={18} />
            </button>
        </div>
    );
}
