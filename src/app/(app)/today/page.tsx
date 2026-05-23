'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePerfectTrader } from '@/lib/context';
import {
    Plus,
    Flame,
    Check,
    ChevronRight,
    Shield,
    Zap,
    TrendingUp,
    X,
} from 'lucide-react';
import MentalReset from '@/components/MentalReset';
import InsightCards from '@/components/InsightCards';
import RiskAlertBanner from '@/components/retention/RiskAlertBanner';
import { runOrchestrator } from '@/lib/agents/orchestrator';
import {
    calculateRuleChecklistScore,
    gradeRingColor,
    scoreToGrade,
} from '@/lib/discipline';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { TodayPageSkeleton } from '@/components/ui/Skeleton';
import { isAfterSessionEnd } from '@/lib/session-time';
import MarketHoursBanner from '@/components/today/MarketHoursBanner';
import DisciplineTrend from '@/components/today/DisciplineTrend';

export default function DashboardPage() {
    const {
        rules,
        trades,
        dailyLogs,
        session,
        updateSession,
        logDaily,
        setCaptureOpen,
        setCaptureMode,
        analytics,
        showToast,
        riskAlerts,
        dismissRiskAlert,
        setCoachMessages,
        userModel,
        openPreSessionCheck,
        refreshData,
        toggleRuleViolation,
    } = usePerfectTrader();
    const [mounted, setMounted] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);
    const stabilityViewedRef = useRef(false);
    const welcomeTrackedRef = useRef(false);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [sessionElapsed, setSessionElapsed] = useState<string | null>(null);

    const WELCOME_CARD_KEY = 'pt_welcome_card_dismissed';

    const today = new Date().toISOString().split('T')[0];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const targetTrades = useMemo(
        () => trades.filter((t) => t.date?.split('T')[0] === selectedDateStr),
        [trades, selectedDateStr]
    );
    const targetLog = dailyLogs.find((d) => d.date === selectedDateStr);
    const checkedIds = targetLog?.rulesChecked || [];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const dismissed = localStorage.getItem(WELCOME_CARD_KEY);
        if (dismissed || trades.length > 0 || rules.length > 0) {
            if ((trades.length > 0 || rules.length > 0) && !dismissed) {
                localStorage.setItem(WELCOME_CARD_KEY, 'true');
            }
            setShowWelcome(false);
            return;
        }
        setShowWelcome(true);
    }, [mounted, trades.length, rules.length]);

    useEffect(() => {
        if (!mounted || !showWelcome || welcomeTrackedRef.current) return;
        welcomeTrackedRef.current = true;
        track('feature_first_use', 'engagement', { feature_name: 'welcome_card_shown' });
    }, [mounted, showWelcome]);

    const activeRules = rules.filter((r) => r.isActive !== false);
    const score = calculateRuleChecklistScore(activeRules.length, checkedIds.length);

    useEffect(() => {
        if (!mounted || stabilityViewedRef.current) return;
        stabilityViewedRef.current = true;
        track('session_stability_score_viewed', 'session', {
            session_date: selectedDateStr,
            score,
        });
    }, [mounted, selectedDateStr, score]);
    const isPerfect = score === 100 && activeRules.length > 0;

    const streak = analytics.consistencyDays || 0;
    const grade = scoreToGrade(score);

    useEffect(() => {
        if (!mounted) return;
        const output = runOrchestrator(
            trades,
            rules,
            dailyLogs,
            streak,
            streak,
            targetLog?.mood ?? null,
            userModel
        );
        setCoachMessages(output.coachMessages);
    }, [mounted, trades, rules, dailyLogs, streak, userModel, targetLog?.mood, setCoachMessages]);

    const showPostSession =
        selectedDateStr === today && (targetTrades.length >= 1 || isAfterSessionEnd());

    useEffect(() => {
        if (!mounted || selectedDateStr !== today || !session.preSessionComplete) return;
        const key = `pt_session_started_${today}`;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, String(Date.now()));
        }
    }, [mounted, session.preSessionComplete, selectedDateStr, today]);

    useEffect(() => {
        if (selectedDateStr !== today || !session.preSessionComplete) {
            setSessionElapsed(null);
            return;
        }
        const tick = () => {
            const start = Number(localStorage.getItem(`pt_session_started_${today}`));
            if (!start) return;
            const ms = Date.now() - start;
            const h = Math.floor(ms / 3_600_000);
            const m = Math.floor((ms % 3_600_000) / 60_000);
            setSessionElapsed(h > 0 ? `${h}h ${m}m` : `${m}m`);
        };
        tick();
        const id = setInterval(tick, 60_000);
        return () => clearInterval(id);
    }, [session.preSessionComplete, selectedDateStr, today]);

    const ringColor = gradeRingColor(grade);

    const startRuleLongPress = (ruleId: string) => {
        longPressTimerRef.current = setTimeout(() => {
            toggleRuleViolation(ruleId);
            showToast('Rule flagged as violated today', 'error');
            track('rule_violated_flagged', 'rules', { rule_id: ruleId, trade_id: null });
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
            }
        }, 600);
    };

    const cancelRuleLongPress = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (!mounted || !isPerfect || !session.preSessionComplete || selectedDateStr !== today) return;
        const key = `pt_confetti_shown_${today}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        void import('canvas-confetti').then(({ default: confetti }) => {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
        });
    }, [mounted, isPerfect, session.preSessionComplete, selectedDateStr, today]);

    const handleToggleRule = (ruleId: string) => {
        if (session.rulesLocked) {
            showToast('System is locked.', 'error');
            return;
        }
        const isChecked = checkedIds.includes(ruleId);
        if (!isChecked) {
            track('rule_followed_flagged', 'rules', {
                rule_id: ruleId,
                trade_id: null,
            });
        }
        const newChecked = isChecked ? checkedIds.filter((id) => id !== ruleId) : [...checkedIds, ruleId];

        const newScore = calculateRuleChecklistScore(activeRules.length, newChecked.length);
        const nextGrade = scoreToGrade(newScore);

        logDaily({
            date: selectedDateStr,
            rulesChecked: newChecked,
            complianceScore: newScore,
            grade: nextGrade,
            mood: targetLog?.mood || 'neutral',
            tradesLogged: targetTrades.length,
            rulesFollowed: newChecked.length,
            rulesBroken: targetTrades.reduce((acc, t) => acc + (t.rules_broken?.length || 0), 0),
        });
    };

    const handleSetMood = (mood: string) => {
        logDaily({
            date: selectedDateStr,
            rulesChecked: checkedIds,
            complianceScore: score,
            grade: scoreToGrade(score),
            mood,
            tradesLogged: targetTrades.length,
            rulesFollowed: checkedIds.length,
            rulesBroken: targetTrades.reduce((acc, t) => acc + (t.rules_broken?.length || 0), 0),
        });
        showToast('Mood updated', 'success');
    };

    const handleDismissWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(WELCOME_CARD_KEY, 'true');
    };

    if (!mounted) {
        return (
            <div className="min-h-[100dvh] bg-white">
                <TodayPageSkeleton />
            </div>
        );
    }

    const phases = [
        { name: 'Pre-Session Rules', icon: '⚡', category: 'Pre-Session Rules' },
        { name: 'Entry/Exit Rules', icon: '🎯', category: 'Entry/Exit Rules' },
        { name: 'Mindset Rules', icon: '🧠', category: 'Mindset Rules' },
    ];

    // IMPROVED: spring pathLength for score ring per identity brief
    const SCORE_RING_R = 96;
    const SCORE_RING_C = 2 * Math.PI * SCORE_RING_R;

    const openLogTrade = () => {
        setCaptureMode('checklist');
        setCaptureOpen(true);
    };

    return (
        <div className="min-h-[100dvh] bg-white pb-[calc(env(safe-area-inset-bottom)+120px)] selection:bg-emerald-100 overflow-x-hidden w-full max-w-[390px] mx-auto">
            <PullToRefresh onRefresh={refreshData} className="w-full">
                <main className="px-4 pt-2 flex flex-col w-full">
                    {/* IMPROVED: score ring is the first visual element */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex flex-col items-center mb-4"
                    >
                        <div className="w-full flex flex-col items-center">
                            <div className="relative w-56 h-56 shrink-0">
                                <motion.div
                                    animate={{ scale: [1, 1.04, 1], opacity: [0.04, 0.08, 0.04] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full blur-3xl -z-10"
                                    style={{ backgroundColor: ringColor }}
                                />
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 224 224" aria-hidden>
                                    <circle
                                        cx="112"
                                        cy="112"
                                        r={SCORE_RING_R}
                                        stroke="#f3f4f6"
                                        strokeWidth="14"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        cx="112"
                                        cy="112"
                                        r={SCORE_RING_R}
                                        stroke={ringColor}
                                        strokeWidth="14"
                                        strokeDasharray={SCORE_RING_C}
                                        initial={{ strokeDashoffset: SCORE_RING_C }}
                                        animate={{ strokeDashoffset: SCORE_RING_C - (SCORE_RING_C * score) / 100 }}
                                        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[56px] font-bold text-[#111827] tracking-tight tabular-nums leading-none">
                                        {score}
                                        <span className="text-[18px] font-semibold text-[#9ca3af] ml-1">%</span>
                                    </span>
                                    <span className="text-[12px] font-medium text-[#6b7280] uppercase tracking-widest mt-1">
                                        Discipline
                                    </span>
                                    <span className="text-[28px] font-bold mt-1 tabular-nums" style={{ color: ringColor }}>
                                        {grade}
                                    </span>
                                </div>
                            </div>

                            {selectedDateStr === today && (
                                <div className="mt-4 w-full max-w-[280px]">
                                    <DisciplineTrend dailyLogs={dailyLogs} today={today} todayScore={score} />
                                </div>
                            )}

                            <div className="w-full max-w-[320px] grid grid-cols-2 gap-3 mt-6">
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f3f4f6] flex flex-col items-end gap-2">
                                    <span className="text-[12px] font-medium text-[#6b7280] flex items-center gap-2">
                                        <Zap size={12} /> Rules followed
                                    </span>
                                    <span className="text-[18px] font-semibold text-[#111827] tabular-nums text-right">
                                        {checkedIds.length}/{activeRules.length}
                                    </span>
                                </div>
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f3f4f6] flex flex-col items-end gap-2">
                                    <span className="text-[12px] font-medium text-[#6b7280] flex items-center gap-2">
                                        <TrendingUp size={12} /> Trades today
                                    </span>
                                    <span className="text-[18px] font-semibold text-[#111827] tabular-nums text-right">
                                        {targetTrades.length}/{session.tradesAllowed}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* IMPROVED: alerts + primary actions stay visible when scrolling */}
                    <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#f3f4f6] mb-4 flex flex-col gap-3">
                        {riskAlerts.length > 0 && (
                            <RiskAlertBanner
                                alert={riskAlerts[0]}
                                onDismiss={() => dismissRiskAlert(riskAlerts[0].timestamp)}
                                onAction={() => setIsResetOpen(true)}
                            />
                        )}
                        {selectedDateStr === today && <MarketHoursBanner />}
                        {!session.preSessionComplete && selectedDateStr === today && (
                            <button
                                type="button"
                                onClick={openPreSessionCheck}
                                className="w-full flex items-center justify-between gap-3 px-5 py-4 min-h-[52px] bg-[#1a1a2e] text-white rounded-2xl active:scale-[0.97]"
                            >
                                <span className="text-[15px] font-semibold text-left">Start pre-session check-in</span>
                                <ChevronRight size={18} className="shrink-0 opacity-80" />
                            </button>
                        )}
                        {selectedDateStr === today && (
                            <button
                                type="button"
                                onClick={openLogTrade}
                                className="w-full min-h-[52px] btn-primary rounded-2xl font-semibold text-[16px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.97]"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                                Log trade
                            </button>
                        )}
                    </div>

                    <header className="w-full mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[12px] font-medium text-[#9ca3af] uppercase tracking-wide">Today</p>
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 min-h-[44px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                <span className="text-[12px] font-medium text-[#10b981]">Plan active</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight">
                                {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                            </h1>
                            {streak > 0 && (
                                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 min-h-[44px]">
                                    <Flame size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                                    <span className="text-[12px] font-semibold text-[#f59e0b] tabular-nums">
                                        {streak}d streak
                                    </span>
                                </div>
                            )}
                        </div>
                        {sessionElapsed && selectedDateStr === today && (
                            <p className="text-[12px] font-medium text-[#6b7280] mt-2">Session · {sessionElapsed}</p>
                        )}
                    </header>

                    <AnimatePresence>
                        {showWelcome && (
                            <motion.div
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.3 }}
                                className="w-full bg-[#1a1a2e] text-white rounded-2xl p-6 mb-8 shadow-md relative overflow-hidden"
                            >
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full active:bg-white/10"
                                    onClick={handleDismissWelcome}
                                    aria-label="Dismiss welcome"
                                >
                                    <X size={18} className="text-white" />
                                </button>
                                <h2 className="text-[18px] font-semibold mb-4 pr-10 leading-snug text-center">
                                    Welcome — let&apos;s make today count
                                </h2>
                                <div className="space-y-2.5 mb-5 text-[14px] text-white/80 leading-snug">
                                    <p>① Finish your 2-min profile setup.</p>
                                    <p>② Add your top 3 rules.</p>
                                    <p>③ Log your next trade honestly.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDismissWelcome}
                                    className="w-full min-h-[52px] bg-[#10b981] text-white font-semibold text-[15px] rounded-xl active:scale-[0.97]"
                                >
                                    Got it, let&apos;s go
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="w-full mb-8"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={() => setWeekOffset(weekOffset - 1)}
                                aria-label="Previous week"
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#f3f4f6] rounded-xl text-[#9ca3af] active:scale-95 "
                            >
                                <ChevronRight size={16} className="rotate-180" />
                            </button>
                            <span className="text-[12px] font-medium text-[#9ca3af] uppercase tracking-wide">This week</span>
                            <button
                                type="button"
                                onClick={() => setWeekOffset(weekOffset + 1)}
                                aria-label="Next week"
                                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white border border-[#f3f4f6] rounded-xl text-[#9ca3af] active:scale-95 "
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">
                            {Array.from({ length: 31 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + (i - 15) + weekOffset * 7);
                                const isSelected = selectedDate.toDateString() === date.toDateString();
                                const isToday = new Date().toDateString() === date.toDateString();

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedDate(date)}
                                        className="flex flex-col items-center gap-2 flex-none snap-center min-w-[44px] active:scale-[0.97]"
                                    >
                                        <span
                                            className={`text-[12px] font-medium uppercase ${
                                                isSelected ? 'text-[#111827]' : 'text-[#9ca3af]'
                                            }`}
                                        >
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <div
                                            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center ${
                                                isSelected
                                                    ? 'bg-[#1a1a2e] text-white shadow-sm'
                                                    : 'text-[#6b7280] bg-white border border-[#f3f4f6]'
                                            }`}
                                        >
                                            <span className="text-[15px] font-semibold leading-none tabular-nums">
                                                {date.getDate()}
                                            </span>
                                            {isToday && (
                                                <div className="w-1 h-1 rounded-full mt-1 bg-[#10b981]" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="w-full mb-8"
                    >
                        <h2 className="text-[18px] font-semibold text-[#111827] mb-4">Morning check-in</h2>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { e: '🧘', m: 'flow', l: 'Flow' },
                                { e: '🔋', m: 'charged', l: 'Ready' },
                                { e: '🛡️', m: 'defensive', l: 'Defend' },
                                { e: '⚠️', m: 'tilt', l: 'Focus' },
                            ].map((item) => (
                                <button
                                    key={item.m}
                                    type="button"
                                    onClick={() => handleSetMood(item.m)}
                                    className={`flex flex-col items-center justify-center gap-2 min-h-[88px] rounded-2xl border-2 active:scale-[0.97] ${
                                        targetLog?.mood === item.m
                                            ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white shadow-md'
                                            : 'bg-white border-[#f3f4f6] text-[#6b7280]'
                                    }`}
                                >
                                    <span className="text-2xl">{item.e}</span>
                                    <span className="text-[12px] font-medium">{item.l}</span>
                                </button>
                            ))}
                        </div>
                    </motion.section>

                    <InsightCards />

                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="w-full flex flex-col gap-4 mb-8 mt-8"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-[18px] font-semibold text-[#111827]">My rules</h2>
                            <Link
                                href="/rules"
                                className="min-h-[44px] px-2 flex items-center gap-1 text-[12px] font-medium text-[#10b981] active:opacity-70"
                            >
                                Edit <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3">
                            {activeRules.length > 0 ? (
                                activeRules.map((rule) => {
                                    const phase = phases.find((p) => p.category === rule.category) || phases[0];
                                    const isRuleChecked = checkedIds.includes(rule.id);
                                    return (
                                        <motion.button
                                            key={rule.id}
                                            type="button"
                                            onClick={() => handleToggleRule(rule.id)}
                                            onPointerDown={() => startRuleLongPress(rule.id)}
                                            onPointerUp={cancelRuleLongPress}
                                            onPointerLeave={cancelRuleLongPress}
                                            onPointerCancel={cancelRuleLongPress}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                                                rule.violated ? 'border-[#ef4444]/30 bg-red-50/50' : 'border-[#f3f4f6] bg-white shadow-sm'
                                            } ${isRuleChecked ? 'bg-emerald-50/40' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 text-left min-w-0">
                                                <div
                                                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                                        isRuleChecked ? 'bg-emerald-100/60' : 'bg-[#f3f4f6]'
                                                    }`}
                                                >
                                                    {rule.emoji || '🛡️'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span
                                                        className={`text-[15px] font-semibold text-[#111827] leading-snug ${
                                                            isRuleChecked ? 'opacity-40 line-through' : ''
                                                        }`}
                                                    >
                                                        {rule.text}
                                                    </span>
                                                    <span className="text-[12px] font-medium text-[#6b7280] mt-1">
                                                        {phase.name} · {isRuleChecked ? 'Followed' : 'Not checked'}
                                                        {rule.violated ? ' · Violated' : ''}
                                                    </span>
                                                    <span className="text-[12px] text-[#6b7280] mt-1">
                                                        Long-press to flag violation
                                                    </span>
                                                </div>
                                            </div>

                                            {/* IMPROVED: rule check bounce animation */}
                                            <motion.div
                                                key={isRuleChecked ? `on-${rule.id}` : `off-${rule.id}`}
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: isRuleChecked ? [1, 1.15, 1] : 1 }}
                                                transition={{ type: 'spring', stiffness: 520, damping: 16 }}
                                                className={`min-w-[44px] min-h-[44px] rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                    isRuleChecked
                                                        ? 'bg-[#10b981] border-[#10b981] text-white'
                                                        : 'border-[#f3f4f6] bg-white'
                                                }`}
                                            >
                                                {isRuleChecked && <Check size={18} strokeWidth={3} />}
                                            </motion.div>
                                        </motion.button>
                                    );
                                })
                            ) : (
                                <div className="p-6 border-2 border-dashed border-[#f3f4f6] rounded-2xl flex flex-col items-center gap-2 text-center bg-white">
                                    <Shield className="text-[#9ca3af]" size={32} />
                                    <div>
                                        <p className="text-[16px] font-semibold text-[#111827]">No rules yet</p>
                                        <p className="text-[14px] text-[#6b7280] mt-1">
                                            Add the rules you break when it hurts most.
                                        </p>
                                    </div>
                                    <Link
                                        href="/onboarding"
                                        className="min-h-[44px] px-6 btn-primary rounded-xl font-semibold text-[14px] flex items-center"
                                    >
                                        Set up my plan
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {showPostSession && (
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="w-full mb-8"
                        >
                            <h2 className="text-[18px] font-semibold text-[#111827] mb-4">Post-session notes</h2>
                            <textarea
                                placeholder="How did the session go? Lessons for tomorrow..."
                                rows={3}
                                defaultValue={session.notes ?? ''}
                                onBlur={(e) => {
                                    updateSession({ notes: e.target.value });
                                    showToast('Session notes saved', 'success');
                                }}
                                className="w-full bg-white rounded-lg p-4 text-[16px] font-medium text-[#111827] border border-[#f3f4f6] resize-none shadow-sm min-h-[120px]"
                            />
                        </motion.section>
                    )}
                </main>
            </PullToRefresh>
            <MentalReset isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
        </div>
    );
}
