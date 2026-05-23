'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';

/** Fire modal_opened / modal_closed when `isOpen` toggles. */
export function useModalTracking(
    modalId: string,
    isOpen: boolean,
    triggerElement: string = 'button'
): void {
    const openAt = useRef(0);
    const wasOpen = useRef(false);

    useEffect(() => {
        if (isOpen && !wasOpen.current) {
            openAt.current = Date.now();
            wasOpen.current = true;
            track('modal_opened', 'navigation', {
                modal_id: modalId,
                trigger_element: triggerElement,
            });
        } else if (!isOpen && wasOpen.current) {
            wasOpen.current = false;
            track('modal_closed', 'navigation', {
                modal_id: modalId,
                dismiss_method: 'button',
                time_open_ms: openAt.current ? Date.now() - openAt.current : 0,
            });
        }
    }, [isOpen, modalId, triggerElement]);
}
