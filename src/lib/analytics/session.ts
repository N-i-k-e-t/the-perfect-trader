const SESSION_KEY = 'pt_session_ctx';
const ANON_KEY = 'pt_anonymous_id';

export type SessionContext = {
    session_id: string;
    start_utc: string;
    start_ms: number;
    page_view_count: number;
    sequence: number;
};

function newSession(): SessionContext {
    return {
        session_id: crypto.randomUUID(),
        start_utc: new Date().toISOString(),
        start_ms: Date.now(),
        page_view_count: 0,
        sequence: 0,
    };
}

export function getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return 'server';
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(ANON_KEY, id);
    }
    return id;
}

export function getSessionContext(): SessionContext {
    if (typeof window === 'undefined') return newSession();
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) return JSON.parse(raw) as SessionContext;
    } catch {
        /* ignore */
    }
    const session = newSession();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

export function persistSessionContext(ctx: SessionContext): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ctx));
}

export function incrementPageView(): number {
    const ctx = getSessionContext();
    ctx.page_view_count += 1;
    persistSessionContext(ctx);
    return ctx.page_view_count;
}

export function nextEventSequence(): number {
    const ctx = getSessionContext();
    ctx.sequence += 1;
    persistSessionContext(ctx);
    return ctx.sequence;
}
