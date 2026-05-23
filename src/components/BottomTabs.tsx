'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Shield,
    Calendar,
    Activity,
    Plus,
    FileText,
    Camera,
    ListChecks,
} from 'lucide-react';
import { usePerfectTrader } from '@/lib/context';
import { track } from '@/lib/analytics';

const navItems = [
    { to: '/today', icon: Home, label: 'Today' },
    { to: '/rules', icon: Shield, label: 'Rules' },
    { type: 'fab' as const },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/stats', icon: Activity, label: 'Stats' },
];

export default function BottomTabs() {
    const pathname = usePathname();
    const { setCaptureOpen, setCaptureMode } = usePerfectTrader();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleAction = (type: string) => {
        setIsMenuOpen(false);
        setCaptureMode(type as 'checklist' | 'note' | 'photo');
        setCaptureOpen(true);
    };

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-[200]">
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[199]"
                        />
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-[210]">
                            {[
                                { id: 'checklist', icon: ListChecks, label: 'Log Trade', bg: 'bg-[#10b981]' },
                                { id: 'note', icon: FileText, label: 'Quick Note', bg: 'bg-[#1a1a2e]' },
                                { id: 'photo', icon: Camera, label: 'Scan Rules', bg: 'bg-[#f59e0b]' },
                            ].map((item, i) => (
                                <motion.button
                                    key={item.id}
                                    type="button"
                                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.5 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                    onClick={() => handleAction(item.id)}
                                    className="flex items-center gap-3 pr-4 pl-3 py-2 bg-white rounded-full shadow-md border border-[#f3f4f6] min-h-[44px]"
                                >
                                    <div
                                        className={`${item.bg} min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-white`}
                                    >
                                        <item.icon size={18} />
                                    </div>
                                    <span className="text-[13px] font-semibold text-[#111827]">{item.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </>
                )}
            </AnimatePresence>

            <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                <nav className="bg-white/90 backdrop-blur-md border border-[#f3f4f6] rounded-2xl px-2 h-[72px] flex justify-between items-center shadow-md relative">
                    {navItems.map((item) => {
                        if (item.type === 'fab') {
                            return (
                                <div key="fab-container" className="flex-1 flex justify-center -mt-10">
                                    <button
                                        type="button"
                                        onClick={toggleMenu}
                                        aria-label="Open capture menu"
                                        className={`min-w-[56px] min-h-[56px] bg-[#1a1a2e] rounded-full flex items-center justify-center text-white shadow-md border-4 border-white active:scale-[0.97] z-[210] ${isMenuOpen ? 'rotate-45' : ''}`}
                                    >
                                        <Plus size={28} strokeWidth={2.5} />
                                    </button>
                                </div>
                            );
                        }

                        const Icon = item.icon!;
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                href={item.to!}
                                onClick={() => {
                                    if (!isActive) {
                                        track('tab_switched', 'navigation', {
                                            from_tab: pathname,
                                            to_tab: item.to,
                                        });
                                    }
                                }}
                                className={`flex flex-col items-center justify-center flex-1 min-h-[44px] gap-1 active:opacity-80 ${
                                    isActive ? 'text-[#1a1a2e]' : 'text-[#9ca3af]'
                                }`}
                            >
                                <span className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl">
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </span>
                                <span
                                    className={`text-[12px] font-medium ${isActive ? 'text-[#111827]' : 'text-[#9ca3af]'}`}
                                >
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div layoutId="activeTabDot" className="w-1 h-1 bg-[#10b981] rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
