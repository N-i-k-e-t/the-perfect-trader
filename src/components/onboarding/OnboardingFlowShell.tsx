'use client';

import { ReactNode } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/lib/analytics/constants';
import { APP_NAME } from '@/lib/brand';

const STEP_LABELS: Record<string, string> = {
    splash: 'Welcome',
    identity: 'Trading style',
    asset: 'Your market',
    experience: 'Experience',
    growth_path: 'Growth path',
    time_window: 'Session window',
    trade_cap: 'Trade cap',
    risk: 'Risk rules',
    constraint: 'Biggest challenge',
    promise: 'Your promise',
    building: 'Building plan',
    complete: 'Your plan',
};

export default function OnboardingFlowShell({
    children,
    currentStep,
    totalSteps,
    onBack,
    canGoBack,
}: {
    children: ReactNode;
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    canGoBack: boolean;
}) {
    const stepKey = ONBOARDING_STEPS[currentStep] ?? `step_${currentStep}`;
    const stepLabel = STEP_LABELS[stepKey] ?? 'Setup';
    const progressPct = Math.round(((currentStep + 1) / totalSteps) * 100);

    return (
        <div className="min-h-[100dvh] w-full md:flex md:min-h-[100dvh] md:bg-[#0a0a12]">
            {/* Desktop — left rail */}
            <aside className="hidden md:flex flex-col w-[min(380px,32vw)] shrink-0 bg-[#1a1a2e] text-white p-10 xl:p-12 border-r border-white/10">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-11 h-11 bg-emerald-500 text-[#1a1a2e] rounded-xl flex items-center justify-center">
                        <Target size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white/50">Setup</p>
                        <p className="text-[18px] font-black leading-tight">{APP_NAME}</p>
                    </div>
                </div>

                <p className="text-[13px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                    Step {currentStep + 1} of {totalSteps}
                </p>
                <h2 className="text-[32px] font-black leading-tight mb-6">{stepLabel}</h2>

                <div className="flex gap-1 mb-3">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 duration-300"
                                style={{ width: i <= currentStep ? '100%' : '0%' }}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-[12px] font-bold text-white/40 mb-10">{progressPct}% complete</p>

                <p className="text-[14px] font-medium text-white/55 leading-relaxed flex-1">
                    Answer a few questions so we can build your discipline plan. Takes about 2 minutes.
                </p>

                <button
                    type="button"
                    onClick={onBack}
                    disabled={!canGoBack}
                    className="mt-8 inline-flex items-center gap-2 text-[14px] font-black text-white/70 hover:text-white disabled:opacity-0 transition-opacity"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
            </aside>

            {/* Content — mobile chrome is inside children (md:hidden); desktop scrolls here */}
            <div className="flex-1 flex flex-col min-h-[100dvh] md:min-h-[100dvh] md:bg-white md:overflow-y-auto">
                <div className="flex-1 w-full md:max-w-3xl md:mx-auto md:px-10 lg:px-14 md:py-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
