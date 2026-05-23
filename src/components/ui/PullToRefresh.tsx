'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 72;

export function PullToRefresh({
    onRefresh,
    children,
    className = '',
}: {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    className?: string;
}) {
    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef(0);
    const pulling = useRef(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY > 8 || refreshing) return;
        startY.current = e.touches[0].clientY;
        pulling.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!pulling.current || refreshing) return;
        const delta = e.touches[0].clientY - startY.current;
        if (delta > 0) setPull(Math.min(delta * 0.45, 100));
        else setPull(0);
    };

    const handleTouchEnd = async () => {
        if (!pulling.current) return;
        pulling.current = false;
        if (pull >= THRESHOLD && !refreshing) {
            setRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
            }
        }
        setPull(0);
    };

    return (
        <div
            className={className}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
                style={{ height: refreshing ? 48 : pull > 0 ? pull : 0 }}
            >
                {refreshing || pull > THRESHOLD * 0.6 ? (
                    <Loader2
                        size={22}
                        className={`text-[#1a1a2e] ${refreshing ? 'animate-spin' : ''}`}
                    />
                ) : (
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Pull to refresh
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}
