'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase-data';
import { userFromSupabaseAuthUser } from '@/lib/auth-user';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { track } from '@/lib/analytics';
import { ONBOARDING_STEPS } from '@/lib/analytics/constants';
import { waitForSession } from '@/lib/auth-session';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, Minus, Check, Loader2, Sparkles, ShieldCheck, Target, Lock, Award } from 'lucide-react';
import DisciplineGrowthChart from '@/components/onboarding/DisciplineGrowthChart';

export default function OnboardingPage() {
    const { user, isCheckingAuth, showToast, updateUserModel, updateSession, setUser } = usePerfectTrader();
    const router = useRouter();
    const supabase = createClient();
    const [authReady, setAuthReady] = useState(() => Boolean(user));
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<any>({
        style: '',
        assetClass: '',
        riskPerTrade: '1%',
        maxLoss: '2%',
        experience: '',
        frequency: 3,
        goalLevel: 'Expert',
        primaryConstraint: '',
        timeWindow: '',
        contractType: '',
        leverageLevel: '',
        systemType: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const stepEnteredAt = useRef(Date.now());

    useEffect(() => {
        const stepName = ONBOARDING_STEPS[currentStep] ?? `step_${currentStep}`;
        const elapsed = Date.now() - stepEnteredAt.current;
        track('onboarding_step_viewed', 'onboarding', {
            step_index: currentStep,
            step_name: stepName,
            time_on_prev_step_ms: currentStep > 0 ? elapsed : 0,
        });
        stepEnteredAt.current = Date.now();
    }, [currentStep]);

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setAuthReady(true);
            return;
        }

        if (user) {
            setAuthReady(true);
            return;
        }

        let cancelled = false;

        const finish = (authUser: SupabaseUser) => {
            if (cancelled) return;
            setUser(userFromSupabaseAuthUser(authUser));
            setAuthReady(true);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) finish(session.user);
        });

        (async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                finish(authUser);
                return;
            }
            const session = await waitForSession(supabase, 5, 120);
            if (session?.user) {
                finish(session.user);
                return;
            }
            if (!cancelled) router.replace('/signup?error=session');
        })();

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [supabase, router, setUser, user]);

    useEffect(() => {
        if (!isSupabaseConfigured() || isCheckingAuth) return;
        if (!user && authReady) {
            router.replace('/signup?error=session');
        }
    }, [isCheckingAuth, user, authReady, router]);

    // Auto-advance Step 9 (Architecture Generation)
    useEffect(() => {
        if (currentStep === 10) {
            const timer = setTimeout(() => {
                nextStep();
            }, 4500);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    const nextStep = () => {
        const stepName = ONBOARDING_STEPS[currentStep] ?? `step_${currentStep}`;
        track('onboarding_step_completed', 'onboarding', {
            step_index: currentStep,
            step_name: stepName,
        });
        setCurrentStep((prev) => prev + 1);
    };
    const prevStep = () => {
        track('onboarding_step_back', 'onboarding', {
            from_step: currentStep,
            to_step: Math.max(0, currentStep - 1),
        });
        setCurrentStep((prev) => prev - 1);
    };

    const handleSingleSelect = (key: string, value: string, autoAdvance = true) => {
        setAnswers({ ...answers, [key]: value });
        if (autoAdvance) {
            setTimeout(() => nextStep(), 250);
        }
    };

    const handleFinish = async () => {
        setIsGenerating(true);
        
        // Sync with Context
        updateUserModel({
            primary_style: answers.style,
            avg_trades_per_day: answers.frequency,
            dominant_weakness: answers.primaryConstraint,
            goal: answers.goalLevel,
            primary_market: answers.assetClass
        });

        // Sync with Supabase Metadata
        if (user) {
            await supabase.auth.updateUser({
                data: { 
                    onboarding_completed: true,
                    trading_style: answers.style,
                    challenge: answers.primaryConstraint,
                    experience: answers.experience
                }
            });
        }

        track('onboarding_quiz_completed', 'onboarding', {
            trading_style: answers.style,
            experience: answers.experience,
            primary_market: answers.assetClass,
            primary_constraint: answers.primaryConstraint,
            goal_level: answers.goalLevel,
            risk_per_trade: answers.riskPerTrade,
            time_window: answers.timeWindow,
        });

        setTimeout(() => {
            setIsGenerating(false);
            nextStep(); // Final Welcome
        }, 4000);
    };

    if (!authReady) {
        return (
            <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-[12px] font-bold text-gray-400">Setting up your account…</p>
            </div>
        );
    }

    const totalSteps = 12; // 0-11
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const OptionCard = ({ emoji, title, subtitle, selected, onClick }: any) => (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full group flex items-center gap-5 transition-all p-5 rounded-[40px] border-2 ${
                selected ? 'border-[#1a1a2e] bg-[#1a1a2e]/5' : 'border-gray-50 bg-gray-50/30'
            }`}
        >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all flex-none ${selected ? 'bg-[#1a1a2e] text-white shadow-lg' : 'bg-white shadow-sm'}`}>
                {emoji}
            </div>
            <div className="flex flex-col items-start text-left flex-1">
                <span className="text-[17px] font-black text-[#1a1a2e] leading-tight mb-0.5">{title}</span>
                {subtitle && <span className="text-[12px] font-bold text-gray-400 leading-tight">{subtitle}</span>}
            </div>
            {selected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 bg-[#1a1a2e] rounded-full flex items-center justify-center flex-none">
                    <Check size={16} strokeWidth={4} className="text-white" />
                </motion.div>
            )}
        </motion.button>
    );

    return (
        <div className="min-h-[100dvh] bg-white flex flex-col pb-[calc(env(safe-area-inset-bottom)+20px)]">
            {/* SEGMENTED PROGRESS BAR - CAL AI STYLE */}
            <div className="fixed top-0 left-0 right-0 px-5 pt-4 z-[110] flex flex-col gap-2" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#1a1a2e]"
                                initial={{ width: '0%' }}
                                animate={{ width: i <= currentStep ? '100%' : '0%' }}
                                transition={{ duration: 0.4, ease: "circOut" }}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-center text-[11px] font-bold text-gray-400 tracking-wider">
                    Step {currentStep + 1} of {totalSteps}
                </p>
            </div>

            {/* NAV BAR */}
            <nav className="h-14 flex items-center justify-between px-5 z-[100] mt-8">
                <button 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="w-12 h-12 flex items-center justify-center text-[#1a1a2e] bg-gray-50 rounded-full disabled:opacity-0 active:scale-90 transition-all shadow-sm group"
                >
                    <ArrowLeft size={20} strokeWidth={3} />
                </button>
                <div className="w-12 h-12" />
            </nav>

            <main className="flex-1 px-5 flex flex-col pt-4 overflow-x-hidden pb-20">
                <AnimatePresence mode="wait">
                    {/* STEP 0: THE SPLASH - PREMIUM CAL AI STYLE */}
                    {currentStep === 0 && (
                        <motion.div key="s0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex-1 flex flex-col items-center justify-start text-center px-4 pt-2">
                            <div className="relative w-full max-w-[280px] aspect-[3/4] max-h-[220px] rounded-[48px] overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.2)] border-4 border-white bg-gradient-to-br from-[#1a1a2e] via-[#2d2d4a] to-blue-900 mb-6 flex flex-col items-center justify-center shrink-0">
                                <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center mb-6">
                                    <Target size={40} className="text-yellow-400" strokeWidth={2.5} />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-10 left-10 right-10 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trading Plan v1.1.0</span>
                                    </div>
                                    <h3 className="text-white font-black text-2xl leading-tight">Master Your <br/> Trading Plan.</h3>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 mb-6">
                                <h1 className="text-[36px] font-black text-[#1a1a2e] leading-[0.95] tracking-tighter">Trade with<br/>Discipline.</h1>
                                <p className="text-[15px] font-bold text-gray-400 max-w-[280px] mx-auto">
                                    Build a custom trading plan based on your trading style.
                                </p>
                            </div>
                            
                            <button onClick={nextStep} className="h-[64px] w-full btn-primary rounded-[35px] font-black text-[20px] active:scale-95 transition-all shadow-2xl shrink-0">
                                Get Started
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: IDENTITY */}
                    {currentStep === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">I identify as a...</h2>
                                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest pl-1">Build your plan</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <OptionCard emoji="🏦" title="Institutional Mind" subtitle="Focus on large trends, risk-averse" onClick={() => handleSingleSelect('style', 'institutional')} selected={answers.style === 'institutional'} />
                                <OptionCard emoji="🗡️" title="Aggressive Scalper" subtitle="High intensity, precision entries" onClick={() => handleSingleSelect('style', 'scalper')} selected={answers.style === 'scalper'} />
                                <OptionCard emoji="🏰" title="Portfolio Manager" subtitle="Swing focused, diversified" onClick={() => handleSingleSelect('style', 'portfolio')} selected={answers.style === 'portfolio'} />
                                <OptionCard emoji="🧪" title="Systematic Researcher" subtitle="Rules based, purely technical" onClick={() => handleSingleSelect('style', 'systematic')} selected={answers.style === 'systematic'} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: ASSET CLASS */}
                    {currentStep === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">Primary Asset?</h2>
                                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest pl-1">Your Market</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { e: '📈', t: 'Indices', s: 'NQ, ES, DAX' },
                                    { e: '₿', t: 'Crypto', s: 'BTC, ETH' },
                                    { e: '💱', t: 'Forex', s: 'EUR/USD, GBP' },
                                    { e: '🟡', t: 'Commodities', s: 'Gold, Oil' },
                                    { e: '📊', t: 'Stocks', s: 'TSLA, NVDA' },
                                    { e: '📉', t: 'Options', s: 'SPY, QQQ' }
                                ].map(item => (
                                    <button 
                                        key={item.t}
                                        onClick={() => setAnswers({ ...answers, assetClass: item.t })}
                                        className={`h-[110px] rounded-[32px] border-2 transition-all p-4 flex flex-col items-center justify-center gap-1 ${
                                            answers.assetClass === item.t ? 'border-blue-500 bg-blue-50/20 text-[#1a1a2e]' : 'border-gray-50 text-gray-400'
                                        }`}
                                    >
                                        <span className="text-3xl">{item.e}</span>
                                        <span className="text-[13px] font-black">{item.t}</span>
                                    </button>
                                ))}
                            </div>
                            {answers.assetClass && (
                                <motion.button 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={nextStep}
                                    className="h-[72px] w-full btn-primary rounded-[28px] font-black text-[20px] shadow-2xl active:scale-95 transition-all mt-4"
                                >
                                    Continue
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: EXPERIENCE LEVEL */}
                    {currentStep === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">Trading Tenure?</h2>
                                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Your Experience</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <OptionCard emoji="🌱" title="Apprentice" subtitle="Less than 1 Year" onClick={() => handleSingleSelect('experience', '1')} selected={answers.experience === '1'} />
                                <OptionCard emoji="💪" title="The Grind" subtitle="1 to 3 Years" onClick={() => handleSingleSelect('experience', '3')} selected={answers.experience === '3'} />
                                <OptionCard emoji="🏅" title="The Architect" subtitle="3 to 5 Years" onClick={() => handleSingleSelect('experience', '5')} selected={answers.experience === '5'} />
                                <OptionCard emoji="💎" title="Veteran" subtitle="Over 5 Years" onClick={() => handleSingleSelect('experience', '10')} selected={answers.experience === '10'} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: GROWTH PATH */}
                    {currentStep === 4 && (
                        <motion.div key="s4growth" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-col gap-8">
                            <DisciplineGrowthChart experience={answers.experience || '1'} />
                            <button
                                type="button"
                                onClick={nextStep}
                                className="h-[72px] w-full btn-primary rounded-[28px] font-black text-[20px] active:scale-95 transition-all shadow-2xl"
                            >
                                Continue
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 5: TIME WINDOW */}
                    {currentStep === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">Trading Window?</h2>
                                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest pl-1">Active Hours</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <OptionCard emoji="🗽" title="New York Session" subtitle="9:30 AM - 4:00 PM EST" onClick={() => handleSingleSelect('timeWindow', 'nyc')} selected={answers.timeWindow === 'nyc'} />
                                <OptionCard emoji="🏰" title="London Session" subtitle="3:00 AM - 11:30 AM EST" onClick={() => handleSingleSelect('timeWindow', 'ldn')} selected={answers.timeWindow === 'ldn'} />
                                <OptionCard emoji="🗼" title="Asian Session" subtitle="7:00 PM - 3:00 AM EST" onClick={() => handleSingleSelect('timeWindow', 'asia')} selected={answers.timeWindow === 'asia'} />
                                <OptionCard emoji="🌍" title="24/7 Global" subtitle="Crypto or swing trading" onClick={() => handleSingleSelect('timeWindow', '247')} selected={answers.timeWindow === '247'} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 6: DAILY TRADE CAP */}
                    {currentStep === 6 && (
                        <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center flex-1 gap-12">
                            <div className="flex flex-col gap-2 text-center">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">Daily Execution Cap?</h2>
                                <p className="text-[14px] font-bold text-gray-500 px-8 uppercase tracking-widest">Keep your gains</p>
                            </div>
                            <div className="flex items-center gap-8">
                                <button onClick={() => setAnswers({...answers, frequency: Math.max(1, answers.frequency - 1)})} className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-[#1a1a2e] border border-gray-100 active:scale-90 transition-all font-black text-3xl"><Minus /></button>
                                <span className="text-[100px] font-black tabular-nums text-[#1a1a2e] leading-none">{answers.frequency}</span>
                                <button onClick={() => setAnswers({...answers, frequency: Math.min(20, answers.frequency + 1)})} className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 transition-all font-black text-3xl"><Plus /></button>
                            </div>
                            <button onClick={nextStep} className="h-[72px] w-full btn-primary rounded-[28px] font-black text-[20px] shadow-2xl active:scale-95 transition-all">Continue</button>
                        </motion.div>
                    )}

                    {/* STEP 7: RISK PER TRADE */}
                    {currentStep === 7 && (
                        <motion.div key="s7" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">Risk Per Trade?</h2>
                                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest pl-1">Risk Settings</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {['0.25%', '0.5%', '1.0%', '2.0%'].map(val => (
                                    <button 
                                        key={val} 
                                        onClick={() => setAnswers({ ...answers, riskPerTrade: val })}
                                        className={`h-[80px] rounded-[28px] border-2 font-black text-xl transition-all ${
                                            answers.riskPerTrade === val ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-gray-50 bg-white text-gray-300'
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={nextStep}
                                className="h-[72px] w-full btn-primary rounded-[28px] font-black text-[20px] shadow-2xl active:scale-95 transition-all mt-8"
                            >
                                Confirm Risk Level
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 8: BIGGEST BIAS */}
                    {currentStep === 8 && (
                        <motion.div key="s8" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[28px] font-black text-[#1a1a2e] leading-tight">Hardest Constraint?</h2>
                                <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest pl-1">Biggest Struggle</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <OptionCard emoji="🎰" title="Impulse Entry" subtitle="Entering without rules confirmation" onClick={() => handleSingleSelect('primaryConstraint', 'impulse')} selected={answers.primaryConstraint === 'impulse'} />
                                <OptionCard emoji="📉" title="Moving Stops" subtitle="Letting losers run too far" onClick={() => handleSingleSelect('primaryConstraint', 'stoploss')} selected={answers.primaryConstraint === 'stoploss'} />
                                <OptionCard emoji="😤" title="Revenge Trading" subtitle="Trying to make back losses fast" onClick={() => handleSingleSelect('primaryConstraint', 'revenge')} selected={answers.primaryConstraint === 'revenge'} />
                                <OptionCard emoji="⏰" title="Overtrading" subtitle="Forcing trades off-session" onClick={() => handleSingleSelect('primaryConstraint', 'overtrade')} selected={answers.primaryConstraint === 'overtrade'} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 9: THE PROMISE */}
                    {currentStep === 9 && (
                        <motion.div key="s9" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center gap-12">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                                <Lock size={48} strokeWidth={3} />
                            </div>
                            <div className="flex flex-col gap-4">
                                <h2 className="text-[32px] font-black text-[#1a1a2e] leading-tight">My<br/>Promise.</h2>
                                <p className="text-[16px] font-bold text-gray-600 px-10 leading-relaxed">
                                    I commit to following my custom trading plan for the next <strong className="text-[#1a1a2e]">14 days</strong> without deviation.
                                </p>
                            </div>
                            <button onClick={nextStep} className="h-[72px] w-full max-w-[320px] btn-primary rounded-[28px] font-black text-[20px] active:scale-95 transition-all shadow-2xl">
                                I Accept
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 10: GENERATION SEQUENCE */}
                    {currentStep === 10 && (
                        <motion.div key="s10gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center gap-12">
                            <div className="relative">
                                <Loader2 className="animate-spin text-blue-500" size={64} />
                                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-blue-100 rounded-full blur-2xl" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <h2 className="text-[24px] font-black text-[#1a1a2e]">Building Plan...</h2>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Risk Rules', status: 'Active' },
                                        { label: 'Profit Rules', status: 'Active' },
                                        { label: 'Morning Check-In', status: 'Calibrating...' }
                                    ].map((l, i) => (
                                        <motion.div key={l.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.8 }} className="flex items-center justify-between w-[240px] px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-[12px] font-black text-gray-400 uppercase">{l.label}</span>
                                            <span className="text-[11px] font-black text-blue-500 uppercase">{l.status}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 11: PERSONALIZED PLAN RECAP */}
                    {currentStep === 11 && (
                        <motion.div key="s11" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col gap-8">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-lg"><Award size={32} /></div>
                                <h2 className="text-[32px] font-black text-[#1a1a2e] leading-tight">Here&apos;s your<br/>trading plan.</h2>
                                <p className="text-[14px] font-bold text-gray-400 px-4">Built from your answers — review before you start.</p>
                            </div>

                            <div className="card-premium !p-6 flex flex-col gap-4">
                                {[
                                    { label: 'Trading style', value: answers.style || '—' },
                                    { label: 'Market', value: answers.assetClass || '—' },
                                    { label: 'Risk per trade', value: answers.riskPerTrade || '—' },
                                    { label: 'Daily cap', value: `${answers.frequency} trades` },
                                    { label: 'Biggest challenge', value: answers.primaryConstraint || '—' },
                                    { label: 'Your goal', value: answers.goalLevel || '—' },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{row.label}</span>
                                        <span className="text-[15px] font-black text-[#1a1a2e] text-right capitalize">{row.value}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => {
                                    updateSession({ preSessionComplete: true });
                                    router.push('/today');
                                }}
                                className="h-[72px] btn-primary rounded-[28px] font-black text-[20px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
                            >
                                Enter Your Dashboard <ArrowRight size={22} strokeWidth={3} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
