import type { RiskAlert } from '@/types/trading';

export function countSessionViolations(
    rules: { id: string; violated?: boolean }[],
    sessionDate: string
): number {
    void sessionDate;
    return rules.filter((r) => r.violated).length;
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
