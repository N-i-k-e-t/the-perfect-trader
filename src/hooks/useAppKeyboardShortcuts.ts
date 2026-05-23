'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';

/** Desktop keyboard nav per master-page-build (T/J/R/S/N). ESC handled per modal. */
export function useAppKeyboardShortcuts() {
    const router = useRouter();
    const { setCaptureOpen, setCaptureMode } = usePerfectTrader();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            switch (e.key.toLowerCase()) {
                case 't':
                    e.preventDefault();
                    router.push('/today');
                    break;
                case 'j':
                    e.preventDefault();
                    router.push('/journal');
                    break;
                case 'r':
                    e.preventDefault();
                    router.push('/rules');
                    break;
                case 's':
                    e.preventDefault();
                    router.push('/stats');
                    break;
                case 'n':
                    e.preventDefault();
                    setCaptureMode('checklist');
                    setCaptureOpen(true);
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [router, setCaptureOpen, setCaptureMode]);
}
