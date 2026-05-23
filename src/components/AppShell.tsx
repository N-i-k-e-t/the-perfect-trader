'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from './BottomTabs';
import { usePerfectTrader } from '@/lib/context';
import LabMode from './LabMode';
import InstallPrompt from './InstallPrompt';
import CaptureHub from './capture/CaptureHub';
import DailyStateCheck from './DailyStateCheck';
import SettingsSheet from './SettingsSheet';
import RetentionEffects from './retention/RetentionEffects';
import { Target, Flame, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { IS_BETA } from '@/lib/config';
import { fetchBetaCapacity, type BetaCapacity } from '@/lib/beta-capacity';
import { useAppKeyboardShortcuts } from '@/hooks/useAppKeyboardShortcuts';

export default function AppShell({ children }: { children: React.ReactNode }) {
    useAppKeyboardShortcuts();
    const { labMode, user, isCheckingAuth, dailyLogs, analytics } = usePerfectTrader();
    const router = useRouter();

    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [daysLeft, setDaysLeft] = useState(3);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [betaCapacity, setBetaCapacity] = useState<BetaCapacity | null>(null);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!IS_BETA) return;
        fetchBetaCapacity().then(setBetaCapacity);
    }, []);

    useEffect(() => {
        if (isHydrated && !isCheckingAuth && !user) {
            router.push('/login');
        }
    }, [isHydrated, isCheckingAuth, user, router]);

    const streak = useMemo(() => {
        let count = 0;
        const today = new Date().toISOString().split('T')[0];
        const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));

        if (analytics.consistencyDays) return analytics.consistencyDays;

        const checkDate = new Date();
        for (let i = 0; i < 30; i++) {
            const dStr = checkDate.toISOString().split('T')[0];
            const log = sortedLogs.find((l) => l.date === dStr);
            if (log && (log.complianceScore ?? 0) >= 75) {
                count++;
            } else if (dStr !== today) {
                break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return count;
    }, [dailyLogs, analytics]);

    useEffect(() => {
        if (!user) return;
        if (IS_BETA || user.isPro) return;

        if (user.trialStartDate) {
            const start = new Date(user.trialStartDate).getTime();
            const now = new Date().getTime();
            const elapsedHours = (now - start) / (1000 * 60 * 60);

            if (elapsedHours > 72) {
                setIsTrialExpired(true);
            } else {
                setDaysLeft(Math.max(1, Math.ceil((72 - elapsedHours) / 24)));
            }
        }
    }, [user]);

    if (!isHydrated || isCheckingAuth) {
        return (
            <motion.div className="min-h-[100dvh] bg-white flex items-center justify-center">
                <motion.div className="w-8 h-8 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
            </motion.div>
        );
    }

    if (!user) {
        return null;
    }

    if (!IS_BETA && isTrialExpired) {
        return (
            <motion.div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 bg-white text-center">
                <motion.div className="w-full max-w-[360px] bg-white p-6 rounded-2xl shadow-md border border-[#f3f4f6]">
                    <h2 className="text-xl font-semibold text-[#111827] mb-4">Trial expired</h2>
                    <p className="text-[#6b7280] text-[15px] mb-8">
                        Upgrade to continue tracking discipline with The Perfect Trader Pro.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push('/pricing')}
                        className="w-full min-h-[52px] btn-primary font-semibold rounded-xl shadow-sm"
                    >
                        View pricing
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div className="flex min-h-[100dvh] w-full max-w-[390px] mx-auto bg-white overflow-x-hidden selection:bg-emerald-100">
            {!labMode && (
                <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-[72px] bg-white/90 backdrop-blur-md border-b border-[#f3f4f6] z-[180] flex items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 bg-[#1a1a2e] text-white rounded-xl flex items-center justify-center">
                            <Target size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-[17px] font-semibold tracking-tight text-[#111827]">Perfect Trader</span>
                    </div>

                    <motion.div className="flex items-center gap-2">
                        {streak > 0 && (
                            <div className="bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-100 min-h-[44px]">
                                <Flame size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                                <span className="text-[12px] font-semibold text-[#f59e0b] tabular-nums">{streak}</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(true)}
                            aria-label="Open settings"
                            className="min-w-[44px] min-h-[44px] rounded-full bg-[#1a1a2e] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white shadow-md active:scale-95 "
                        >
                            {user?.name?.substring(0, 2).toUpperCase() || 'TR'}
                        </button>
                    </motion.div>
                </header>
            )}

            <main
                className={`flex-1 flex flex-col w-full ${labMode ? 'pt-0' : 'pt-[calc(72px+env(safe-area-inset-top,0px))]'} pb-[calc(env(safe-area-inset-bottom,0px)+110px)]`}
            >
                <div className="w-full max-w-[390px] mx-auto min-h-full">
                    {IS_BETA && !labMode && (
                        <div className="mx-4 mt-4 mb-2 p-4 bg-[#1a1a2e] text-white rounded-2xl flex items-center gap-3 border border-[#f3f4f6]/10">
                            <Sparkles size={18} className="text-[#f59e0b] shrink-0" />
                            <p className="text-[12px] font-medium text-white/80 leading-snug">
                                <span className="text-[#f59e0b] font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                                    Beta
                                </span>
                                All features free
                                {betaCapacity
                                    ? ` · ${betaCapacity.remaining}/${betaCapacity.max} spots left`
                                    : ''}
                            </p>
                        </div>
                    )}
                    {!IS_BETA && !user?.isPro && user?.trialStartDate && !labMode && (
                        <div className="mx-4 mt-4 mb-2 p-4 bg-[#1a1a2e] text-white rounded-2xl flex items-center justify-between gap-3">
                            <motion.div className="flex flex-col">
                                <span className="text-[10px] font-semibold text-[#f59e0b] uppercase tracking-widest mb-0.5">
                                    Trial
                                </span>
                                <span className="text-[14px] font-medium text-white/80">{daysLeft} days left</span>
                            </motion.div>
                            <button
                                type="button"
                                onClick={() => router.push('/pricing')}
                                className="min-h-[44px] px-4 bg-[#f59e0b] text-[#1a1a2e] font-semibold text-[12px] rounded-xl active:scale-95 "
                            >
                                Upgrade
                            </button>
                        </div>
                    )}
                    {children}
                </div>
            </main>

            {!labMode && <BottomTabs />}
            {labMode && <LabMode />}

            <InstallPrompt />
            <CaptureHub />
            <DailyStateCheck />
            <RetentionEffects />
            <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </motion.div>
    );
}
