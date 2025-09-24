'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function RegisterPage() {
    const { register, verifyEmail, resendEmailOTP } = useUser();
    const router = useRouter();
    const [step, setStep] = useState('register'); // 'register' or 'verify'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
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
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        // Phone validation (basic)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
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
            const result = await register(formData);
            if (result.success) {
                if (result.developmentOTP) {
                    setSuccess(`Registration successful! Development OTP: ${result.developmentOTP}`);
                } else {
                    setSuccess('Registration successful! Please check your email for verification OTP.');
                }
                setStep('verify');
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (error) {
            setError('An error occurred during registration');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading || isSubmittingRef.current) {
            return;
        }

        setError('');
        setSuccess('');

        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await verifyEmail(formData.email, otp);
            if (result.success) {
                setSuccess('Email verified successfully! Redirecting to home page...');
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (error) {
            setError('An error occurred during verification');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleResendOTP = async () => {
        // Prevent double submission
        if (loading || isSubmittingRef.current) {
            return;
        }

        setError('');
        setSuccess('');

        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await resendEmailOTP(formData.email);
            if (result.success) {
                setSuccess('OTP sent successfully! Please check your email.');
            } else {
                setError(result.error || 'Failed to resend OTP');
            }
        } catch (error) {
            setError('An error occurred while resending OTP');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    if (step === 'verify') {
        return (
            <>
                <Metadata
                    title="Verify Email - HomeLine Teams"
                    description="Verify your email address to complete registration"
                />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">


                    <div className="container-custom py-12">
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
                                        disabled={loading || isSubmittingRef.current}
                                        className="btn-primary w-full py-3 px-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-5 h-5" />
                                                Verify Email
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={loading || isSubmittingRef.current}
                                            className="text-primary-600 hover:text-primary-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Metadata
                title="Create Account - HomeLine Teams"
                description="Create your account to start shopping with HomeLine Teams"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">

                <div className="container-custom py-12">
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
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                            required
                                        />
                                    </div>
                                </div>

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
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter your phone number"
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm your password"
                                            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || isSubmittingRef.current}
                                    className="btn-primary cursor-pointer w-full py-3 px-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Create Account
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            href="/auth/login"
                                            className="text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-200"
                                        >
                                            Sign In
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
