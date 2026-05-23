'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { IS_BETA } from '@/lib/config';
import {
    flushEvents,
    hasAnalyticsConsent,
    incrementPageView,
    initGeoEnrichment,
    initTrackingTransport,
    setTrackingSnapshot,
    track,
} from '@/lib/analytics';

export default function TrackingProvider({
    children,
    initialAuthUserId = null,
}: {
    children: React.ReactNode;
    initialAuthUserId?: string | null;
}) {
    const pathname = usePathname();
    const prevPath = useRef<string | null>(null);
    const pageEnterMs = useRef(Date.now());
    const maxScroll = useRef(0);
    const loadStarted = useRef(
        typeof performance !== 'undefined' ? performance.now() : 0
    );

    const { user, rules, trades, session, isCheckingAuth } = usePerfectTrader();

    useEffect(() => {
        initTrackingTransport();
        initGeoEnrichment();
        const loadTime = loadStarted.current;
        track('app_loaded', 'technical', {
            cached_data_loaded: Boolean(localStorage.getItem('perfect_trader_data')),
            load_time_ms: Math.round(loadTime),
            time_to_first_interactive_ms: Math.round(performance.now()),
        });
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const tradeCountToday = trades.filter((t) => t.date?.startsWith(today)).length;
        setTrackingSnapshot({
            isBeta: IS_BETA,
            isPro: user?.isPro ?? false,
            isAdmin: user?.isAdmin ?? false,
            ruleCount: rules.length,
            tradeCountToday,
            hasActiveSession: session.preSessionComplete || session.tradesTaken > 0,
        });
    }, [user, rules.length, trades, session.preSessionComplete, session.tradesTaken, initialAuthUserId]);

    useEffect(() => {
        if (initialAuthUserId) {
            setTrackingSnapshot({
                userId: initialAuthUserId,
                isPro: user?.isPro ?? false,
                isAdmin: user?.isAdmin ?? false,
            });
            return;
        }
        if (isCheckingAuth) return;
        void import('@/utils/supabase/client').then(({ createClient }) => {
            const supabase = createClient();
            void supabase.auth.getUser().then(({ data }) => {
                setTrackingSnapshot({
                    userId: data.user?.id ?? null,
                    isPro: user?.isPro ?? false,
                    isAdmin: user?.isAdmin ?? false,
                });
            });
        });
    }, [initialAuthUserId, isCheckingAuth, user?.isPro, user?.isAdmin]);

    useEffect(() => {
        if (!pathname) return;
        const from = prevPath.current;
        prevPath.current = pathname;
        pageEnterMs.current = Date.now();
        maxScroll.current = 0;

        incrementPageView();
        track('page_viewed', 'navigation', {
            path: pathname,
            title: typeof document !== 'undefined' ? document.title : '',
            from_path: from,
            nav_method: from ? 'click' : 'direct',
        });

        if (pathname === '/login' || pathname === '/signup') {
            track('auth_page_viewed', 'auth', { path: pathname });
        }

        if (pathname === '/onboarding') {
            track('onboarding_started', 'onboarding', {
                is_first_ever_session: !user?.email,
            });
        }
    }, [pathname, user?.email]);

    useEffect(() => {
        if (!hasAnalyticsConsent()) return;

        const onScroll = () => {
            const doc = document.documentElement;
            const pct = Math.round(
                ((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100
            );
            const prev = maxScroll.current;
            for (const threshold of [25, 50, 75, 100]) {
                if (pct >= threshold && prev < threshold) {
                    track('scroll_depth_reached', 'engagement', {
                        page_path: pathname,
                        depth_percent: threshold,
                    });
                }
            }
            maxScroll.current = Math.max(maxScroll.current, pct);
        };

        const heartbeat = setInterval(() => {
            track('time_on_page', 'engagement', {
                page_path: pathname,
                active_seconds: 30,
                total_seconds_on_page: Math.round((Date.now() - pageEnterMs.current) / 1000),
            });
        }, 30_000);

        window.addEventListener('scroll', onScroll, { passive: true });

        const onVisibility = () => {
            track('session_focus_changed', 'engagement', {
                new_state: document.hidden ? 'hidden' : 'visible',
            });
            if (document.hidden) void flushEvents({ keepalive: true });
        };
        document.addEventListener('visibilitychange', onVisibility);

        const onOffline = () => track('offline_mode_entered', 'technical', {});
        const onOnline = () => track('offline_mode_exited', 'technical', {});
        window.addEventListener('offline', onOffline);
        window.addEventListener('online', onOnline);

        let idleTimer: ReturnType<typeof setTimeout>;
        const idleThreshold = 3 * 60 * 1000;
        const resetIdle = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                track('idle_detected', 'engagement', {
                    idle_duration_ms: idleThreshold,
                    last_active_path: window.location.pathname,
                });
            }, idleThreshold);
        };
        ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach((e) =>
            window.addEventListener(e, resetIdle, { passive: true })
        );
        resetIdle();

        let clickLog: { el: EventTarget | null; t: number }[] = [];
        const onClick = (e: MouseEvent) => {
            const now = Date.now();
            clickLog = clickLog.filter((c) => now - c.t < 500);
            clickLog.push({ el: e.target, t: now });
            const sameEl = clickLog.filter((c) => c.el === e.target);
            if (sameEl.length >= 3) {
                track('rage_click_detected', 'engagement', {
                    element_id: (e.target as HTMLElement)?.id ?? null,
                    click_count: sameEl.length,
                    page_path: window.location.pathname,
                });
                clickLog = [];
            }
        };
        window.addEventListener('click', onClick);

        return () => {
            clearInterval(heartbeat);
            clearTimeout(idleTimer);
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('online', onOnline);
            ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach((e) =>
                window.removeEventListener(e, resetIdle)
            );
            window.removeEventListener('click', onClick);
        };
    }, [pathname]);

    return <>{children}</>;
}
