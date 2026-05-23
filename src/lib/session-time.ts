/** Rough local-hour gate for post-session UI (4pm default session end). */
export function isAfterSessionEnd(hourEnd = 16): boolean {
    return new Date().getHours() >= hourEnd;
}
