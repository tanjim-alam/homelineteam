'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Shield, CheckCircle, AlertCircle, Home, ArrowLeft } from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function RegisterPage() {
    const { register, verifyEmail, resendEmailOTP } = useUser();
    const router = useRouter();
    const [step, setStep] = useState('register');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('All fields are required');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit Indian phone number');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await register(formData);
            if (result.success) {
                setSuccess('Account created! Please check your email for the verification code.');
                setStep('verify');
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        if (loading || isSubmittingRef.current) return;

        setError('');
        setSuccess('');

        if (!otp) { setError('Please enter the verification code'); return; }
        if (otp.length !== 6) { setError('Please enter a valid 6-digit code'); return; }

        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await verifyEmail(formData.email, otp);
            if (result.success) {
                setSuccess('Email verified! Redirecting to home...');
                setTimeout(() => router.push('/'), 1500);
            } else {
                setError(result.error || 'Verification failed. Please check the code.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleResendOTP = async () => {
        if (loading || isSubmittingRef.current) return;
        setError('');
        setSuccess('');
        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const result = await resendEmailOTP(formData.email);
            if (result.success) {
                setSuccess('Verification code resent! Please check your email.');
            } else {
                setError(result.error || 'Failed to resend code. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    /* ── OTP Verification Step ─────────────────────────────────────────── */
    if (step === 'verify') {
        return (
            <>
                <Metadata title="Verify Email — HomelineTeam" description="Verify your email to complete registration." noIndex />
                <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                                <Shield className="w-7 h-7 text-white" aria-hidden="true" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900">Verify your email</h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                We sent a 6-digit code to{' '}
                                <span className="font-semibold text-gray-800">{formData.email}</span>
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">
                            {error && (
                                <div role="alert" className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                                    <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-primary-700 text-sm font-medium">{error}</p>
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
                                    <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Verification Code
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                            if (error) setError('');
                                        }}
                                        placeholder="• • • • • •"
                                        className="w-full py-4 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-bold text-gray-800 transition-all"
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-center">Enter the 6-digit code from your email</p>
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
                                    <button
                                        type="button"
                                        onClick={() => setStep('register')}
                                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                        Change email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="text-primary-600 hover:text-primary-800 font-semibold disabled:opacity-50 transition-colors"
                                    >
                                        Resend code
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    /* ── Registration Step ─────────────────────────────────────────────── */
    return (
        <>
            <Metadata title="Create Account — HomelineTeam" description="Create your HomelineTeam account to shop premium home furnishings." noIndex />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors mb-6">
                            <Home className="w-4 h-4" aria-hidden="true" />
                            Back to HomelineTeam
                        </Link>
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                            <UserPlus className="w-7 h-7 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
                        <p className="text-gray-500 mt-1 text-sm">Join HomelineTeam to shop premium home furnishings</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-8">

                        {error && (
                            <div role="alert" className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                                <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-primary-700 text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div role="status" className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-green-700 text-sm font-medium">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your full name"
                                        autoComplete="name"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="reg-email"
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

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        autoComplete="tel"
                                        maxLength={10}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Min. 6 characters"
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 text-sm transition-all"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
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
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" aria-hidden="true" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-primary-600 hover:text-primary-800 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
