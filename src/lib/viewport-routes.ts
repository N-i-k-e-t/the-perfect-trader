/** Auth & pre-app flows — centered panel on desktop. */
const AUTH_FLOW_ROUTES = new Set([
    '/login',
    '/signup',
    '/onboarding',
    '/welcome',
    '/dashboard',
]);

/** Routes that use the centered mobile phone frame (PWA shell) below md breakpoint. */
const PHONE_FRAME_ROUTES = new Set([
    '/today',
    '/rules',
    '/journal',
    '/stats',
    '/calendar',
    '/diary',
    '/settings',
    '/admin',
    '/onboarding',
    '/dashboard',
    '/welcome',
    '/api-keys',
    '/the-terminal-x',
]);

const PHONE_FRAME_PREFIXES = ['/journal/', '/auth/'];

/** Marketing, legal, and product pages render full-width on desktop. */
export function isPhoneFrameRoute(pathname: string): boolean {
    if (!pathname) return false;
    if (PHONE_FRAME_ROUTES.has(pathname)) return true;
    if (AUTH_FLOW_ROUTES.has(pathname)) return true;
    return PHONE_FRAME_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthFlowRoute(pathname: string): boolean {
    if (!pathname) return false;
    if (AUTH_FLOW_ROUTES.has(pathname)) return true;
    return pathname.startsWith('/auth/');
}
