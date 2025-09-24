'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Mail, Key, CheckCircle } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function ForgotPasswordPage() {
    const { forgotPassword, resetPassword } = useUser();
    const [step, setStep] = useState('request'); // 'request' or 'reset'
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Email is required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const result = await forgotPassword(email);
            if (result.success) {
                setSuccess('Password reset token sent to your email. Please check your inbox.');
                setStep('reset');
            } else {
                setError(result.error || 'Failed to send reset token');
            }
        } catch (error) {
            setError('An error occurred while sending reset token');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (token.length !== 6) {
            setError('Please enter a valid 6-digit reset code');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const result = await resetPassword(email, token, newPassword);
            if (result.success) {
                setSuccess('Password reset successfully! You can now sign in with your new password.');
                setTimeout(() => {
                    window.location.href = '/auth/login';
                }, 3000);
            } else {
                setError(result.error || 'Password reset failed');
            }
        } catch (error) {
            setError('An error occurred while resetting password');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'reset') {
        return (
            <>
                <Metadata
                    title="Reset Password - HomeLine Teams"
                    description="Reset your password using the token sent to your email"
                />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Key className="w-8 h-8 text-primary-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                                <p className="text-gray-600">
                                    Enter the reset token sent to<br />
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

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reset Code (6 digits)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => {
                                                // Only allow numbers and limit to 6 digits
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setToken(value);
                                            }}
                                            placeholder="Enter 6-digit code from email"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest transition-all duration-200 text-gray-700"
                                            maxLength="6"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep('request')}
                                        className="text-gray-600 hover:text-gray-800 text-sm"
                                    >
                                        ← Back to Request Reset
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Metadata
                title="Forgot Password - HomeLine Teams"
                description="Reset your password if you've forgotten it"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                            <p className="text-gray-600">
                                No worries! Enter your email and we'll send you a reset token.
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

                        <form onSubmit={handleRequestReset} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary cursor-pointer py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
                            >
                                {loading ? 'Sending...' : 'Send Reset Token'}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-primary-600 hover:text-primary-800 text-sm font-semibold transition-colors duration-200"
                                >
                                    ← Back to Sign In
                                </Link>
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Home
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
