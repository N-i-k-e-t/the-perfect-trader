import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase-data';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase-env';
import { getPostAuthPath } from '@/lib/auth-routes';

const PROTECTED_PREFIXES = [
    '/today',
    '/onboarding',
    '/settings',
    '/journal',
    '/diary',
    '/calendar',
    '/rules',
    '/stats',
    '/api-keys',
    '/dashboard',
    '/admin',
];

const AUTH_PAGES = ['/login', '/signup'];

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    if (!isSupabaseConfigured()) {
        return supabaseResponse;
    }

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // getUser() validates the JWT — do not use getSession() here
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (!user && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.startsWith('/onboarding') ? '/signup' : '/login';
        url.searchParams.set('redirectedFrom', pathname);
        return NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
        const dest = getPostAuthPath(user);
        return NextResponse.redirect(new URL(dest, request.url));
    }

    supabaseResponse.headers.set('Cache-Control', 'private, no-store');
    return supabaseResponse;
}
