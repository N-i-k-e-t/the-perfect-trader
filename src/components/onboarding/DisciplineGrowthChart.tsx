'use client';

/** Static SVG discipline curve — shape varies by experience tier */
export default function DisciplineGrowthChart({ experience }: { experience: string }) {
    const tier = ['10', '5'].includes(experience) ? 'veteran' : ['3'].includes(experience) ? 'mid' : 'new';

    const paths = {
        new: 'M 8 88 Q 40 82 72 58 T 136 22',
        mid: 'M 8 78 Q 48 70 88 48 T 136 28',
        veteran: 'M 8 72 Q 56 64 96 42 T 136 18',
    };

    const labels = {
        new: 'Steeper early gains — consistency builds fast with daily reps',
        mid: 'Solid baseline — refinement accelerates from here',
        veteran: 'Fine-tuning phase — marginal gains from discipline edge',
    };

    return (
        <div className="w-full rounded-[32px] bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4a] p-6 text-white shadow-md">
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-2">
                Your growth path
            </p>
            <h3 className="text-[18px] font-black leading-tight mb-6">
                Based on your profile, here&apos;s your discipline curve
            </h3>
            <svg viewBox="0 0 144 96" className="w-full h-40 mb-4" aria-hidden>
                <defs>
                    <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`${paths[tier]} L 136 96 L 8 96 Z`}
                    fill="url(#curveFill)"
                />
                <path
                    d={paths[tier]}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <circle cx="136" cy={tier === 'veteran' ? 18 : tier === 'mid' ? 28 : 22} r="5" fill="#22c55e" />
            </svg>
            <p className="text-[13px] font-bold text-white/70 leading-relaxed">{labels[tier]}</p>
        </div>
    );
}
