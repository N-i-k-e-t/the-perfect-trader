'use client';

import { useEffect } from 'react';

/** Call onClose when Escape is pressed while `enabled`. */
export function useEscapeKey(onClose: () => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose, enabled]);
}
