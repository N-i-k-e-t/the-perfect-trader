/**
 * Discipline scoring — single source of truth for compliance % and letter grades.
 * Used by /today, calendar, stats, and cloud sync payloads.
 */

export type DisciplineGrade = 'A' | 'B' | 'C' | 'D' | 'F' | 'None';

export interface DailyComplianceInput {
    /** Active rules the user is accountable for today */
    activeRuleCount: number;
    /** Rule IDs checked off on the daily checklist */
    rulesCheckedCount: number;
    /** Pre-market plan logged (25% of full daily score) */
    hasPrePlan?: boolean;
    /** Post-session review logged (25% of full daily score) */
    hasPostNote?: boolean;
}

/** Rule checklist only — matches legacy /today behavior (0–100). */
export function calculateRuleChecklistScore(
    activeRuleCount: number,
    rulesCheckedCount: number
): number {
    if (activeRuleCount <= 0) return 0;
    return Number(((rulesCheckedCount / activeRuleCount) * 100).toFixed(1));
}

/**
 * Full daily discipline score (0–100):
 * - Rule checklist: 50%
 * - Pre-session plan: 25%
 * - Post-session note: 25%
 */
export function calculateDailyComplianceScore(input: DailyComplianceInput): number {
    const { activeRuleCount, rulesCheckedCount, hasPrePlan, hasPostNote } = input;
    if (activeRuleCount <= 0 && !hasPrePlan && !hasPostNote) return 0;

    const rulesPart =
        activeRuleCount > 0
            ? (rulesCheckedCount / activeRuleCount) * 50
            : 0;
    const prePart = hasPrePlan ? 25 : 0;
    const postPart = hasPostNote ? 25 : 0;

    return Math.min(100, Math.round(rulesPart + prePart + postPart));
}

/** Letter grade from compliance percentage. */
export function scoreToGrade(score: number): DisciplineGrade {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    if (score > 0) return 'F';
    return 'None';
}

/** Streak day counts when compliance meets this threshold (see AppShell). */
export const STREAK_COMPLIANCE_THRESHOLD = 75;

/** Perfect discipline day (calendar heatmap, badges). */
export const PERFECT_COMPLIANCE_SCORE = 100;

/** Ring stroke color by letter grade */
export function gradeRingColor(grade: DisciplineGrade): string {
    switch (grade) {
        case 'A':
            return '#22c55e';
        case 'B':
            return '#eab308';
        case 'C':
        case 'D':
            return '#f97316';
        case 'F':
            return '#ef4444';
        default:
            return '#3b82f6';
    }
}
