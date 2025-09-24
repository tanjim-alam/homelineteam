'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function VerifyEmailPage() {
    const { verifyEmail, resendEmailOTP } = useUser();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Get email from localStorage (set during login)
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (pendingEmail) {
            setEmail(pendingEmail);
            setSuccess('Please check your email for the verification code.');
        } else {
            // If no pending email, redirect to login
            router.push('/auth/login');
        }
    }, [router]);

    // Check for development OTP in URL params or localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const devOTP = urlParams.get('devOTP');
        if (devOTP) {
            setSuccess(`Development OTP: ${devOTP}`);
        }
    }, []);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        if (!otp) {
            setError('Please enter the verification code');
            return;
        }

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await verifyEmail(email, otp);
            if (result.success) {
                setSuccess('Email verified successfully! Redirecting...');
                // Clear the pending email
                localStorage.removeItem('pendingVerificationEmail');
                // Check for redirect URL after verification
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    setTimeout(() => {
                        router.push(redirectUrl);
                    }, 2000);
                } else {
                    // Redirect to home page
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                }
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (error) {
            setError('An error occurred during verification');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            setError('Email not found. Please try logging in again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await resendEmailOTP(email);
            if (result.success) {
                setSuccess('Verification code sent successfully! Please check your email.');
            } else {
                setError(result.error || 'Failed to resend verification code');
            }
        } catch (error) {
            setError('An error occurred while resending verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Metadata
                title="Verify Email - HomeLine Teams"
                description="Verify your email address to complete login"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                            <p className="text-gray-600">
                                We've sent a verification code to<br />
                                <span className="font-semibold text-gray-900">{email}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <p className="text-green-700 font-medium">{success}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleVerifyEmail} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Enter Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            // Only allow numbers and limit to 6 digits
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtp(value);
                                        }}
                                        placeholder="Enter 6-digit code"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest transition-all duration-200 text-gray-700"
                                        maxLength="6"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 cursor-pointer px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-primary-600 cursor-pointer hover:text-primary-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Resend Code
                                </button>
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-primary-600 hover:text-primary-800 text-sm font-semibold transition-colors duration-200"
                                >
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
