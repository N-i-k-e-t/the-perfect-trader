'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClearStuckSessionLink from '@/components/auth/ClearStuckSessionLink';

function ErrorContent() {
    const params = useSearchParams();
    const error = params.get('error');
    const description = params.get('description');

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-8 bg-white text-center max-w-md mx-auto">
            <h1 className="text-2xl font-black text-red-600 mb-4">Authentication error</h1>
            <p className="text-gray-600 mb-4">Something went wrong during sign-in.</p>
            {error && (
                <code className="bg-gray-100 px-3 py-2 rounded text-sm mb-2 text-left w-full break-all">
                    {error}
                </code>
            )}
            {description && <p className="text-gray-500 text-sm mb-6">{description}</p>}
            {(error?.toLowerCase().includes('pkce') ||
                error?.toLowerCase().includes('verifier') ||
                error?.toLowerCase().includes('bad_oauth_state') ||
                error?.toLowerCase().includes('no_code')) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-[12px] font-bold text-gray-800 mb-4 leading-relaxed">
                    <p className="font-black mb-2">Old tab / incognito stuck?</p>
                    <p>
                        Close every incognito window, open a new one, or clear this browser&apos;s session below.
                        Chrome keeps the same incognito storage until all incognito windows are closed.
                    </p>
                </div>
            )}
            {(error?.toLowerCase().includes('github') ||
                description?.toLowerCase().includes('github')) &&
                !error?.toLowerCase().includes('google') && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-[12px] font-bold text-amber-900 mb-4 leading-relaxed">
                    <p className="font-black mb-2">GitHub tip</p>
                    <p>Callback URL on GitHub OAuth app:</p>
                    <code className="block text-[10px] mt-1 mb-2 break-all">
                        https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
                    </code>
                    <p>Regenerate Client Secret on GitHub → paste into Supabase → GitHub.</p>
                </div>
            )}
            {(error?.toLowerCase().includes('google') ||
                error?.toLowerCase().includes('redirect_uri') ||
                description?.toLowerCase().includes('google') ||
                description?.toLowerCase().includes('access_denied')) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-[12px] font-bold text-blue-900 mb-4 leading-relaxed">
                    <p className="font-black mb-2">Google tip (GitHub works)</p>
                    <p>1. Google Cloud → Credentials → Authorized redirect URI:</p>
                    <code className="block text-[10px] mt-1 mb-2 break-all">
                        https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
                    </code>
                    <p>2. Client secret must start with GOCSPX- — paste into Supabase → Google (not Client ID).</p>
                    <p>3. OAuth consent screen → Test users → add your Gmail.</p>
                    <p className="mt-2 text-[11px]">See docs/supabase/GOOGLE_OAUTH_FIX.md</p>
                </div>
            )}
            <Link
                href="/signup"
                className="w-full h-12 bg-[#1a1a2e] text-white font-black rounded-xl flex items-center justify-center mb-3"
            >
                Try again
            </Link>
            <div className="mt-4 w-full flex flex-col items-center gap-3">
                <ClearStuckSessionLink
                    className="w-full h-11 border-2 border-gray-200 text-[#1a1a2e] font-black rounded-xl text-[12px] hover:bg-gray-50"
                    label="Clear stuck session & try again"
                />
                <Link href="/login" className="text-blue-600 font-bold text-sm">
                    Go to login
                </Link>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[100dvh] flex items-center justify-center bg-white">Loading…</div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}
