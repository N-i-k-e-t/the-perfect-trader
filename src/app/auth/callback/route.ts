import { NextResponse, type NextRequest } from 'next/server';
import { getPostAuthPath } from '@/lib/auth-routes';
import { createRouteHandlerClient, redirectBase } from '@/utils/supabase/route-handler';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const base = redirectBase(request);

    if (oauthError) {
        console.error('[auth/callback] OAuth error:', oauthError, errorDescription);
        return NextResponse.redirect(
            `${base}/auth/auth-code-error?error=${encodeURIComponent(oauthError)}&description=${encodeURIComponent(errorDescription ?? '')}`
        );
    }

    if (!code) {
        console.error('[auth/callback] No code in URL');
        return NextResponse.redirect(`${base}/auth/auth-code-error?error=no_code`);
    }

    const { supabase, applySessionCookiesTo } = createRouteHandlerClient(request);
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.session?.user) {
        console.error('[auth/callback] exchangeCodeForSession:', exchangeError?.message);
        return NextResponse.redirect(
            `${base}/auth/auth-code-error?error=${encodeURIComponent(exchangeError?.message ?? 'exchange_failed')}`
        );
    }

    const next = getPostAuthPath(data.session.user);
    return applySessionCookiesTo(NextResponse.redirect(`${base}${next}`));
}
