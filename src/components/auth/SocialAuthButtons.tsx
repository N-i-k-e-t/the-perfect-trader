'use client';

import { Loader2 } from 'lucide-react';
import type { OAuthProvider } from '@/lib/auth-routes';

type Props = {
    mode: 'signup' | 'login';
    onGoogle: () => void;
    onGithub: () => void;
    disabled?: boolean;
    loadingProvider?: OAuthProvider | null;
};

export default function SocialAuthButtons({ mode, onGoogle, onGithub, disabled, loadingProvider }: Props) {
    const label = mode === 'signup' ? 'Sign up' : 'Continue';

    return (
        <div className="flex flex-col gap-3">
            <p className="text-center text-[11px] font-bold text-gray-500 leading-relaxed px-2">
                {mode === 'signup'
                    ? 'Fastest way in — no password to create.'
                    : 'Signed up with Google or GitHub? Use the same button — no password.'}
            </p>
            <button
                type="button"
                disabled={disabled || !!loadingProvider}
                onClick={onGoogle}
                className="w-full h-[60px] bg-white border-2 border-[#f3f4f6] rounded-lg flex items-center justify-center gap-3 text-[15px] font-semibold text-[#111827] active:scale-[0.98] shadow-sm"
                aria-label={`${label} with Google`}
            >
                {loadingProvider === 'google' ? (
                    <Loader2 className="animate-spin" size={22} />
                ) : (
                    <>
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                        {label} with Google
                    </>
                )}
            </button>
            <button
                type="button"
                disabled={disabled || !!loadingProvider}
                onClick={onGithub}
                className="w-full h-[60px] bg-white border-2 border-[#f3f4f6] rounded-lg flex items-center justify-center gap-3 text-[15px] font-semibold text-[#111827] active:scale-[0.98] shadow-sm"
                aria-label={`${label} with GitHub`}
            >
                {loadingProvider === 'github' ? (
                    <Loader2 className="animate-spin" size={22} />
                ) : (
                    <>
                        <img src="https://github.com/favicon.ico" className="w-5 h-5" alt="" />
                        {label} with GitHub
                    </>
                )}
            </button>
        </div>
    );
}
