'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo, useState, ReactNode } from 'react';
import { Rule, Trade, Observation, Session, Analytics, BaselineState, User, DailyLog, PatternInsight, CoachMessage, RiskAlert, Playbook, MarketEvent, UserModel, DiaryEntry } from '@/types/trading';
import { checkRisks } from '@/lib/agents/riskSentinel';
import { createClient } from '@/utils/supabase/client';
import { DATA_VERSION, isSupabaseConfigured, loadTraderData, saveTraderData } from '@/lib/supabase-data';
import { STORAGE_KEY, STORAGE_KEY_LEGACY } from '@/lib/brand';
import { clearLocalAuthCache } from '@/lib/clear-auth-state';
import { track } from '@/lib/analytics';
import {
    buildTiltWarningAlert,
    countSessionTradeViolations,
    countSessionViolations,
    TILT_VIOLATION_THRESHOLD,
} from '@/lib/retention/tilt-warning';

import { userFromAuthSession } from '@/lib/auth-user';

interface AppState {
    sidebarCollapsed: boolean;
    labMode: boolean;
    user: User | null;
    session: Session;
    rules: Rule[];
    trades: Trade[];
    observations: Observation[];
    analytics: Analytics;
    dailyLogs: DailyLog[];
    insights: PatternInsight[];
    coachMessages: CoachMessage[];
    riskAlerts: RiskAlert[];
    playbooks: Playbook[];
    marketEvents: MarketEvent[];
    userModel: UserModel;
    diaryEntries: DiaryEntry[];
    toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
    isCheckingAuth: boolean;
    isCaptureOpen: boolean;
    captureMode: 'initial' | 'note' | 'voice' | 'photo' | 'checklist' | 'none';
}

type Action =
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'TOGGLE_LAB_MODE' }
    | { type: 'SET_LAB_MODE'; payload: boolean }
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'UPDATE_SESSION'; payload: Partial<Session> }
    | { type: 'ADD_TRADE'; payload: Trade }
    | { type: 'UPDATE_TRADE'; payload: Trade }
    | { type: 'REMOVE_TRADE'; payload: string }
    | { type: 'TOGGLE_RULE_VIOLATION'; payload: string }
    | { type: 'ADD_OBSERVATION'; payload: Observation }
    | { type: 'SET_EMOTIONAL_BASELINE'; payload: BaselineState }
    | { type: 'COMPLETE_PRE_SESSION' }
    | { type: 'HYDRATE_STATE'; payload: AppState }
    | { type: 'ADD_RULE'; payload: Rule }
    | { type: 'REMOVE_RULE'; payload: string }
    | { type: 'TOGGLE_RULE_ACTIVE'; payload: string }
    | { type: 'ADD_RULE_FROM_LIBRARY'; payload: Rule }
    | { type: 'LOG_DAILY'; payload: DailyLog }
    | { type: 'SET_INSIGHTS'; payload: PatternInsight[] }
    | { type: 'SET_COACH_MESSAGES'; payload: CoachMessage[] }
    | { type: 'REMOVE_COACH_MESSAGE'; payload: string }
    | { type: 'ADD_RISK_ALERT'; payload: RiskAlert }
    | { type: 'DISMISS_RISK_ALERT'; payload: string }
    | { type: 'ADD_PLAYBOOK'; payload: Playbook }
    | { type: 'SET_MARKET_EVENTS'; payload: MarketEvent[] }
    | { type: 'ADD_MARKET_EVENT'; payload: MarketEvent }
    | { type: 'SHOW_TOAST'; payload: { id: string; message: string; type: 'success' | 'error' | 'info' } }
    | { type: 'UPDATE_USER_MODEL'; payload: Partial<UserModel> }
    | { type: 'ADD_DIARY_ENTRY'; payload: DiaryEntry }
    | { type: 'UPDATE_DIARY_ENTRY'; payload: Partial<DiaryEntry> & { id: string } }
    | { type: 'DISMISS_TOAST'; payload: string }
    | { type: 'SET_CHECKING_AUTH'; payload: boolean }
    | { type: 'SET_CAPTURE_OPEN'; payload: boolean }
    | { type: 'SET_CAPTURE_MODE'; payload: 'initial' | 'note' | 'voice' | 'photo' | 'checklist' | 'none' }
    | { type: 'LOCK_RULES' }
    | { type: 'LOGOUT' };

const initialState: AppState = {
    sidebarCollapsed: false,
    labMode: false,
    user: null, // Start as null to prevent auth hydration loops

    session: {
        date: '2026-03-21', // Static placeholder for hydration safety
        emotionalBaseline: 'neutral',
        rulesLocked: false, // Start unlocked so user can prep
        tradesTaken: 0,
        tradesAllowed: 3,
        stabilityScore: 85,
        preSessionComplete: false,
        notes: '',
    },
    rules: [
        { id: '1', text: 'Never risk more than 2% per trade', emoji: '🛡️', category: 'Risk Rules', isActive: true },
        { id: '2', text: 'Always use a stop loss', emoji: '🛑', category: 'Risk Rules', isActive: true },
        { id: '3', text: 'Wait for confirmation candle', emoji: '🕯️', category: 'Entry/Exit Rules', isActive: true },
        { id: '4', text: 'No revenge trading', emoji: '🧠', category: 'Mindset Rules', isActive: true },
        { id: '5', text: 'Max 3 trades per session', emoji: '🔢', category: 'Pre-Session Rules', isActive: true },
    ],
    trades: [],
    observations: [],
    analytics: {
        weeklyStability: [72, 85, 68, 91, 88, 79, 85],
        ruleAdherence: 82,
        avgTradesPerDay: 2.3,
        behavioralTrend: 'stabilizing',
        consistencyDays: 4,
        primaryDeviation: 'Impulse entry after win',
        indisciplineCost: 14200, // Initial mock for first impression
    },
    dailyLogs: [],
    insights: [],
    coachMessages: [],
    riskAlerts: [],
    playbooks: [
        { id: 'pb1', name: 'NIFTY Opening Range Breakout', description: 'Trading the 15min range break in morning', rules: ['1', '2', '3'], criteria: ['High volume', 'Vix < 25', 'RSI > 60'] }
    ],
    marketEvents: [
        { id: 'ev1', date: '2026-03-18', time: '10:00', title: 'CPI India Data', impact: 'high', country: 'India', type: 'CPI' },
        { id: 'ev2', date: '2026-03-19', time: '14:30', title: 'NIFTY Weekly Expiry', impact: 'high', country: 'India', type: 'Expiry' },
        { id: 'ev3', date: '2026-03-25', time: '12:00', title: 'RBI MPC Meeting', impact: 'critical', country: 'India', type: 'RBI' },
        { id: 'ev4', date: '2026-03-20', time: '14:00', title: 'FOMC Minutes', impact: 'medium', country: 'US', type: 'FOMC' },
    ],
    userModel: {
        primary_style: 'day_trading',
        primary_market: 'NIFTY_options',
        session_preference: 'morning',
        avg_trades_per_day: 3.2,
        typical_position_size_pct: 1.8,
        dominant_weakness: 'moved_sl',
        tilt_trigger: 'consecutive_losses',
        tilt_threshold: 2,
        revenge_trade_pattern: true,
        fomo_pattern: false,
        overconfidence_pattern: true,
        best_time_window: '09:30-10:15',
        worst_time_window: '14:00-15:00',
        best_day: 'wednesday',
        worst_day: 'thursday',
        edge_setup: 'breakout',
        losing_setup: 'reversal',
        news_sensitivity: 'high',
        responds_to: 'data',
        insight_engagement_rate: 0.84,
        preferred_input: 'voice',
        average_note_length: 'short',
        discipline_trajectory: 'improving',
        streak_sensitivity: 'high',
        goal: 'consistency',
        confidence_level: 3.2,
        model_updated_at: '2026-03-21T00:00:00Z',
        model_confidence: 0.82
    },
    diaryEntries: [],
    toasts: [],
    isCheckingAuth: true,
    isCaptureOpen: false,
    captureMode: 'none',
};

function perfectTraderReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
        case 'TOGGLE_LAB_MODE':
            return { ...state, labMode: !state.labMode };
        case 'SET_LAB_MODE':
            return { ...state, labMode: action.payload };
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'UPDATE_SESSION':
            return { ...state, session: { ...state.session, ...action.payload } };
        case 'ADD_TRADE':
            return {
                ...state,
                trades: [action.payload, ...state.trades],
                session: {
                    ...state.session,
                    tradesTaken: state.session.tradesTaken + 1,
                },
            };
        case 'UPDATE_TRADE':
            return {
                ...state,
                trades: state.trades.map((t) =>
                    t.id === action.payload.id ? action.payload : t
                ),
            };
        case 'REMOVE_TRADE': {
            const removed = state.trades.find((t) => t.id === action.payload);
            return {
                ...state,
                trades: state.trades.filter((t) => t.id !== action.payload),
                session: {
                    ...state.session,
                    tradesTaken: Math.max(
                        0,
                        state.session.tradesTaken - (removed ? 1 : 0)
                    ),
                },
            };
        }
        case 'TOGGLE_RULE_VIOLATION':
            return {
                ...state,
                rules: state.rules.map((r) =>
                    r.id === action.payload ? { ...r, violated: !r.violated } : r
                ),
            };
        case 'ADD_OBSERVATION':
            return {
                ...state,
                observations: [action.payload, ...state.observations],
            };
        case 'SET_EMOTIONAL_BASELINE':
            return {
                ...state,
                session: { ...state.session, emotionalBaseline: action.payload },
            };
        case 'COMPLETE_PRE_SESSION':
            return {
                ...state,
                session: { ...state.session, preSessionComplete: true },
            };
        case 'HYDRATE_STATE':
            return { 
                ...state, 
                ...action.payload, 
                isCheckingAuth: state.isCheckingAuth, // Preserve the ongoing auth check status
                labMode: false, 
                toasts: [] 
            };

        // New actions
        case 'ADD_RULE':
            return { ...state, rules: [...state.rules, action.payload] };

        case 'REMOVE_RULE':
            return { ...state, rules: state.rules.filter(r => r.id !== action.payload) };

        case 'TOGGLE_RULE_ACTIVE':
            return {
                ...state,
                rules: state.rules.map(r =>
                    r.id === action.payload ? { ...r, isActive: !r.isActive } : r
                ),
            };

        case 'ADD_RULE_FROM_LIBRARY': {
            const exists = state.rules.find(r => r.text === action.payload.text);
            if (exists) return state;
            return { ...state, rules: [...state.rules, action.payload] };
        }

        case 'LOG_DAILY': {
            const existingIdx = state.dailyLogs.findIndex(d => d.date === action.payload.date);
            if (existingIdx >= 0) {
                const updated = [...state.dailyLogs];
                updated[existingIdx] = action.payload;
                return { ...state, dailyLogs: updated };
            }
            return { ...state, dailyLogs: [...state.dailyLogs, action.payload] };
        }

        case 'SET_INSIGHTS':
            return { ...state, insights: action.payload };

        case 'SET_COACH_MESSAGES':
            return { ...state, coachMessages: action.payload };

        case 'REMOVE_COACH_MESSAGE':
            return { ...state, coachMessages: state.coachMessages.filter(m => m.id !== action.payload) };

        case 'ADD_RISK_ALERT':
            return { ...state, riskAlerts: [action.payload, ...state.riskAlerts].slice(0, 10) };

        case 'DISMISS_RISK_ALERT':
            return {
                ...state,
                riskAlerts: state.riskAlerts.filter((a) => a.timestamp !== action.payload),
            };

        case 'ADD_PLAYBOOK':
            return { ...state, playbooks: [...state.playbooks, action.payload] };

        case 'SET_MARKET_EVENTS':
            return { ...state, marketEvents: action.payload };

        case 'ADD_MARKET_EVENT':
            return { ...state, marketEvents: [...state.marketEvents, action.payload] };

        case 'SHOW_TOAST':
            return { ...state, toasts: [...state.toasts, action.payload] };

        case 'UPDATE_USER_MODEL':
            return { ...state, userModel: { ...state.userModel, ...action.payload } };

        case 'ADD_DIARY_ENTRY':
            return { ...state, diaryEntries: [action.payload, ...state.diaryEntries] };

        case 'UPDATE_DIARY_ENTRY':
            return { 
                ...state, 
                diaryEntries: state.diaryEntries.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e)
            };

        case 'DISMISS_TOAST':
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        
        case 'SET_CAPTURE_OPEN':
            return { ...state, isCaptureOpen: action.payload };
        
        case 'SET_CAPTURE_MODE':
            return { ...state, captureMode: action.payload };

        case 'LOCK_RULES':
            return { 
                ...state, 
                session: { ...state.session, rulesLocked: true } 
            };

        case 'SET_CHECKING_AUTH':
            return { ...state, isCheckingAuth: action.payload };
        
        case 'LOGOUT':
            return { ...initialState, isCheckingAuth: false, isCaptureOpen: false, captureMode: 'none' };
        
        default:
            return state;
    }
}

interface PerfectTraderContextType extends AppState {
    toggleSidebar: () => void;
    toggleLabMode: () => void;
    setLabMode: (val: boolean) => void;
    setUser: (user: User | null) => void;
    login: (email: string, name?: string) => void;
    logout: () => void;
    updateSession: (data: Partial<Session>) => void;
    addTrade: (trade: Trade) => void;
    updateTrade: (trade: Trade, changedFields?: string[]) => void;
    removeTrade: (tradeId: string) => void;
    toggleRuleViolation: (id: string) => void;
    addObservation: (obs: Observation) => void;
    setEmotionalBaseline: (em: BaselineState) => void;
    completePreSession: () => void;
    addRule: (rule: Rule) => void;
    removeRule: (id: string) => void;
    toggleRuleActive: (id: string) => void;
    addRuleFromLibrary: (rule: Rule) => void;
    logDaily: (log: DailyLog) => void;
    setInsights: (insights: PatternInsight[]) => void;
    setCoachMessages: (msgs: CoachMessage[]) => void;
    removeCoachMessage: (id: string) => void;
    addRiskAlert: (alert: RiskAlert) => void;
    dismissRiskAlert: (timestamp: string) => void;
    addPlaybook: (pb: Playbook) => void;
    setMarketEvents: (events: MarketEvent[]) => void;
    addMarketEvent: (event: MarketEvent) => void;
    updateUserModel: (model: Partial<UserModel>) => void;
    addDiaryEntry: (entry: DiaryEntry) => void;
    updateDiaryEntry: (entry: Partial<DiaryEntry> & { id: string }) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    dismissToast: (id: string) => void;
    isCheckingAuth: boolean;
    setCaptureOpen: (open: boolean) => void;
    setCaptureMode: (mode: 'initial' | 'note' | 'voice' | 'photo' | 'checklist' | 'none') => void;
    lockRules: () => void;
    showPreSessionCheck: boolean;
    openPreSessionCheck: () => void;
    closePreSessionCheck: () => void;
    editingTrade: Trade | null;
    openCaptureForEdit: (trade: Trade) => void;
    clearEditingTrade: () => void;
    refreshData: () => Promise<void>;
}

const PerfectTraderContext = createContext<PerfectTraderContextType | null>(null);

export function PerfectTraderProvider({
    children,
    initialUser = null,
    initialAuthUserId = null,
}: {
    children: ReactNode;
    initialUser?: User | null;
    initialAuthUserId?: string | null;
}) {
    const [showPreSessionCheck, setShowPreSessionCheck] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

    const [state, dispatch] = useReducer(perfectTraderReducer, {
        ...initialState,
        user: initialUser ?? initialState.user,
        isCheckingAuth: initialUser ? false : initialState.isCheckingAuth,
    });

    const supabase = useMemo(() => createClient(), []);
    const supabaseEnabled = isSupabaseConfigured();
    const authUserIdRef = useRef<string | null>(null);
    const skipCloudSaveRef = useRef(false);
    const lastActiveAtRef = useRef(Date.now());
    const sessionRestoredTrackedRef = useRef(false);

    useEffect(() => {
        const bump = () => {
            lastActiveAtRef.current = Date.now();
        };
        ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((e) =>
            window.addEventListener(e, bump, { passive: true })
        );
        return () => {
            ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((e) =>
                window.removeEventListener(e, bump)
            );
        };
    }, []);

    const hydrateFromStorage = () => {
        const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
        if (legacy && !localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, legacy);
        }
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.version === DATA_VERSION) {
                // With Supabase, never restore `user` from disk — only a live session counts.
                // Old tabs/incognito windows kept ghost users after OAuth glitches.
                const { user: _ghostUser, ...rest } = parsed;
                const payload = supabaseEnabled ? { ...rest, user: null } : parsed;
                dispatch({ type: 'HYDRATE_STATE', payload: { ...initialState, ...payload } });
            }
        } catch {
            /* ignore corrupt local cache */
        }
    };

    const hydrateFromCloud = async (userId: string) => {
        const cloud = await loadTraderData(supabase, userId);
        if (!cloud || cloud.version !== DATA_VERSION) return;
        skipCloudSaveRef.current = true;
        const { version: _v, ...rest } = cloud;
        dispatch({ type: 'HYDRATE_STATE', payload: { ...initialState, ...rest } as AppState });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, version: DATA_VERSION }));
        window.setTimeout(() => {
            skipCloudSaveRef.current = false;
        }, 0);
    };

    // Sync with Supabase Auth + cloud database
    useEffect(() => {
        let isMounted = true;

        const applySession = (userId: string | null, user: User | null) => {
            authUserIdRef.current = userId;
            if (user) {
                dispatch({ type: 'SET_USER', payload: user });
            } else if (supabaseEnabled) {
                dispatch({ type: 'SET_USER', payload: null });
            }
            if (userId && supabaseEnabled) {
                void hydrateFromCloud(userId);
            }
        };

        const syncUser = async () => {
            hydrateFromStorage();

            if (initialUser && initialAuthUserId && isMounted) {
                authUserIdRef.current = initialAuthUserId;
                applySession(initialAuthUserId, initialUser);
                if (!sessionRestoredTrackedRef.current) {
                    sessionRestoredTrackedRef.current = true;
                    track('session_restored', 'auth', {
                        was_offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
                    });
                }
                dispatch({ type: 'SET_CHECKING_AUTH', payload: false });
            }

            if (supabaseEnabled) {
                try {
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    if (authUser && isMounted) {
                        applySession(authUser.id, userFromAuthSession({ user: authUser }));
                        if (!sessionRestoredTrackedRef.current) {
                            sessionRestoredTrackedRef.current = true;
                            track('session_restored', 'auth', {
                                was_offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
                            });
                        }
                    }
                } catch (e) {
                    console.error('Auth check failed', e);
                }
            }

            if (isMounted) {
                dispatch({ type: 'SET_CHECKING_AUTH', payload: false });
            }
        };

        syncUser();

        const safetyValve = setTimeout(() => {
            if (isMounted) dispatch({ type: 'SET_CHECKING_AUTH', payload: false });
        }, 2000);

        let subscription: { unsubscribe: () => void } | null = null;
        if (supabaseEnabled) {
            const res = supabase.auth.onAuthStateChange((event, session) => {
                if (!isMounted) return;
                if (session?.user) {
                    applySession(session.user.id, userFromAuthSession(session));
                } else {
                    if (authUserIdRef.current && (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED')) {
                        track('session_expired', 'auth', {
                            last_active_ms_ago: Date.now() - lastActiveAtRef.current,
                        });
                    }
                    authUserIdRef.current = null;
                    dispatch({ type: 'SET_USER', payload: null });
                }
                dispatch({ type: 'SET_CHECKING_AUTH', payload: false });
            });
            subscription = res.data.subscription;
        }

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
            clearTimeout(safetyValve);
        };
    }, [supabase, supabaseEnabled, initialUser, initialAuthUserId]);

    // Persist to localStorage + Supabase (debounced)
    useEffect(() => {
        if (state === initialState) return;

        const { toasts, isCheckingAuth, ...persistable } = state;
        const payload = { ...persistable, version: DATA_VERSION };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

        const userId = authUserIdRef.current;
        if (!userId || !supabaseEnabled || skipCloudSaveRef.current) return;

        const timer = window.setTimeout(() => {
            const started = Date.now();
            track('cloud_sync_triggered', 'technical', {
                trigger_source: 'state_change',
                data_size_bytes: JSON.stringify(payload).length,
            });
            void saveTraderData(supabase, userId, payload).then((ok) => {
                if (ok) {
                    track('cloud_sync_completed', 'technical', {
                        latency_ms: Date.now() - started,
                        schema_version: DATA_VERSION,
                    });
                } else {
                    track('cloud_sync_failed', 'technical', { error_code: 'save_failed' });
                }
            });
        }, 1200);

        return () => window.clearTimeout(timer);
    }, [state, supabase, supabaseEnabled]);

    // Financial Impact Calculator (Cost of Indiscipline)
    useEffect(() => {
        if (state.trades.length > 0) {
            const cost = state.trades.reduce((acc, trade) => {
                // If any rules broken, add the loss (if pnl is negative) or absolute value if it's a "bad" win
                // For now, let's sum negative P&L on broken rule trades
                if (trade.rules_broken.length > 0 && trade.pnl && trade.pnl < 0) {
                    return acc + Math.abs(trade.pnl);
                }
                return acc;
            }, 0);

            if (cost !== state.analytics.indisciplineCost) {
                dispatch({ 
                    type: 'UPDATE_USER_MODEL', 
                    payload: { confidence_level: Math.max(0, 100 - (cost / 1000)) } as any // Secondary effect
                });
                // Note: We don't have a direct UPDATE_ANALYTICS yet, we'll patch it via UPDATE_USER_MODEL or similar for now or just let it be computed
                // Actually, let's just use it as a computed value in the UI or add a proper action.
            }
        }
    }, [state.trades]);

    const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
    const toggleLabMode = useCallback(() => dispatch({ type: 'TOGGLE_LAB_MODE' }), []);
    const setLabMode = useCallback((val: boolean) => dispatch({ type: 'SET_LAB_MODE', payload: val }), []);
    const setUser = useCallback((user: User | null) => dispatch({ type: 'SET_USER', payload: user }), []);

    const login = useCallback(async (email: string, name: string = 'Trader') => {
        // This is now reactive via onAuthStateChange
        // But we can keep it as a placeholder for manual overrides if needed
        console.log('Login initiated for', email);
    }, []);

    const logout = useCallback(async () => {
        track('logout_triggered', 'auth', {});
        try {
            await supabase.auth.signOut();
        } catch {
            /* invalid/expired session */
        }
        clearLocalAuthCache();
        dispatch({ type: 'LOGOUT' });
    }, [supabase]);

    const updateSession = useCallback((data: Partial<Session>) => dispatch({ type: 'UPDATE_SESSION', payload: data }), []);
    
    const addTrade = useCallback((trade: Trade) => {
        dispatch({ type: 'ADD_TRADE', payload: trade });

        track('trade_created', 'trades', {
            trade_id: trade.id,
            symbol: trade.pair,
            direction: trade.type,
            has_pnl: trade.pnl != null,
            has_emotion: Boolean(trade.emotion),
            rules_followed_count: trade.rules_followed?.length ?? 0,
            rules_broken_count: trade.rules_broken?.length ?? 0,
            session_date: trade.date,
            r_multiple: trade.pnlR ?? null,
            mood_before: trade.moodBefore ?? null,
            mood_after: trade.moodAfter ?? null,
            emotion: trade.emotion ?? null,
            entry_price: trade.entry ?? null,
            exit_price: trade.exit ?? null,
            planned_sl: trade.plannedSL ?? null,
            actual_sl: trade.actualSL ?? null,
        });

        // After trade is added, run Risk Sentinel
        // We use state.trades + new trade
        const newTrades = [trade, ...state.trades];
        const activeRules = state.rules.filter(r => r.isActive);
        const alerts = checkRisks(newTrades, activeRules, state.session.emotionalBaseline);
        
        // Update alerts in state
        alerts.forEach(alert => {
            dispatch({ type: 'ADD_RISK_ALERT', payload: alert });
        });

        const sessionDate = state.session.date || new Date().toISOString().split('T')[0];
        const violationCount = countSessionTradeViolations(newTrades, sessionDate);
        if (violationCount >= TILT_VIOLATION_THRESHOLD) {
            const alreadyTilt = state.riskAlerts.some((a) =>
                a.alert.toLowerCase().includes('violated')
            );
            if (!alreadyTilt) {
                const tiltAlert = buildTiltWarningAlert(violationCount);
                dispatch({ type: 'ADD_RISK_ALERT', payload: tiltAlert });
                track('risk_alert_shown', 'ai', {
                    severity: 'high',
                    alert_type: 'tilt_warning',
                    violation_count: violationCount,
                });
            }
        }
    }, [state.trades, state.rules, state.session.emotionalBaseline, state.session.date, state.riskAlerts]);

    const updateTrade = useCallback(
        (trade: Trade, changedFields: string[] = ['all']) => {
            dispatch({ type: 'UPDATE_TRADE', payload: trade });
            track('trade_edited', 'trades', {
                trade_id: trade.id,
                fields_changed: changedFields,
            });
        },
        []
    );

    const removeTrade = useCallback(
        (tradeId: string) => {
            const existing = state.trades.find((t) => t.id === tradeId);
            const tradeAgeHours = existing?.date
                ? Math.round(
                      (Date.now() - new Date(existing.date).getTime()) / (1000 * 60 * 60)
                  )
                : 0;
            dispatch({ type: 'REMOVE_TRADE', payload: tradeId });
            track('trade_deleted', 'trades', {
                trade_id: tradeId,
                trade_age_hours: tradeAgeHours,
            });
        },
        [state.trades]
    );

    const toggleRuleViolation = useCallback(
        (id: string) => {
            const rule = state.rules.find((r) => r.id === id);
            const willViolate = !rule?.violated;
            dispatch({ type: 'TOGGLE_RULE_VIOLATION', payload: id });
            if (willViolate) {
                track('rule_violated_flagged', 'rules', {
                    rule_id: id,
                    trade_id: null,
                    session_date: state.session.date,
                });
                const nextRules = state.rules.map((r) =>
                    r.id === id ? { ...r, violated: true } : r
                );
                const violationCount = countSessionViolations(nextRules, state.session.date);
                if (violationCount >= TILT_VIOLATION_THRESHOLD) {
                    dispatch({
                        type: 'ADD_RISK_ALERT',
                        payload: buildTiltWarningAlert(violationCount),
                    });
                    track('risk_alert_shown', 'ai', {
                        severity: 'high',
                        alert_type: 'tilt_warning',
                        violation_count: violationCount,
                    });
                }
            }
        },
        [state.rules, state.session.date]
    );
    const addObservation = useCallback((obs: Observation) => dispatch({ type: 'ADD_OBSERVATION', payload: obs }), []);
    const setEmotionalBaseline = useCallback((em: BaselineState) => dispatch({ type: 'SET_EMOTIONAL_BASELINE', payload: em }), []);
    const completePreSession = useCallback(() => {
        dispatch({ type: 'COMPLETE_PRE_SESSION' });
        setShowPreSessionCheck(false);
    }, []);

    const openPreSessionCheck = useCallback(() => setShowPreSessionCheck(true), []);
    const closePreSessionCheck = useCallback(() => setShowPreSessionCheck(false), []);

    const clearEditingTrade = useCallback(() => setEditingTrade(null), []);

    const openCaptureForEdit = useCallback((trade: Trade) => {
        setEditingTrade(trade);
        dispatch({ type: 'SET_CAPTURE_MODE', payload: 'checklist' });
        dispatch({ type: 'SET_CAPTURE_OPEN', payload: true });
    }, []);

    const refreshData = useCallback(async () => {
        hydrateFromStorage();
        const userId = authUserIdRef.current;
        if (userId && supabaseEnabled) {
            await hydrateFromCloud(userId);
        }
    }, [supabaseEnabled]);

    // New action dispatchers
    const addRule = useCallback((rule: Rule) => {
        dispatch({ type: 'ADD_RULE', payload: rule });
        track('rule_created', 'rules', {
            rule_id: rule.id,
            rule_category: rule.category ?? null,
            has_emoji: Boolean(rule.emoji),
            text_length: rule.text.length,
        });
    }, []);
    const removeRule = useCallback(
        (id: string) => {
            const rule = state.rules.find((r) => r.id === id);
            const tsMatch = rule?.id.match(/(\d{10,})/);
            const ruleAgeDays = tsMatch
                ? Math.round((Date.now() - Number(tsMatch[1])) / (1000 * 60 * 60 * 24))
                : 0;
            dispatch({ type: 'REMOVE_RULE', payload: id });
            track('rule_deleted', 'rules', {
                rule_id: id,
                rule_age_days: ruleAgeDays,
            });
        },
        [state.rules]
    );
    const toggleRuleActive = useCallback(
        (id: string) => {
            dispatch({ type: 'TOGGLE_RULE_ACTIVE', payload: id });
            track('rule_edited', 'rules', {
                rule_id: id,
                fields_changed: ['isActive'],
            });
        },
        []
    );
    const addRuleFromLibrary = useCallback((rule: Rule) => dispatch({ type: 'ADD_RULE_FROM_LIBRARY', payload: rule }), []);
    const logDaily = useCallback((log: DailyLog) => dispatch({ type: 'LOG_DAILY', payload: log }), []);
    const setInsights = useCallback((insights: PatternInsight[]) => dispatch({ type: 'SET_INSIGHTS', payload: insights }), []);
    const setCoachMessages = useCallback((msgs: CoachMessage[]) => dispatch({ type: 'SET_COACH_MESSAGES', payload: msgs }), []);
    const removeCoachMessage = useCallback((id: string) => dispatch({ type: 'REMOVE_COACH_MESSAGE', payload: id }), []);
    const addRiskAlert = useCallback((alert: RiskAlert) => dispatch({ type: 'ADD_RISK_ALERT', payload: alert }), []);
    const dismissRiskAlert = useCallback(
        (timestamp: string) => dispatch({ type: 'DISMISS_RISK_ALERT', payload: timestamp }),
        []
    );
    const addPlaybook = useCallback((pb: Playbook) => {
        dispatch({ type: 'ADD_PLAYBOOK', payload: pb });
        track('playbook_created', 'playbooks', {
            playbook_id: pb.id,
            rule_count: pb.rules.length,
        });
    }, []);
    const setMarketEvents = useCallback((events: MarketEvent[]) => dispatch({ type: 'SET_MARKET_EVENTS', payload: events }), []);
    const addMarketEvent = useCallback((event: MarketEvent) => dispatch({ type: 'ADD_MARKET_EVENT', payload: event }), []);
    const updateUserModel = useCallback((model: Partial<UserModel>) => dispatch({ type: 'UPDATE_USER_MODEL', payload: model }), []);
    const addDiaryEntry = useCallback((entry: DiaryEntry) => dispatch({ type: 'ADD_DIARY_ENTRY', payload: entry }), []);
    const updateDiaryEntry = useCallback((entry: Partial<DiaryEntry> & { id: string }) => dispatch({ type: 'UPDATE_DIARY_ENTRY', payload: entry }), []);
    const setCaptureOpen = useCallback((open: boolean) => dispatch({ type: 'SET_CAPTURE_OPEN', payload: open }), []);
    const setCaptureMode = useCallback((mode: 'initial' | 'note' | 'voice' | 'photo' | 'checklist' | 'none') => dispatch({ type: 'SET_CAPTURE_MODE', payload: mode }), []);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = `toast_${Date.now()}`;
        dispatch({ type: 'SHOW_TOAST', payload: { id, message, type } });
        setTimeout(() => dispatch({ type: 'DISMISS_TOAST', payload: id }), 3000);
    }, []);

    const dismissToast = useCallback((id: string) => dispatch({ type: 'DISMISS_TOAST', payload: id }), []);

    const value = {
        ...state,
        toggleSidebar,
        toggleLabMode,
        setLabMode,
        setUser,
        login,
        logout,
        updateSession,
        addTrade,
        updateTrade,
        removeTrade,
        toggleRuleViolation,
        addObservation,
        setEmotionalBaseline,
        completePreSession,
        addRule,
        removeRule,
        toggleRuleActive,
        addRuleFromLibrary,
        logDaily,
        setInsights,
        setCoachMessages,
        removeCoachMessage,
        addRiskAlert,
        dismissRiskAlert,
        addPlaybook,
        setMarketEvents,
        addMarketEvent,
        updateUserModel,
        addDiaryEntry,
        updateDiaryEntry,
        showToast,
        dismissToast,
        setCaptureOpen,
        setCaptureMode,
        lockRules: () => {
            track('rule_locked_for_session', 'rules', { session_date: state.session.date });
            dispatch({ type: 'LOCK_RULES' });
        },
        showPreSessionCheck,
        openPreSessionCheck,
        closePreSessionCheck,
        editingTrade,
        openCaptureForEdit,
        clearEditingTrade,
        refreshData,
    };

    return <PerfectTraderContext.Provider value={value}>{children}</PerfectTraderContext.Provider>;
}

export function usePerfectTrader() {
    const ctx = useContext(PerfectTraderContext);
    if (!ctx) throw new Error('usePerfectTrader must be used within PerfectTraderProvider');
    return ctx;
}
