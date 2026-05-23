'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { usePerfectTrader } from '@/lib/context';
import { useModalTracking } from '@/lib/analytics';
import { formatAuthError } from '@/lib/auth-errors';
import {
    getAuthLinkStatus,
    oauthProviderLabel,
    setAccountPassword,
    validateNewPassword,
} from '@/lib/auth-password';

interface SetPasswordSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SetPasswordSheet({ isOpen, onClose }: SetPasswordSheetProps) {
    const { showToast } = usePerfectTrader();
    useModalTracking('set_password_sheet', isOpen);
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [linkStatus, setLinkStatus] = useState<ReturnType<typeof getAuthLinkStatus> | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(true);

        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setLinkStatus(getAuthLinkStatus(user));
            setLoading(false);
        })();
    }, [isOpen, supabase]);

    const handleSave = async () => {
        const validation = validateNewPassword(newPassword, confirmPassword);
        if (validation) {
            showToast(validation, 'error');
            return;
        }

        setSaving(true);
        const result = await setAccountPassword(supabase, {
            newPassword,
            currentPassword: linkStatus?.hasEmailPassword ? currentPassword : undefined,
        });
        setSaving(false);

        if (!result.ok) {
            const formatted = formatAuthError(result.message);
            showToast(formatted.title, 'error');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        setLinkStatus(getAuthLinkStatus(user));
        showToast(
            linkStatus?.hasEmailPassword
                ? 'Password updated. You can sign in with email and password.'
                : 'Password set. You can now sign in with your email and this password.',
            'success'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    const isSetMode = linkStatus && !linkStatus.hasEmailPassword;
    const oauthLabel = linkStatus ? oauthProviderLabel(linkStatus.oauthProviders) : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[210] flex items-end justify-center sm:items-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#1a1a2e] text-white rounded-lg flex items-center justify-center">
                                    <Lock size={18} />
                                </div>
                                <h2 className="text-[17px] font-black text-[#1a1a2e]">
                                    {isSetMode ? 'Set password' : 'Change password'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center text-gray-300 bg-gray-50 rounded-full"
                            >
                                <X size={18} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-[#1a1a2e]" size={28} />
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/60">
                                        <p className="text-[13px] font-bold text-blue-900 leading-relaxed">
                                            {isSetMode && linkStatus?.signedUpWithOAuth ? (
                                                <>
                                                    You signed up with <strong>{oauthLabel}</strong>. You do not need a
                                                    password for that — but you can add one here to also sign in with{' '}
                                                    <strong>{linkStatus.email}</strong> and a password on the login page.
                                                </>
                                            ) : isSetMode ? (
                                                <>
                                                    Add a password so you can sign in with{' '}
                                                    <strong>{linkStatus?.email}</strong> and a password.
                                                </>
                                            ) : (
                                                <>
                                                    Update your password for <strong>{linkStatus?.email}</strong>. Google
                                                    and GitHub sign-in still work if you linked those accounts.
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {linkStatus?.email && (
                                        <div className="flex items-center gap-3 px-1">
                                            <ShieldCheck size={18} className="text-green-600 shrink-0" />
                                            <span className="text-[13px] font-bold text-gray-500">
                                                Login email: <span className="text-[#1a1a2e]">{linkStatus.email}</span>
                                            </span>
                                        </div>
                                    )}

                                    {!linkStatus?.hasEmailPassword && (
                                        <PasswordField
                                            label="New password"
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            show={showNew}
                                            onToggle={() => setShowNew((v) => !v)}
                                            placeholder="At least 8 characters"
                                        />
                                    )}

                                    {linkStatus?.hasEmailPassword && (
                                        <>
                                            <PasswordField
                                                label="Current password"
                                                value={currentPassword}
                                                onChange={setCurrentPassword}
                                                show={showCurrent}
                                                onToggle={() => setShowCurrent((v) => !v)}
                                                placeholder="Your existing password"
                                            />
                                            <PasswordField
                                                label="New password"
                                                value={newPassword}
                                                onChange={setNewPassword}
                                                show={showNew}
                                                onToggle={() => setShowNew((v) => !v)}
                                                placeholder="At least 8 characters"
                                            />
                                        </>
                                    )}

                                    <PasswordField
                                        label="Confirm password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        show={showConfirm}
                                        onToggle={() => setShowConfirm((v) => !v)}
                                        placeholder="Repeat new password"
                                    />

                                    <button
                                        type="button"
                                        disabled={saving || !linkStatus?.email}
                                        onClick={handleSave}
                                        className="w-full h-14 bg-[#1a1a2e] text-white font-black rounded-[20px] flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
                                    >
                                        {saving ? (
                                            <Loader2 className="animate-spin" size={22} />
                                        ) : isSetMode ? (
                                            'Save password'
                                        ) : (
                                            'Update password'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    autoComplete={label.includes('Current') ? 'current-password' : 'new-password'}
                    placeholder={placeholder}
                    className="w-full h-[56px] bg-gray-50 border-2 border-transparent rounded-[18px] px-5 pr-14 text-[16px] font-bold text-[#1a1a2e] focus:bg-white focus:border-blue-500/20 outline-none"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-0 top-0 h-[56px] w-14 flex items-center justify-center text-gray-300"
                >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
}
