'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase-data';
import { formatAuthError } from '@/lib/auth-errors';
import { userFromSupabaseAuthUser } from '@/lib/auth-user';
import { getPostAuthPath, type OAuthProvider } from '@/lib/auth-routes';
import { getOAuthSignInOptions } from '@/lib/auth-oauth';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { track } from '@/lib/analytics';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import ClearStuckSessionLink from '@/components/auth/ClearStuckSessionLink';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Target, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';

export default function LoginPage() {
    const { showToast, setUser } = usePerfectTrader();
    const router = useRouter();
    const supabase = createClient();

    const [showPassword, setShowPassword] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [localStats, setLocalStats] = useState<{ streak: number; score: number } | null>(null);
    const isPlaceholderAuth = !isSupabaseConfigured();
    const checkingSession = useRedirectIfAuthenticated(setUser);

    useEffect(() => {
        const savedData = localStorage.getItem('perfect_trader_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const streak = parsed.analytics?.consistencyDays || 0;
                const score = parsed.analytics?.ruleAdherence || 0;
                if (streak > 0 || score > 0) {
                    setLocalStats({ streak, score: Math.round(score) });
                }
            } catch {
                /* ignore */
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('clear') === '1') {
            router.replace('/auth/reset');
            return;
        }
        if (params.get('pending') === 'email') {
            showToast('Confirm your email, then sign in with email below.', 'info');
            setShowEmailForm(true);
        }
        if (params.get('error') === 'auth_callback') {
            const reason = params.get('reason');
            const msg = reason
                ? decodeURIComponent(reason.replace(/\+/g, ' '))
                : 'OAuth sign-in failed. Try Google or GitHub again.';
            const formatted = formatAuthError(msg);
            showToast(formatted.title, 'error');
            window.history.replaceState({}, '', '/login');
        }
    }, [showToast]);

    const handleSocialLogin = async (provider: OAuthProvider) => {
        if (isPlaceholderAuth) {
            showToast('Authentication not configured', 'error');
            return;
        }
        setOauthLoading(provider);
        track('oauth_redirect_initiated', 'auth', { provider });
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: getOAuthSignInOptions(provider),
            });
            if (error) throw error;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'OAuth failed';
            track('login_failed', 'auth', { method: provider, error_message: msg.slice(0, 120) });
            showToast(formatAuthError(msg).title, 'error');
            setOauthLoading(null);
        }
    };

    const handlePasswordReset = async () => {
        if (!formData.email) {
            showToast('Enter your email first', 'info');
            return;
        }
        if (isPlaceholderAuth) {
            showToast('Authentication not configured', 'error');
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (error) throw error;
            track('password_reset_requested', 'auth', {});
            showToast('Password reset email sent', 'success');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Reset failed';
            showToast(formatAuthError(msg).title, 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isPlaceholderAuth) {
            showToast('Authentication not configured', 'error');
            return;
        }

        if (!formData.email || !formData.password) {
            showToast('Enter email and password', 'info');
            return;
        }

        setIsLoading(true);
        track('login_started', 'auth', { method: 'email' });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            if (data.user) {
                track('login_completed', 'auth', { method: 'email', is_returning_user: true });
                setUser(userFromSupabaseAuthUser(data.user));
                showToast('Welcome back!', 'success');
                router.replace(getPostAuthPath(data.user));
                router.refresh();
                return;
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Verification failed';
            const code =
                err && typeof err === 'object' && 'code' in err
                    ? String((err as { code?: string }).code)
                    : undefined;
            track('login_failed', 'auth', {
                method: 'email',
                error_code: code ?? null,
                error_message: msg.slice(0, 120),
            });
            const formatted = formatAuthError(msg);
            showToast(formatted.title, 'error');
            setIsLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-[100dvh] bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-[#1a1a2e]" size={32} />
            </div>
        );
    }

    return (
        <div
            className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6 selection:bg-blue-100 relative overflow-hidden"
            style={{
                paddingTop: 'env(safe-area-inset-top, 24px)',
                paddingBottom: 'env(safe-area-inset-bottom, 24px)',
            }}
        >
            <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-100/30 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-100/30 blur-[100px] rounded-full" />

            <Link
                href="/"
                className="absolute top-8 left-6 flex items-center gap-1.5 text-[14px] font-black text-gray-300 active:opacity-60 transition-opacity touch-manipulation z-10"
                style={{ top: 'max(env(safe-area-inset-top), 32px)' }}
            >
                <ArrowLeft size={16} strokeWidth={3} />
                Back
            </Link>

            <div className="w-full max-w-[400px] flex flex-col pt-12 relative z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-[#1a1a2e] text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-100/50 mb-8 border border-white/10">
                        <Target size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-[34px] font-black text-[#1a1a2e] mb-1 tracking-tighter leading-none">Welcome Back.</h1>
                    <p className="text-[15px] font-bold text-gray-400 mt-2 text-center max-w-[280px]">
                        Continue with Google or GitHub — the same way you signed up.
                    </p>
                </div>

                <AnimatePresence>
                    {localStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-100 rounded-[32px] p-6 mb-8 flex items-center gap-5 shadow-xl shadow-gray-100/50"
                        >
                            <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white text-2xl">🔥</div>
                            <div className="flex flex-col">
                                <span className="text-[17px] font-black text-[#1a1a2e]">{localStats.streak}-day streak detected.</span>
                                <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{localStats.score}% Adherence</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-gray-50 overflow-hidden"
                >
                    <div className="p-10 pb-6">
                        <SocialAuthButtons
                            mode="login"
                            onGoogle={() => handleSocialLogin('google')}
                            onGithub={() => handleSocialLogin('github')}
                            loadingProvider={oauthLoading}
                        />
                    </div>

                    <div className="px-10 pb-4">
                        <button
                            type="button"
                            onClick={() => setShowEmailForm((v) => !v)}
                            className="w-full flex items-center justify-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] py-2 active:opacity-60"
                        >
                            {showEmailForm ? 'Hide email sign-in' : 'Sign in with email & password instead'}
                            <ChevronDown size={16} className={`transition-transform ${showEmailForm ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showEmailForm && (
                        <form onSubmit={handleSubmit} className="px-10 pb-10 flex flex-col gap-5 border-t border-gray-50 pt-6">
                            <p className="text-[11px] font-bold text-gray-400 text-center leading-relaxed">
                                For email signup, or if you added a password in Settings after signing up with Google or GitHub.
                            </p>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Email</label>
                                <input
                                    type="email"
                                    inputMode="email"
                                    placeholder="you@email.com"
                                    className="w-full h-[60px] bg-gray-50/50 border-2 border-transparent rounded-[20px] px-6 text-[16px] font-bold text-[#1a1a2e] focus:bg-white focus:border-blue-500/20 transition-all outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full h-[60px] bg-gray-50/50 border-2 border-transparent rounded-[20px] px-6 text-[16px] font-bold text-[#1a1a2e] pr-16 focus:bg-white focus:border-blue-500/20 transition-all outline-none"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-[60px] w-16 flex items-center justify-center text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="text-[12px] font-bold text-blue-600 text-center"
                            >
                                Forgot password?
                            </button>
                            <button
                                disabled={isLoading}
                                className="w-full h-[60px] bg-[#1a1a2e] text-white font-black rounded-[20px] flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Log in with email'}
                            </button>
                        </form>
                    )}
                </motion.div>

                <p className="mt-12 text-center text-[15px] font-bold text-gray-400">
                    New here?{' '}
                    <Link href="/signup" className="text-blue-600 font-black border-b-2 border-blue-600/10 pb-1">
                        Create Account
                    </Link>
                </p>
                <p className="mt-4 text-center">
                    <ClearStuckSessionLink />
                </p>
            </div>
        </div>
    );
}
