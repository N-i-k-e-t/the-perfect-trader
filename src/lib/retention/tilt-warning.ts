import type { RiskAlert, Trade } from '@/types/trading';

/** Legacy: rule.violated flags on the rules list */
export function countSessionViolations(
    rules: { id: string; violated?: boolean }[],
    sessionDate: string
): number {
    void sessionDate;
    return rules.filter((r) => r.violated).length;
}

/** Count total rules_broken across all trades on the session date */
export function countSessionTradeViolations(trades: Trade[], sessionDate: string): number {
    let count = 0;
    for (const t of trades) {
        if (t.date?.split('T')[0] !== sessionDate) continue;
        count += t.rules_broken?.length ?? 0;
    }
    return count;
}

export function buildTiltWarningAlert(violationCount: number): RiskAlert {
    return {
        alert: `You've violated ${violationCount}+ rules today. Consider pausing.`,
        severity: 'critical',
        action: 'Take a break before your next trade.',
        timestamp: new Date().toISOString(),
    };
}

export const TILT_VIOLATION_THRESHOLD = 2;
