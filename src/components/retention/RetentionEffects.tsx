'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { track } from '@/lib/analytics';
import {
    markPlaybookNudgeShown,
    markStreakMilestoneCelebrated,
    nextStreakMilestone,
    playbookNudgeShown,
} from '@/lib/retention/storage';
import StreakMilestoneModal from './StreakMilestoneModal';
import PlaybookNudgeBanner from './PlaybookNudgeBanner';

/** Client-side retention triggers (Phase D). */
export default function RetentionEffects() {
    const pathname = usePathname();
    const { playbooks, analytics, user } = usePerfectTrader();

    const [streakModalDays, setStreakModalDays] = useState<number | null>(null);
    const [showPlaybookNudge, setShowPlaybookNudge] = useState(false);

    const streak = analytics.consistencyDays ?? 0;

    useEffect(() => {
        const milestone = nextStreakMilestone(streak);
        if (milestone) {
            markStreakMilestoneCelebrated(milestone);
            track('streak_milestone_reached', 'session', {
                streak_days: milestone,
                milestone,
            });
            setStreakModalDays(milestone);
        }
    }, [streak]);

    useEffect(() => {
        if (playbookNudgeShown() || playbooks.length > 0) return;
        const signupMs = user?.trialStartDate
            ? new Date(user.trialStartDate).getTime()
            : Date.now();
        const daysSince = (Date.now() - signupMs) / (1000 * 60 * 60 * 24);
        if (daysSince >= 7) {
            setShowPlaybookNudge(true);
        }
    }, [playbooks.length, user?.trialStartDate]);

    const dismissPlaybookNudge = () => {
        markPlaybookNudgeShown();
        track('feature_discovery_path', 'navigation', {
            feature_name: 'playbooks',
            discovery_method: 'nudge',
        });
        setShowPlaybookNudge(false);
    };

    return (
        <>
            {streakModalDays !== null && (
                <StreakMilestoneModal days={streakModalDays} onClose={() => setStreakModalDays(null)} />
            )}
            {showPlaybookNudge && pathname === '/rules' && (
                <PlaybookNudgeBanner onDismiss={dismissPlaybookNudge} />
            )}
        </>
    );
}
