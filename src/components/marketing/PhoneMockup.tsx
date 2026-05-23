'use client';

/** CSS-only phone frame with Today-style discipline preview */
export function PhoneMockup() {
    return (
        <div className="relative mx-auto w-[260px] sm:w-[280px] shrink-0">
            <div className="rounded-[40px] border-[10px] border-[#2d2d44] bg-[#1a1a2e] shadow-2xl overflow-hidden aspect-[9/19]">
                <div className="h-7 bg-[#0f0f1a] flex items-center justify-center">
                    <div className="w-16 h-1 bg-white/10 rounded-full" />
                </div>
                <div className="p-4 flex flex-col gap-4 text-white">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Today</p>
                        <p className="text-[11px] font-bold text-emerald-400 mt-1">Market LIVE</p>
                    </div>
                    <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff15" strokeWidth="8" />
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="8"
                                strokeDasharray="264"
                                strokeDashoffset="40"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[28px] font-black text-emerald-400">A</span>
                            <span className="text-[10px] font-bold text-white/50">85%</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {['No revenge trades', 'Risk ≤ 1%', 'Log every exit'].map((r) => (
                            <div
                                key={r}
                                className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10"
                            >
                                <span className="text-emerald-400 text-xs">✓</span>
                                <span className="text-[10px] font-bold text-white/80">{r}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto h-10 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-black text-[#1a1a2e]">
                        Log Trade
                    </div>
                </div>
            </div>
        </div>
    );
}
