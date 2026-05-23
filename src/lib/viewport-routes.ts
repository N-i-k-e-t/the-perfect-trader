/** Routes that use the centered mobile phone frame (PWA shell) on all viewports. */
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
    '/login',
    '/signup',
    '/api-keys',
    '/the-terminal-x',
]);

const PHONE_FRAME_PREFIXES = ['/journal/', '/auth/'];

/** Marketing, legal, and product pages render full-width on desktop. */
export function isPhoneFrameRoute(pathname: string): boolean {
    if (!pathname) return false;
    if (PHONE_FRAME_ROUTES.has(pathname)) return true;
    return PHONE_FRAME_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
