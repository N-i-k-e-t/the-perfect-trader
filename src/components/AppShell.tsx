'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from './BottomTabs';
import Sidebar from './Sidebar';
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

    // Route Protection
    useEffect(() => {
        if (isHydrated && !isCheckingAuth && !user) {
            router.push('/login');
        }
    }, [isHydrated, isCheckingAuth, user, router]);

    // STREAK LOGIC
    const streak = useMemo(() => {
        let count = 0;
        const today = new Date().toISOString().split('T')[0];
        const sortedLogs = [...dailyLogs].sort((a, b) => b.date.localeCompare(a.date));
        
        if (analytics.consistencyDays) return analytics.consistencyDays;

        const checkDate = new Date();
        for (let i = 0; i < 30; i++) {
            const dStr = checkDate.toISOString().split('T')[0];
            const log = sortedLogs.find(l => l.date === dStr);
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
        return <div className="min-h-[100dvh] bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (!user) {
        return null;
    }

    if (!IS_BETA && isTrialExpired) {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 bg-[#f8f9fa] text-center">
                <div className="w-full max-w-[360px] bg-white p-6 rounded-[24px] shadow-xl">
                    <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4">Trial Expired</h2>
                    <p className="text-[#6b7280] mb-8">Your 3-day free trial has ended. Upgrade to The Perfect Trader Pro to continue executing with discipline.</p>
                    <button 
                        onClick={() => router.push('/pricing')}
                        className="w-full h-14 btn-primary font-bold rounded-full shadow-lg"
                    >
                        View Pricing Plans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[100dvh] w-full bg-white md:bg-[#0a0a12] overflow-x-hidden selection:bg-yellow-200">
            <Sidebar onSettingsOpen={() => setIsSettingsOpen(true)} />

            {/* Mobile header — hidden on desktop (sidebar replaces nav) */}
            {!labMode && (
                <header className="md:hidden fixed top-0 left-0 right-0 w-full h-[72px] bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 z-[180] flex items-center justify-between px-6 pt-[env(safe-area-inset-top)] shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-[#1a1a2e] text-white rounded-[12px] flex items-center justify-center shadow-lg shadow-[#1a1a2e]/10">
                            <Target size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-[19px] font-black tracking-[-0.03em] text-[#1a1a2e]">The Perfect Trader</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {streak > 0 && (
                            <div className="bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-orange-100 shadow-sm">
                                <Flame size={14} className="text-orange-500 fill-orange-500" />
                                <span className="text-[12px] font-black text-orange-600 tabular-nums">{streak}</span>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-10 h-10 rounded-full bg-[#1a1a2e] border-4 border-white flex items-center justify-center text-[11px] font-black text-white shadow-xl active:scale-90 transition-transform"
                        >
                            {user?.name?.substring(0, 2).toUpperCase() || 'TR'}
                        </button>
                    </div>
                </header>
            )}

            <main
                className={`flex-1 flex flex-col md:ml-[240px] md:min-h-screen ${labMode ? 'pt-0' : 'pt-[72px] md:pt-8'} transition-all duration-300 ${labMode ? 'focus-mode' : ''} pb-[calc(env(safe-area-inset-bottom,0px)+110px)] md:pb-10 md:bg-[#f4f5f7]`}
            >
                <div className="w-full max-w-[390px] md:max-w-[min(800px,calc(100vw-280px))] mx-auto min-h-full md:px-8 md:py-2">
                    {IS_BETA && !labMode && (
                        <div className="mx-6 mt-6 mb-2 p-4 bg-gradient-to-r from-[#1a1a2e] to-[#2d2d4a] text-white rounded-[20px] flex items-center gap-3 border border-yellow-500/20">
                            <Sparkles size={18} className="text-yellow-500 shrink-0" />
                            <p className="text-[12px] font-bold text-white/80 leading-snug">
                                <span className="text-yellow-500 font-black uppercase tracking-wider text-[10px] block mb-0.5">Beta</span>
                                All features free
                                {betaCapacity
                                    ? ` · ${betaCapacity.remaining}/${betaCapacity.max} beta spots left`
                                    : ' — help us improve before Pro launches'}.
                            </p>
                        </div>
                    )}
                    {!IS_BETA && !user?.isPro && user?.trialStartDate && !labMode && (
                        <div className="mx-6 mt-6 mb-2 p-5 bg-[#1a1a2e] text-white rounded-[24px] flex items-center justify-between shadow-2xl shadow-yellow-100/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex flex-col relative z-5">
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-0.5">Trial</span>
                                <span className="text-[14px] font-bold text-gray-300">{daysLeft} days remaining</span>
                            </div>
                            <button
                                onClick={() => router.push('/pricing')}
                                className="relative z-5 h-10 px-5 bg-yellow-500 text-[#1a1a2e] font-black text-[12px] rounded-full uppercase tracking-wider shadow-lg active:scale-95 transition-all"
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
        </div>
    );
}

