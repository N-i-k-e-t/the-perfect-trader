'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import type { RiskAlert } from '@/types/trading';

export default function RiskAlertTrack({
    alert,
    alertKey,
}: {
    alert: RiskAlert;
    alertKey: string;
}) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;
        const alertType = alert.alert.slice(0, 40).toLowerCase().replace(/\s+/g, '_');
        track('risk_alert_shown', 'ai', {
            severity: alert.severity,
            alert_type: alertType,
        });
    }, [alertKey, alert.severity, alert.alert]);

    return null;
}
