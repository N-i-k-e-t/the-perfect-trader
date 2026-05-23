'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';

export default function StreakMilestoneModal({
    days,
    onClose,
}: {
    days: number;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center relative"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Flame size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">{days} Day Streak!</h2>
                    <p className="text-[14px] font-semibold text-gray-500 leading-relaxed">
                        Your discipline is compounding. Keep showing up.
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 w-full h-12 bg-[#1a1a2e] text-white rounded-2xl font-black text-[14px]"
                    >
                        Keep going
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
