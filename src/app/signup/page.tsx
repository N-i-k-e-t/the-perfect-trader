'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import { fetchBetaCapacity, type BetaCapacity } from '@/lib/beta-capacity';
import { formatAuthError } from '@/lib/auth-errors';
import { userFromSupabaseAuthUser } from '@/lib/auth-user';
import { oauthCallbackUrl, type OAuthProvider } from '@/lib/auth-routes';
import { getOAuthSignInOptions } from '@/lib/auth-oauth';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { track } from '@/lib/analytics';
import ClearStuckSessionLink from '@/components/auth/ClearStuckSessionLink';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Sparkles, Check, AlertCircle, ChevronDown } from 'lucide-react';

export default function SignupPage() {
    const { showToast, setUser } = usePerfectTrader();
    const router = useRouter();
    const supabase = createClient();
    const [showPassword, setShowPassword] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
    const [capacity, setCapacity] = useState<BetaCapacity | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [authBanner, setAuthBanner] = useState<{ title: string; hint: string } | null>(null);
    const checkingSession = useRedirectIfAuthenticated(setUser);

    useEffect(() => {
        setOauthLoading(null);
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'session') {
            showToast('Sign-in did not complete. Please try Google again.', 'error');
            window.history.replaceState({}, '', '/signup');
        }
    }, [showToast]);

    useEffect(() => {
        fetchBetaCapacity().then((c) => {
            setCapacity(c);
            if (c.full) router.replace('/beta/full');
        });
    }, [router]);

    const strength = useMemo(() => {
        const pass = formData.password;
        if (!pass) return { score: 0, color: 'bg-gray-100' };

        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { score, color: 'bg-red-500' };
        if (score <= 3) return { score, color: 'bg-blue-400' };
        return { score, color: 'bg-green-500' };
    }, [formData.password]);

    const ensureSlot = async (): Promise<boolean> => {
        const c = await fetchBetaCapacity();
        setCapacity(c);
        if (c.full) {
            router.push('/beta/full');
            return false;
        }
        return true;
    };

    const requireTerms = (): boolean => {
        if (!termsAccepted) {
            showToast('Please accept the Terms & Conditions first', 'info');
            return false;
        }
        return true;
    };

    const handleSocialSignup = async (provider: OAuthProvider) => {
        if (!requireTerms()) return;
        if (!(await ensureSlot())) return;

        setAuthBanner(null);
        setOauthLoading(provider);
        track('signup_started', 'auth', { method: provider });
        track('oauth_redirect_initiated', 'auth', { provider });
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: getOAuthSignInOptions(provider),
            });
            if (error) throw error;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Social signup failed';
            track('signup_failed', 'auth', { method: provider, error_message: msg.slice(0, 120) });
            const formatted = formatAuthError(msg);
            setAuthBanner(formatted);
            showToast(formatted.title, 'error');
            setOauthLoading(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requireTerms()) return;
        if (!(await ensureSlot())) return;

        if (formData.password.length < 8) {
            showToast('Password too short (min 8 chars)', 'error');
            return;
        }

        setIsLoading(true);
        setAuthBanner(null);
        track('signup_started', 'auth', { method: 'email' });

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { full_name: formData.name },
                    emailRedirectTo: oauthCallbackUrl(),
                },
            });

            if (error) throw error;

            if (data.session?.user) {
                track('signup_completed', 'auth', {
                    method: 'email',
                    has_display_name: Boolean(formData.name),
                });
                setUser(userFromSupabaseAuthUser(data.session.user));
                showToast('Account created! Welcome to The Perfect Trader.', 'success');
                router.replace('/onboarding');
                return;
            }
            if (data.user) {
                showToast('Check your email to confirm, then sign in with email.', 'info');
                router.push('/login?pending=email');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed';
            const formatted = formatAuthError(msg);
            setAuthBanner(formatted);
            showToast(formatted.title, 'error');
            setIsLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-[100dvh] bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
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
            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-100/30 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-100/30 blur-[100px] rounded-full" />

            <div className="absolute top-12 left-0 right-0 flex justify-center z-20" style={{ top: 'max(env(safe-area-inset-top), 48px)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-1 bg-[#1a1a2e] rounded-full" />
                    <div className="w-8 h-1 bg-gray-100 rounded-full" />
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] ml-2">Step 1 of 2</span>
                </div>
            </div>

            <div className="w-full max-w-[400px] flex flex-col pt-16 relative z-10">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[18px] flex items-center justify-center mb-6 shadow-inner">
                        <Sparkles size={24} />
                    </div>
                    <h1 className="text-[34px] font-black text-[#1a1a2e] mb-1 tracking-tighter leading-none">Create Account.</h1>
                    <p className="text-[15px] font-bold text-gray-400 mt-2 max-w-[300px]">
                        Start with Google or GitHub — no password needed.
                    </p>
                    {capacity && !capacity.full && (
                        <p className="text-[12px] font-black text-yellow-600 mt-3 uppercase tracking-wider">
                            {capacity.remaining} of {capacity.max} beta spots left
                        </p>
                    )}
                </div>

                {authBanner && (
                    <div className="mb-6 p-5 rounded-[24px] border-2 border-amber-200 bg-amber-50 flex gap-3 text-left">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={22} />
                        <div>
                            <p className="text-[14px] font-black text-amber-900">{authBanner.title}</p>
                            <p className="text-[12px] font-bold text-amber-800/80 mt-1 leading-relaxed">{authBanner.hint}</p>
                        </div>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-gray-50 overflow-hidden"
                >
                    <div className="p-10 pb-4 flex flex-col gap-6">
                        <div className="flex items-start gap-3 px-1">
                            <button
                                type="button"
                                onClick={() => setTermsAccepted(!termsAccepted)}
                                className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                                    termsAccepted ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white' : 'bg-gray-50 border-gray-100'
                                }`}
                            >
                                {termsAccepted && <Check size={14} strokeWidth={4} />}
                            </button>
                            <span className="text-[11px] font-bold text-gray-400 leading-tight uppercase tracking-wider">
                                I accept the <Link href="/terms" className="text-[#1a1a2e] underline">Terms</Link> &{' '}
                                <Link href="/privacy" className="text-[#1a1a2e] underline">Privacy</Link>
                            </span>
                        </div>

                        <SocialAuthButtons
                            mode="signup"
                            onGoogle={() => handleSocialSignup('google')}
                            onGithub={() => handleSocialSignup('github')}
                            disabled={!termsAccepted}
                            loadingProvider={oauthLoading}
                        />
                    </div>

                    <div className="px-10 pb-4">
                        <button
                            type="button"
                            onClick={() => setShowEmailForm((v) => !v)}
                            className="w-full flex items-center justify-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] py-2"
                        >
                            {showEmailForm ? 'Hide email signup' : 'Or sign up with email & password'}
                            <ChevronDown size={16} className={`transition-transform ${showEmailForm ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showEmailForm && (
                        <form onSubmit={handleSubmit} className="px-10 pb-10 flex flex-col gap-5 border-t border-gray-50 pt-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Your Name</label>
                                <input
                                    type="text"
                                    placeholder="Your trading alias"
                                    className="w-full h-[60px] bg-gray-50/50 border-2 border-transparent rounded-[20px] px-6 text-[16px] font-bold text-[#1a1a2e] focus:bg-white focus:border-blue-500/20 transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Email</label>
                                <input
                                    type="email"
                                    placeholder="you@email.com"
                                    className="w-full h-[60px] bg-gray-50/50 border-2 border-transparent rounded-[20px] px-6 text-[16px] font-bold text-[#1a1a2e] focus:bg-white focus:border-blue-500/20 transition-all outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
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
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-[60px] w-16 flex items-center justify-center text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                    </button>
                                </div>
                                {formData.password && (
                                    <div className="mt-2 px-1">
                                        <div className="flex gap-1.5 mb-2">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`h-1 flex-1 rounded-full transition-all ${
                                                        step <= strength.score ? strength.color : 'bg-gray-100'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                disabled={isLoading || !termsAccepted}
                                className="w-full h-[60px] bg-[#1a1a2e] text-white font-black rounded-[20px] flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Create account with email'}
                            </button>
                        </form>
                    )}
                </motion.div>

                <p className="mt-12 text-center text-[15px] font-bold text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 font-black border-b-2 border-blue-600/10 pb-1">
                        Log In
                    </Link>
                </p>
                <p className="mt-4 text-center">
                    <ClearStuckSessionLink />
                </p>
            </div>
        </div>
    );
}
