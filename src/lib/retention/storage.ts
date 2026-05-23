const MILESTONES = [3, 7, 14, 30, 50, 100] as const;
const COACH_DISMISS_KEY = 'pt_coach_dismiss_count';
const PLAYBOOK_NUDGE_KEY = 'pt_nudge_playbooks_shown';
const STREAK_CELEBRATED_KEY = 'pt_streak_milestones_celebrated';

export type CoachDismissEntry = { ts: number; tone?: string };

export function getCoachDismissLog(): CoachDismissEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(COACH_DISMISS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as CoachDismissEntry[];
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return parsed.filter((e) => e.ts >= weekAgo);
    } catch {
        return [];
    }
}

export function recordCoachDismiss(tone?: string): number {
    const log = [...getCoachDismissLog(), { ts: Date.now(), tone }];
    localStorage.setItem(COACH_DISMISS_KEY, JSON.stringify(log));
    return log.length;
}

export function playbookNudgeShown(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(PLAYBOOK_NUDGE_KEY) === '1';
}

export function markPlaybookNudgeShown(): void {
    localStorage.setItem(PLAYBOOK_NUDGE_KEY, '1');
}

export function getCelebratedStreakMilestones(): number[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STREAK_CELEBRATED_KEY);
        return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
        return [];
    }
}

export function markStreakMilestoneCelebrated(days: number): void {
    const prev = getCelebratedStreakMilestones();
    if (prev.includes(days)) return;
    localStorage.setItem(STREAK_CELEBRATED_KEY, JSON.stringify([...prev, days]));
}

export function nextStreakMilestone(streak: number): number | null {
    const celebrated = getCelebratedStreakMilestones();
    for (const m of MILESTONES) {
        if (streak >= m && !celebrated.includes(m)) return m;
    }
    return null;
}

export { MILESTONES };
