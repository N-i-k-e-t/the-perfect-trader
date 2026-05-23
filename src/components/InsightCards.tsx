'use client';

import { useEffect, useRef } from 'react';
import { usePerfectTrader } from '@/lib/context';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { track } from '@/lib/analytics';
import { applyCoachDismissTune } from '@/lib/retention/coach-tune';
import { X, Lightbulb, TrendingDown, Zap } from 'lucide-react';
import type { CoachMessage } from '@/types/trading';

function CoachMessageCard({
    msg,
    onDismiss,
}: {
    msg: CoachMessage;
    onDismiss: (id: string) => void;
}) {
    const shownAt = useRef(Date.now());
    const { userModel, updateUserModel } = usePerfectTrader();
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-120, 0], [0.3, 1]);

    useEffect(() => {
        track('coach_message_shown', 'ai', {
            message_type: msg.type ?? 'session_start',
            tone: msg.tone,
            priority: msg.priority,
        });
    }, [msg.id, msg.type, msg.tone, msg.priority]);

    const handleDismiss = () => {
        track('coach_message_dismissed', 'ai', {
            message_type: msg.type ?? 'session_start',
            tone: msg.tone,
            time_shown_ms: Date.now() - shownAt.current,
        });
        applyCoachDismissTune(msg.tone, updateUserModel, userModel);
        onDismiss(msg.id);
    };

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (info.offset.x < -80 || info.velocity.x < -400) {
            handleDismiss();
        }
    };

    return (
        <motion.div
            layout
            style={{ x, opacity }}
            drag="x"
            dragConstraints={{ left: -160, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.85, transition: { duration: 0.2 } }}
            className="flex-shrink-0 w-[280px] snap-center touch-pan-y"
        >
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#1a1a2e]/5 relative overflow-hidden">
                <div
                    className={`absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-10 rounded-full ${
                        msg.tone === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                />

                <button
                    type="button"
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#1a1a2e]/5 rounded-full text-[#9ca3af] active:scale-90 transition-all z-10"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-2 mb-4 pr-12">
                    <div
                        className={`p-2 rounded-xl ${
                            msg.tone === 'warning' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                        }`}
                    >
                        {msg.id.includes('time') ? (
                            <Zap size={18} />
                        ) : msg.id.includes('cost') ? (
                            <TrendingDown size={18} />
                        ) : (
                            <Lightbulb size={18} />
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
                        {msg.type === 'weekly_review' ? 'Weekly Insight' : 'System Alert'}
                    </span>
                </div>

                <p className="text-[13px] font-semibold text-[#1a1a2e] leading-relaxed mb-4">{msg.message}</p>

                <p className="text-[10px] font-bold text-[#9ca3af]">
                    Swipe left to dismiss ·{' '}
                    {new Date(msg.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                    })}
                </p>
            </div>
        </motion.div>
    );
}

export default function InsightCards() {
    const { coachMessages, removeCoachMessage } = usePerfectTrader();

    if (!coachMessages || coachMessages.length === 0) return null;

    return (
        <section className="relative overflow-hidden py-2 w-full mb-8">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1 snap-x">
                <AnimatePresence mode="popLayout">
                    {coachMessages.map((msg) => (
                        <CoachMessageCard key={msg.id} msg={msg} onDismiss={removeCoachMessage} />
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
