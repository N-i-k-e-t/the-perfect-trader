import { track } from '@/lib/analytics';
import { recordCoachDismiss } from '@/lib/retention/storage';

const COACH_DISMISS_TUNE_THRESHOLD = 5;

export function applyCoachDismissTune(
    tone: string | undefined,
    updateUserModel: (m: { responds_to: 'data' | 'encouragement' | 'warnings' }) => void,
    current: { responds_to: string }
): void {
    const count = recordCoachDismiss(tone);
    if (count >= COACH_DISMISS_TUNE_THRESHOLD && current.responds_to !== 'data') {
        updateUserModel({ responds_to: 'data' });
        track('coach_preference_auto_tuned', 'ai', {
            dismiss_count_7d: count,
            new_preference: 'data',
        });
    }
}
