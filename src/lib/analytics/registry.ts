export type TrackingSnapshot = {
    userId: string | null;
    isBeta: boolean;
    isPro: boolean;
    isAdmin: boolean;
    ruleCount: number;
    tradeCountToday: number;
    hasActiveSession: boolean;
};

let snapshot: TrackingSnapshot = {
    userId: null,
    isBeta: true,
    isPro: false,
    isAdmin: false,
    ruleCount: 0,
    tradeCountToday: 0,
    hasActiveSession: false,
};

export function setTrackingSnapshot(partial: Partial<TrackingSnapshot>): void {
    snapshot = { ...snapshot, ...partial };
}

export function getTrackingSnapshot(): TrackingSnapshot {
    return snapshot;
}

export function getActiveSessionFlag(): boolean {
    return snapshot.hasActiveSession;
}

export function getRuleCount(): number {
    return snapshot.ruleCount;
}

export function getTodayTradeCount(): number {
    return snapshot.tradeCountToday;
}
