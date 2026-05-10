'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle, AlertCircle, Home } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function LoginPage() {
    const { login } = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || isSubmittingRef.current) return;

        setError('');
        setSuccess('');

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await login(formData);

            if (result.success) {
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    router.push(redirectUrl);
                } else {
                    router.push('/');
                }
            } else if (result.requiresVerification) {
                setSuccess(result.message || 'Please verify your email to continue.');
                localStorage.setItem('pendingVerificationEmail', formData.email);
                router.push('/auth/verify-email');
            } else {
                setError(result.error || 'Invalid email or password. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    return (
        <>
            <Metadata
                title="Sign In — HomelineTeam"
                description="Sign in to your HomelineTeam account to manage orders and wishlist."
                noIndex
            />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Brand header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors mb-6">
                            <Home className="w-4 h-4" aria-hidden="true" />
                            Back to HomelineTeam
                        </Link>
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                            <LogIn className="w-7 h-7 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
                        <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
                    </div>

                    {/* Card */}
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

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:text-primary-800 font-semibold transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none mt-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" aria-hidden="true" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/register" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
