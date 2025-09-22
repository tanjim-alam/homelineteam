'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, LogIn, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function LoginPage() {
    const { login } = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading || isSubmittingRef.current) {
            return;
        }

        setError('');
        setSuccess('');

        // Validation
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await login(formData);

            if (result.success) {
                // Check for redirect URL after login
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    router.push(redirectUrl);
                } else {
                    // Redirect to home page
                    router.push('/');
                }
            } else if (result.requiresVerification) {
                // User needs to verify email, redirect to verification page
                if (result.developmentOTP) {
                    setSuccess(`${result.message} Development OTP: ${result.developmentOTP}`);
                } else {
                    setSuccess(result.message);
                }
                // Store email for verification
                localStorage.setItem('pendingVerificationEmail', formData.email);
                // Redirect to verification page
                router.push('/auth/verify-email');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    return (
        <>
            <Metadata
                title="Sign In - HomeLine Teams"
                description="Sign in to your HomeLine Teams account"
            />
            <div className=" bg-gradient-to-br from-gray-50 via-white to-blue-50">

                <div className="container-custom py-32">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">

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

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter your password"
                                            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-200"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || isSubmittingRef.current}
                                    className="btn-primary w-full py-3 px-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                            href="/auth/register"
                                            className="text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-200"
                                        >
                                            Create Account
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
