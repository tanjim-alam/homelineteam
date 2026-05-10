'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Mail, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function VerifyEmailPage() {
    const { verifyEmail, resendEmailOTP } = useUser();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (pendingEmail) {
            setEmail(pendingEmail);
        } else {
            router.replace('/auth/login');
        }
    }, [router]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const devOTP = urlParams.get('devOTP');
        if (devOTP) {
            setSuccess(`Development mode — OTP: ${devOTP}`);
        }
    }, []);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        if (!otp) { setError('Please enter the verification code'); return; }
        if (otp.length !== 6) { setError('Please enter the full 6-digit code'); return; }

        setLoading(true);
        setError('');

        try {
            const result = await verifyEmail(email, otp);
            if (result.success) {
                setSuccess('Email verified successfully! Redirecting...');
                localStorage.removeItem('pendingVerificationEmail');
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                const dest = redirectUrl || '/';
                if (redirectUrl) localStorage.removeItem('redirectAfterLogin');
                setTimeout(() => router.push(dest), 1500);
            } else {
                setError(result.error || 'Invalid or expired code. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) { setError('Email not found. Please go back and log in again.'); return; }
        setResending(true);
        setError('');
        setSuccess('');

        try {
            const result = await resendEmailOTP(email);
            if (result.success) {
                setSuccess('Verification code resent! Please check your email.');
            } else {
                setError(result.error || 'Failed to resend code. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            <Metadata title="Verify Email — HomelineTeam" description="Verify your email address to access your account." noIndex />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                            <Mail className="w-7 h-7 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Verify your email</h1>
                        {email && (
                            <p className="text-gray-500 mt-1 text-sm">
                                We sent a 6-digit code to{' '}
                                <span className="font-semibold text-gray-800">{email}</span>
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">
                        {error && (
                            <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div role="status" className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-green-700 text-sm font-medium">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleVerifyEmail} className="space-y-5" noValidate>
                            <div>
                                <label htmlFor="verify-otp" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Verification Code
                                </label>
                                <input
                                    id="verify-otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError(''); }}
                                    placeholder="• • • • • •"
                                    className="w-full py-4 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-bold text-gray-800 transition-all"
                                    maxLength={6}
                                    inputMode="numeric"
                                    autoFocus
                                    autoComplete="one-time-code"
                                />
                                <p className="text-xs text-gray-400 mt-2 text-center">Enter the 6-digit code sent to your email</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4" aria-hidden="true" />
                                        Verify Email
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <Link href="/auth/login" className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 font-medium transition-colors">
                                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                    Back to login
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resending || loading}
                                    className="text-primary-600 hover:text-primary-800 font-semibold disabled:opacity-50 transition-colors"
                                >
                                    {resending ? 'Sending...' : 'Resend code'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
