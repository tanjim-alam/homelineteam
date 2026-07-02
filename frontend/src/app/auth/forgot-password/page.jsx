'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Mail, Key, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function ForgotPasswordPage() {
    const { forgotPassword, resetPassword } = useUser();
    const router = useRouter();
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) { setError('Email address is required'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const result = await forgotPassword(email);
            if (result.success) {
                setSuccess('Reset code sent! Please check your email inbox.');
                setStep('reset');
            } else {
                setError(result.error || 'No account found with this email address.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token || !newPassword || !confirmPassword) { setError('All fields are required'); return; }
        if (token.length !== 6) { setError('Please enter the 6-digit reset code from your email'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            const result = await resetPassword(email, token, newPassword);
            if (result.success) {
                setSuccess('Password reset successfully! Redirecting to sign in...');
                setTimeout(() => router.push('/auth/login'), 2000);
            } else {
                setError(result.error || 'Invalid or expired reset code. Please request a new one.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const Alert = ({ type, message }) => (
        <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl p-4 mb-6 ${type === 'error' ? 'bg-sky-50 border border-sky-200' : 'bg-green-50 border border-green-200'}`}>
            {type === 'error'
                ? <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                : <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />}
            <p className={`text-sm font-medium ${type === 'error' ? 'text-sky-700' : 'text-green-700'}`}>{message}</p>
        </div>
    );

    /* ── Reset Password Step ───────────────────────────────────────────── */
    if (step === 'reset') {
        return (
            <>
                <Metadata title="Reset Password — HomelineTeam" description="Set a new password for your HomelineTeam account." noIndex />
                <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                                <Key className="w-7 h-7 text-white" aria-hidden="true" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900">Set new password</h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Enter the code sent to{' '}
                                <span className="font-semibold text-gray-800">{email}</span>
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">
                            {error && <Alert type="error" message={error} />}
                            {success && <Alert type="success" message={success} />}

                            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                                <div>
                                    <label htmlFor="reset-token" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Reset Code (6 digits)
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                        <input
                                            id="reset-token"
                                            type="text"
                                            value={token}
                                            onChange={(e) => { setToken(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError(''); }}
                                            placeholder="Enter 6-digit code"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-xl tracking-widest font-bold text-gray-800 text-sm transition-all"
                                            maxLength={6}
                                            inputMode="numeric"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                        <input
                                            id="new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirm-new-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                        <input
                                            id="confirm-new-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                                            Resetting...
                                        </>
                                    ) : 'Reset Password'}
                                </button>

                                <button type="button" onClick={() => setStep('request')} className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1">
                                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                    Request new code
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    /* ── Request Reset Step ────────────────────────────────────────────── */
    return (
        <>
            <Metadata title="Forgot Password — HomelineTeam" description="Reset your HomelineTeam account password." noIndex />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                            <Mail className="w-7 h-7 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Forgot your password?</h1>
                        <p className="text-gray-500 mt-1 text-sm">Enter your email and we&apos;ll send you a reset code</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">
                        {error && <Alert type="error" message={error} />}
                        {success && <Alert type="success" message={success} />}

                        <form onSubmit={handleRequestReset} className="space-y-5" noValidate>
                            <div>
                                <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" aria-hidden="true" />
                                        Send Reset Code
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center justify-center mt-6">
                            <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors">
                                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
