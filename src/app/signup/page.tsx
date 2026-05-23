'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePerfectTrader } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase-data';
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
import AppScreenLayout from '@/components/layout/AppScreenLayout';

export default function SignupPage() {
    const { showToast, setUser } = usePerfectTrader();
    const router = useRouter();
    const supabase = createClient();
    const [showPassword, setShowPassword] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(true);
    const [emailPendingConfirmation, setEmailPendingConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
    const [capacity, setCapacity] = useState<BetaCapacity | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [authBanner, setAuthBanner] = useState<{ title: string; hint: string } | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
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
        if (!pass) return { score: 0, color: 'bg-gray-100', label: '' };

        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 1) return { score, color: 'bg-[#ef4444]', label: 'Weak' };
        if (score === 2) return { score, color: 'bg-[#f59e0b]', label: 'Fair' };
        if (score === 3) return { score, color: 'bg-[#84cc16]', label: 'Good' };
        return { score, color: 'bg-[#10b981]', label: 'Strong' };
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

    const handleResendConfirmation = async () => {
        const email = formData.email.trim().toLowerCase();
        if (!email) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: { emailRedirectTo: oauthCallbackUrl() },
            });
            if (error) throw error;
            showToast('Confirmation email sent again', 'success');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not resend email';
            showToast(formatAuthError(msg).title, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setAuthBanner(null);

        if (!isSupabaseConfigured()) {
            showToast('Authentication not configured', 'error');
            return;
        }
        if (!requireTerms()) return;
        if (!(await ensureSlot())) return;

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        let hasError = false;

        if (!name) {
            setNameError('Name is required');
            hasError = true;
        }

        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Invalid email format');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError('Password too short (min 8 characters)');
            hasError = true;
        }

        if (hasError) return;

        setIsLoading(true);
        setEmailPendingConfirmation(false);
        track('signup_started', 'auth', { method: 'email' });

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: oauthCallbackUrl(),
                },
            });

            if (error) throw error;

            if (data.session?.user) {
                track('signup_completed', 'auth', {
                    method: 'email',
                    has_display_name: Boolean(name),
                });
                setUser(userFromSupabaseAuthUser(data.session.user));
                showToast('Account created! Welcome to The Perfect Trader.', 'success');
                router.replace('/onboarding');
                return;
            }

            if (data.user) {
                track('signup_completed', 'auth', {
                    method: 'email',
                    has_display_name: Boolean(name),
                    email_confirmation_required: true,
                });
                setEmailPendingConfirmation(true);
                setAuthBanner({
                    title: 'Confirm your email to continue',
                    hint: `We sent a link to ${email}. Open it, then sign in below. Check spam if you do not see it.`,
                });
                showToast('Check your email for the confirmation link', 'info');
                return;
            }

            setAuthBanner({
                title: 'Signup did not complete',
                hint: 'Try again, or use Google / GitHub above.',
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed';
            const formatted = formatAuthError(msg);
            
            if (msg.toLowerCase().includes('already in use') || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
                setEmailError('Email already in use');
            } else {
                setAuthBanner(formatted);
                showToast(formatted.title, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <AppScreenLayout>
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            </AppScreenLayout>
        );
    }

    return (
        <AppScreenLayout>
        <div
            className="min-h-[100dvh] md:min-h-0 flex flex-col items-center justify-center px-6 selection:bg-blue-100 relative overflow-hidden"
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
                    <h1 className="text-[34px] font-black text-[#1a1a2e] mb-1 tracking-tighter leading-none">Start trading with discipline.</h1>
                    <p className="text-[15px] font-bold text-gray-400 mt-2 max-w-[300px]">
                        Google or GitHub skips to onboarding. Email signup uses a secure password.
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
                        <SocialAuthButtons
                            mode="signup"
                            onGoogle={() => handleSocialSignup('google')}
                            onGithub={() => handleSocialSignup('github')}
                            disabled={!termsAccepted}
                            loadingProvider={oauthLoading}
                        />
                        <div className="flex items-start gap-3 px-1">
                            <button
                                type="button"
                                onClick={() => setTermsAccepted(!termsAccepted)}
                                className={`min-w-[44px] min-h-[44px] rounded-md border-2 shrink-0 flex items-center justify-center ${
                                    termsAccepted ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white' : 'bg-[#f3f4f6] border-[#f3f4f6]'
                                }`}
                            >
                                {termsAccepted && <Check size={14} strokeWidth={4} />}
                            </button>
                            <span className="text-[12px] font-medium text-[#6b7280] leading-snug">
                                I accept the <Link href="/terms" className="text-[#111827] underline">Terms</Link> &{' '}
                                <Link href="/privacy" className="text-[#111827] underline">Privacy</Link>
                            </span>
                        </div>
                    </div>

                    <div className="px-10 pb-4">
                        <button
                            type="button"
                            onClick={() => setShowEmailForm((v) => !v)}
                            className="w-full flex items-center justify-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] py-2"
                        >
                            {showEmailForm ? 'Hide email signup' : 'Or sign up with email & password'}
                            <ChevronDown size={16} className={` ${showEmailForm ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {emailPendingConfirmation && authBanner && (
                        <div className="mx-10 mb-4 p-5 rounded-[24px] border-2 border-blue-200 bg-blue-50 flex flex-col gap-3 text-left">
                            <p className="text-[14px] font-black text-blue-900">{authBanner.title}</p>
                            <p className="text-[12px] font-bold text-blue-800/80 leading-relaxed">{authBanner.hint}</p>
                            <button
                                type="button"
                                onClick={handleResendConfirmation}
                                disabled={isLoading}
                                className="h-11 rounded-xl bg-blue-600 text-white font-black text-[12px] uppercase tracking-wider"
                            >
                                Resend confirmation email
                            </button>
                            <Link
                                href="/login?pending=email"
                                className="text-center text-[13px] font-black text-blue-700 underline"
                            >
                                Go to login after confirming →
                            </Link>
                        </div>
                    )}

                    {showEmailForm && !emailPendingConfirmation && (
                        <form onSubmit={handleSubmit} className="px-10 pb-10 flex flex-col gap-5 border-t border-gray-50 pt-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Your Name</label>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Your trading alias"
                                    className={`w-full h-[60px] border-2 rounded-lg px-6 text-[16px] font-bold outline-none ${
                                        nameError
                                            ? 'border-red-400 bg-red-50 focus:bg-white focus:border-red-400'
                                            : 'border-transparent bg-gray-50/50 text-[#1a1a2e] focus:bg-white focus:border-blue-500/20'
                                    }`}
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (nameError) setNameError(null);
                                    }}
                                    required
                                />
                                {nameError && (
                                    <p className="text-sm text-red-500 ml-1">{nameError}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Email</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@email.com"
                                    className={`w-full h-[60px] border-2 rounded-lg px-6 text-[16px] font-bold outline-none ${
                                        emailError
                                            ? 'border-red-400 bg-red-50 focus:bg-white focus:border-red-400'
                                            : 'border-transparent bg-gray-50/50 text-[#1a1a2e] focus:bg-white focus:border-blue-500/20'
                                    }`}
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (emailError) setEmailError(null);
                                    }}
                                    required
                                />
                                {emailError && (
                                    <p className="text-sm text-red-500 ml-1">{emailError}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-[#1a1a2e] ml-1 uppercase tracking-[0.2em] opacity-30">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className={`w-full h-[60px] border-2 rounded-lg px-6 text-[16px] font-bold pr-16 outline-none ${
                                            passwordError
                                                ? 'border-red-400 bg-red-50 focus:bg-white focus:border-red-400'
                                                : 'border-transparent bg-gray-50/50 text-[#1a1a2e] focus:bg-white focus:border-blue-500/20'
                                        }`}
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value });
                                            if (passwordError) setPasswordError(null);
                                        }}
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
                                {passwordError && (
                                    <p className="text-sm text-red-500 ml-1">{passwordError}</p>
                                )}
                                {formData.password && (
                                    <div className="mt-2 px-1">
                                        <div className="flex gap-1.5 mb-2">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`h-1 flex-1 rounded-full ${
                                                        step <= strength.score ? strength.color : 'bg-gray-100'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                            {strength.label}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!termsAccepted && (
                                <p className="text-[12px] font-bold text-amber-700 text-center">
                                    Accept Terms &amp; Privacy above to enable signup.
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading || !termsAccepted}
                                className="w-full h-[60px] btn-primary font-black rounded-lg flex items-center justify-center gap-2"
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
        </AppScreenLayout>
    );
}
