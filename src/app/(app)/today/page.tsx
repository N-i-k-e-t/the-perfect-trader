'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { 
    Plus, 
    Flame, 
    Check, 
    ChevronRight, 
    Shield,
    Zap,
    TrendingUp,
    ShieldCheck,
    X,
    Info
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
    const router = useRouter();
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
    const targetTrades = useMemo(() => trades.filter(t => t.date?.split('T')[0] === selectedDateStr), [trades, selectedDateStr]);
    const targetLog = dailyLogs.find(d => d.date === selectedDateStr);
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

    const activeRules = rules.filter(r => r.isActive !== false);
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
        selectedDateStr === today &&
        (targetTrades.length >= 1 || isAfterSessionEnd());

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
        const newChecked = isChecked
            ? checkedIds.filter(id => id !== ruleId)
            : [...checkedIds, ruleId];
        
        const newScore = calculateRuleChecklistScore(activeRules.length, newChecked.length);
        const grade = scoreToGrade(newScore);

        logDaily({ 
            date: selectedDateStr, 
            rulesChecked: newChecked,
            complianceScore: newScore,
            grade,
            mood: targetLog?.mood || 'neutral',
            tradesLogged: targetTrades.length,
            rulesFollowed: newChecked.length,
            rulesBroken: targetTrades.reduce((acc, t) => acc + (t.rules_broken?.length || 0), 0)
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
            rulesBroken: targetTrades.reduce((acc, t) => acc + (t.rules_broken?.length || 0), 0)
        });
        showToast('Mood updated', 'success');
    };

    const handleDismissWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(WELCOME_CARD_KEY, 'true');
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#fafafa]">
                <TodayPageSkeleton />
            </div>
        );
    }

    const phases = [
        { name: 'Pre-Session Rules', icon: '⚡', category: 'Pre-Session Rules' },
        { name: 'Entry/Exit Rules', icon: '🎯', category: 'Entry/Exit Rules' },
        { name: 'Mindset Rules', icon: '🧠', category: 'Mindset Rules' }
    ];

    return (
        <div className="min-h-[100dvh] bg-[#fafafa] pb-[calc(env(safe-area-inset-bottom)+120px)] selection:bg-blue-100 italic-none overflow-x-hidden">
            <PullToRefresh onRefresh={refreshData} className="w-full">
            <main className="px-5 pt-4 flex flex-col items-center w-full">
                {riskAlerts.length > 0 && (
                    <RiskAlertBanner
                        alert={riskAlerts[0]}
                        onDismiss={() => dismissRiskAlert(riskAlerts[0].timestamp)}
                        onAction={() => setIsResetOpen(true)}
                    />
                )}

                {selectedDateStr === today && <MarketHoursBanner />}

                <header className="w-full mb-6 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8 px-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Account Level</span>
                            <span className="text-[13px] font-black text-[#1a1a2e]">MY TRADING PLAN</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Plan Active</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-[28px] font-black text-[#1a1a2e] tracking-tight">
                                {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                            </span>
                            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                <Flame size={14} className="text-orange-500 fill-orange-500" />
                                <span className="text-[13px] font-black text-orange-600">{streak} Day Streak</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{selectedDate.getFullYear()}</span>
                        {sessionElapsed && selectedDateStr === today && (
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                                Session · {sessionElapsed}
                            </span>
                        )}
                    </div>

                    {/* DISCIPLINE SCORE — hero above the fold */}
                    <div className="w-full flex flex-col items-center mb-8">
                        <div className="relative w-56 h-56">
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className={`absolute inset-0 rounded-full blur-3xl -z-10 ${isPerfect ? 'bg-green-400' : 'bg-blue-400'}`}
                            />
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="112" cy="112" r="96" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                                <motion.circle 
                                    cx="112" cy="112" r="96" 
                                    stroke={ringColor} 
                                    strokeWidth="16"
                                    strokeDasharray={603}
                                    strokeDashoffset={603 - (603 * score / 100)}
                                    strokeLinecap="round" 
                                    fill="transparent"
                                    className="transition-all duration-[1000ms] ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[44px] font-black text-[#1a1a2e] tracking-tighter tabular-nums leading-none">
                                    {score}<span className="text-[16px] font-bold text-gray-300 ml-0.5">%</span>
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Discipline</span>
                                <span className="text-[22px] font-black mt-1" style={{ color: ringColor }}>
                                    {grade}
                                </span>
                            </div>
                        </div>
                        {selectedDateStr === today && (
                            <DisciplineTrend
                                dailyLogs={dailyLogs}
                                today={today}
                                todayScore={score}
                            />
                        )}
                        <div className="w-full grid grid-cols-2 gap-3 mt-6">
                            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                                    <Zap size={10} /> Rules Followed
                                </span>
                                <span className="text-[16px] font-black text-[#1a1a2e]">{checkedIds.length}/{activeRules.length}</span>
                            </div>
                            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                                    <TrendingUp size={10} /> Trades Today
                                </span>
                                <span className="text-[16px] font-black text-[#1a1a2e]">{targetTrades.length}/{session.tradesAllowed}</span>
                            </div>
                        </div>
                    </div>

                    {!session.preSessionComplete && selectedDateStr === today && (
                        <button
                            type="button"
                            onClick={openPreSessionCheck}
                            className="w-full mb-6 flex items-center justify-between gap-3 px-5 py-4 min-h-[52px] bg-blue-50 border border-blue-100 rounded-[24px] active:scale-[0.98] transition-transform"
                        >
                            <span className="text-[14px] font-black text-[#1a1a2e] text-left">
                                📋 Start your pre-session check-in →
                            </span>
                            <ChevronRight size={18} className="text-blue-500 shrink-0" />
                        </button>
                    )}

                    {/* First-session welcome — beta onboarding */}
                    <AnimatePresence>
                        {showWelcome && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full bg-[#1a1a2e] text-white rounded-[32px] p-7 mb-8 shadow-2xl relative overflow-hidden"
                            >
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 rounded-full"
                                    onClick={handleDismissWelcome}
                                    aria-label="Dismiss welcome"
                                >
                                    <X size={16} className="text-white" />
                                </button>
                                <h3 className="text-xl font-black mb-5 pr-10 leading-tight">
                                    Welcome — let&apos;s make today count.
                                </h3>
                                <div className="space-y-3.5 mb-5 text-[14px] font-bold text-gray-200 leading-snug">
                                    <p>① Finish your 2-min profile setup.</p>
                                    <p>② Add your top 3 rules (the ones you break when it hurts).</p>
                                    <p>③ Log your next trade — win or loss, just be honest.</p>
                                </div>
                                <p className="text-[12px] font-bold text-gray-400 mb-5 leading-relaxed">
                                    Discipline score updates when you check rules. That&apos;s the game.
                                </p>
                                <button 
                                    type="button"
                                    onClick={handleDismissWelcome}
                                    className="w-full h-12 bg-white text-[#1a1a2e] font-black text-[13px] rounded-full active:scale-95 transition-all shadow-xl"
                                >
                                    Got it, let&apos;s go
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* WEEK NAVIGATION */}
                    <div className="w-full flex flex-col gap-4 mb-8">
                        <div className="flex items-center justify-between px-2">
                            <button type="button" onClick={() => setWeekOffset(weekOffset - 1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full text-gray-400 active:scale-90 transition-all">
                                <ChevronRight size={14} className="rotate-180" />
                            </button>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">This Week</span>
                            <button type="button" onClick={() => setWeekOffset(weekOffset + 1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full text-gray-400 active:scale-90 transition-all">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                        
                        <div className="w-full relative">
                            <div className="flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide snap-x snap-mandatory">
                                {Array.from({ length: 31 }).map((_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + (i - 15) + (weekOffset * 7));
                                    const isSelected = selectedDate.toDateString() === date.toDateString();
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    
                                    return (
                                        <motion.button 
                                            key={i}
                                            onClick={() => setSelectedDate(date)}
                                            whileTap={{ scale: 0.9 }}
                                            className="flex flex-col items-center gap-2 flex-none snap-center"
                                        >
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-[#1a1a2e]' : 'text-gray-300'}`}>
                                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-[#1a1a2e] text-white shadow-xl scale-110' : 'text-gray-400 bg-white border border-gray-100 shadow-sm'}`}>
                                                <span className="text-[15px] font-black leading-none">{date.getDate()}</span>
                                                {isToday && (
                                                    <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-blue-400' : 'bg-blue-500'}`} />
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* MORNING CHECK-IN */}
                <section className="w-full mb-10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Morning Check-In</span>
                        <div className="h-[1px] flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { e: '🧘', m: 'flow', l: 'Flow' },
                            { e: '🔋', m: 'charged', l: 'Ready' },
                            { e: '🛡️', m: 'defensive', l: 'Defend' },
                            { e: '⚠️', m: 'tilt', l: 'Focus' }
                        ].map((item) => (
                            <button
                                key={item.m}
                                onClick={() => handleSetMood(item.m)}
                                className={`flex flex-col items-center justify-center gap-1.5 h-24 rounded-[32px] transition-all border-2 ${
                                    targetLog?.mood === item.m
                                    ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white shadow-xl scale-105 z-10' 
                                    : 'bg-white border-transparent text-gray-300 hover:border-gray-100 shadow-sm'
                                }`}
                            >
                                <span className="text-2xl">{item.e}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">{item.l}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <InsightCards />

                {/* TODAY'S RULES */}
                <section className="w-full flex flex-col gap-6 mb-12">
                    <div className="flex items-center gap-3 px-2">
                        <span className="text-[10px] font-black text-[#1a1a2e] uppercase tracking-widest">My Rules</span>
                        <div className="h-[1.5px] flex-1 bg-blue-100" />
                        <Link href="/rules" className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                            Edit <ChevronRight size={10} strokeWidth={4} />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        {activeRules.length > 0 ? (
                            activeRules.map((rule) => {
                                const phase = phases.find(p => p.category === rule.category) || phases[0];
                                return (
                                    <motion.button
                                        key={rule.id}
                                        onClick={() => handleToggleRule(rule.id)}
                                        onPointerDown={() => startRuleLongPress(rule.id)}
                                        onPointerUp={cancelRuleLongPress}
                                        onPointerLeave={cancelRuleLongPress}
                                        onPointerCancel={cancelRuleLongPress}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full p-4 rounded-[24px] border-2 transition-all flex items-center justify-between group ${
                                            rule.violated ? 'border-red-200 bg-red-50/40' : ''
                                        } ${
                                            checkedIds.includes(rule.id) 
                                            ? 'bg-blue-50/30 border-blue-50' 
                                            : 'bg-white border-transparent shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                                                checkedIds.includes(rule.id) ? 'bg-blue-100/50' : 'bg-gray-50'
                                            }`}>
                                                {rule.emoji || '🛡️'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[15px] font-black text-[#1a1a2e] leading-tight ${checkedIds.includes(rule.id) ? 'opacity-30 line-through' : ''}`}>
                                                    {rule.text}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                                                    {phase.name} • {checkedIds.includes(rule.id) ? 'Followed' : 'Not checked yet'}
                                                    {rule.violated ? ' · Violated' : ''}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-300 mt-0.5">Long-press to flag violation</span>
                                            </div>
                                        </div>

                                        <motion.div
                                            key={checkedIds.includes(rule.id) ? `on-${rule.id}` : `off-${rule.id}`}
                                            initial={{ scale: 0.75 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 520, damping: 16 }}
                                            className={`min-w-[44px] min-h-[44px] rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                                checkedIds.includes(rule.id)
                                                ? 'bg-cta border-cta text-white shadow-lg'
                                                : 'border-gray-100'
                                            }`}
                                        >
                                            {checkedIds.includes(rule.id) && <Check size={16} strokeWidth={4} />}
                                        </motion.div>
                                    </motion.button>
                                );
                            })
                        ) : (
                            <Link href="/onboarding" className="p-10 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center gap-3 text-center">
                                <Shield className="text-gray-300" size={32} />
                                <span className="text-[13px] font-bold text-gray-400">No rules set up yet.<br/>Tap to architect your plan.</span>
                            </Link>
                        )}
                    </div>
                </section>

                {/* TRADE COUNTER & ACTION */}
                <section className="w-full flex flex-col items-center gap-6 mb-14">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Trades Today</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-[#1a1a2e] leading-none">{targetTrades.length}</span>
                            <span className="text-xl font-bold text-gray-300">/ {session.tradesAllowed}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            setCaptureMode('checklist');
                            setCaptureOpen(true);
                        }}
                        className="w-full h-18 btn-primary rounded-[32px] font-black text-[16px] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.25)] active:scale-95 transition-all py-5"
                    >
                        <Plus size={20} strokeWidth={4} />
                        Log Trade
                    </button>
                </section>

                {showPostSession && (
                    <section className="w-full mb-10">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Post-Session Notes</span>
                            <div className="h-[1px] flex-1 bg-gray-100" />
                        </div>
                        <textarea
                            placeholder="How did the session go? Lessons for tomorrow..."
                            rows={3}
                            defaultValue={session.notes ?? ''}
                            onBlur={(e) => {
                                updateSession({ notes: e.target.value });
                                showToast('Session notes saved', 'success');
                            }}
                            className="w-full bg-white rounded-[28px] p-5 font-bold text-[#1a1a2e] border border-gray-100 resize-none shadow-sm"
                        />
                    </section>
                )}
            </main>
            </PullToRefresh>
            <MentalReset isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
        </div>
    );
}

