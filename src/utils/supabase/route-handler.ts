import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase-env';

type PendingCookie = { name: string; value: string; options: CookieOptions };

/** Supabase client for Route Handlers — copies session cookies onto redirect responses. */
export function createRouteHandlerClient(request: NextRequest) {
    let response = NextResponse.next({ request });
    const pendingCookies: PendingCookie[] = [];

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    pendingCookies.push({ name, value, options });
                    request.cookies.set(name, value);
                    response = NextResponse.next({ request });
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    return {
        supabase,
        applySessionCookiesTo(redirect: NextResponse) {
            pendingCookies.forEach(({ name, value, options }) => {
                redirect.cookies.set(name, value, options);
            });
            return redirect;
        },
    };
}

export function redirectBase(request: NextRequest): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl && process.env.NODE_ENV === 'production') {
        return siteUrl.replace(/\/$/, '');
    }
    const { origin } = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocal = process.env.NODE_ENV === 'development';
    if (!isLocal && forwardedHost) {
        return `https://${forwardedHost}`;
    }
    return origin;
}
