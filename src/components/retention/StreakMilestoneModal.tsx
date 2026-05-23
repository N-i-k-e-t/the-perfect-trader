'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export default function StreakMilestoneModal({
    days,
    onClose,
}: {
    days: number;
    onClose: () => void;
}) {
    useEscapeKey(onClose, true);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] flex flex-col bg-gradient-to-b from-orange-400 via-orange-500 to-[#1a1a2e] text-white"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-5 z-10 min-w-[44px] min-h-[44px] p-2 rounded-full bg-white/20 text-white flex items-center justify-center"
                    aria-label="Close"
                >
                    <X size={22} />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                        className="w-28 h-28 mb-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm"
                    >
                        <Flame size={56} className="fill-white" />
                    </motion.div>
                    <motion.h2
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[48px] font-black leading-none mb-4 tracking-tight"
                    >
                        {days} Day Streak!
                    </motion.h2>
                    <motion.p
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.18 }}
                        className="text-[17px] font-semibold text-white/85 leading-relaxed max-w-[300px]"
                    >
                        Your discipline is compounding. Keep showing up.
                    </motion.p>
                </div>

                <div className="px-8 pb-[calc(env(safe-area-inset-bottom)+28px)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-16 btn-primary rounded-[28px] font-black text-[18px] shadow-2xl active:scale-95 "
                    >
                        Keep going
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
