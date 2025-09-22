'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Edit,
    Trash2,
    Plus,
    Package,
    RefreshCw,
    Settings,
    Shield,
    Bell,
    CheckCircle,
    XCircle,
    Save,
    Home,
    Building,
    MapPinIcon
} from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function ProfilePage() {
    const { user, isAuthenticated, loading: authLoading, updateProfile, addAddress, updateAddress, deleteAddress, logout } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        preferences: {
            newsletter: user?.preferences?.newsletter || true,
            smsNotifications: user?.preferences?.smsNotifications || true,
            emailNotifications: user?.preferences?.emailNotifications || true
        }
    });

    // Address form state
    const [addressForm, setAddressForm] = useState({
        type: 'home',
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false
    });
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Redirect if not authenticated (only after loading is complete)
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Show loading spinner while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        setLoading(true);

        try {
            const result = await updateProfile(profileForm);
            if (result.success) {
                setSuccess('Profile updated successfully!');
            } else {
                setError(result.error || 'Failed to update profile');
            }
        } catch (error) {
            setError('An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!addressForm.name || !addressForm.phone || !addressForm.address ||
            !addressForm.city || !addressForm.state || !addressForm.pincode) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            let result;
            if (editingAddress) {
                result = await updateAddress(editingAddress._id, addressForm);
            } else {
                result = await addAddress(addressForm);
            }

            if (result.success) {
                setSuccess(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
                setAddressForm({
                    type: 'home',
                    name: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: '',
                    isDefault: false
                });
                setEditingAddress(null);
                setShowAddressForm(false);
            } else {
                setError(result.error || 'Failed to save address');
            }
        } catch (error) {
            setError('An error occurred while saving address');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (address) => {
        setAddressForm({
            type: address.type,
            name: address.name,
            phone: address.phone,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            landmark: address.landmark || '',
            isDefault: address.isDefault
        });
        setEditingAddress(address);
        setShowAddressForm(true);
        setActiveTab('addresses');
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        setLoading(true);

        try {
            const result = await deleteAddress(addressId);
            if (result.success) {
                setSuccess('Address deleted successfully!');
            } else {
                setError(result.error || 'Failed to delete address');
            }
        } catch (error) {
            setError('An error occurred while deleting address');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <>
            <Metadata
                title="My Profile - HomeLine Teams"
                description="Manage your profile and addresses"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
                {/* Header Section */}
                <div className="inset- bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
                    <div className="container-custom py-12">
                        <div className="flex items-center gap-4 mb-6">
                            <Link
                                href="/"
                                className="group inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors duration-200"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                Back to Home
                            </Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div>
                                <h1 className="text-4xl font-bold mb-2">{user?.name}</h1>
                                <p className="text-blue-100 text-lg">{user?.email}</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-2 text-blue-100">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-sm">Verified Account</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-100">
                                        <Bell className="w-4 h-4" />
                                        <span className="text-sm">Notifications On</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-custom -mt-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Modern Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-8">
                                <nav className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'profile'
                                            ? 'btn-primary text-white shadow-lg shadow-primary-500/25'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                            }`}
                                    >
                                        <Settings className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500 group-hover:text-primary-500'}`} />
                                        <span className="font-medium">Profile Settings</span>
                                    </button>

                                    <Link
                                        href="/my-orders"
                                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 transition-all duration-200"
                                    >
                                        <Package className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                                        <span className="font-medium">My Orders</span>
                                    </Link>

                                    <Link
                                        href="/my-returns"
                                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 transition-all duration-200"
                                    >
                                        <RefreshCw className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                                        <span className="font-medium">My Returns</span>
                                    </Link>

                                    <button
                                        onClick={() => setActiveTab('addresses')}
                                        className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'addresses'
                                            ? 'btn-primary text-white shadow-lg shadow-primary-500/25'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                            }`}
                                    >
                                        <MapPin className={`w-5 h-5 ${activeTab === 'addresses' ? 'text-white' : 'text-gray-500 group-hover:text-primary-500'}`} />
                                        <span className="font-medium">Addresses</span>
                                    </button>

                                    <div className="border-t border-gray-200 my-4"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                                    >
                                        <XCircle className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
                                {/* Alert Messages */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
                                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <p className="text-red-700 font-medium">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <p className="text-green-700 font-medium">{success}</p>
                                    </div>
                                )}

                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 btn-primary rounded-xl flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                                                <p className="text-gray-600">Update your personal details and preferences</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleProfileSubmit} className="space-y-8">
                                            {/* Personal Information Card */}
                                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                                    <User className="w-5 h-5 text-primary-600" />
                                                    Personal Information
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Full Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.name}
                                                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Email Address
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="email"
                                                                value={user?.email || ''}
                                                                disabled
                                                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                                                            />
                                                            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Phone Number
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="tel"
                                                                value={profileForm.phone}
                                                                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                placeholder="Enter your phone number"
                                                            />
                                                            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Preferences Card */}
                                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                                    <Bell className="w-5 h-5 text-primary-600" />
                                                    Notification Preferences
                                                </h3>

                                                <div className="space-y-4">
                                                    <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors duration-200 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={profileForm.preferences.newsletter}
                                                            onChange={(e) => setProfileForm(prev => ({
                                                                ...prev,
                                                                preferences: { ...prev.preferences, newsletter: e.target.checked }
                                                            }))}
                                                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">Newsletter Subscription</p>
                                                            <p className="text-sm text-gray-600">Receive updates about new products and offers</p>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors duration-200 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={profileForm.preferences.smsNotifications}
                                                            onChange={(e) => setProfileForm(prev => ({
                                                                ...prev,
                                                                preferences: { ...prev.preferences, smsNotifications: e.target.checked }
                                                            }))}
                                                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">SMS Notifications</p>
                                                            <p className="text-sm text-gray-600">Get order updates via text message</p>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors duration-200 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={profileForm.preferences.emailNotifications}
                                                            onChange={(e) => setProfileForm(prev => ({
                                                                ...prev,
                                                                preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                                                            }))}
                                                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">Email Notifications</p>
                                                            <p className="text-sm text-gray-600">Receive important updates via email</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn-primary group relative px-8 py-3 font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                                >
                                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Addresses Tab */}
                                {activeTab === 'addresses' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 btn-primary rounded-xl flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">Addresses</h2>
                                                    <p className="text-gray-600">Manage your delivery addresses</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setShowAddressForm(true);
                                                    setEditingAddress(null);
                                                    setAddressForm({
                                                        type: 'home',
                                                        name: '',
                                                        phone: '',
                                                        address: '',
                                                        city: '',
                                                        state: '',
                                                        pincode: '',
                                                        landmark: '',
                                                        isDefault: false
                                                    });
                                                }}
                                                className="btn-primary group relative px-6 py-3 font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                                Add Address
                                            </button>
                                        </div>

                                        {/* Address Form */}
                                        {showAddressForm && (
                                            <div className="mb-8 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-6 border border-secondary-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                                    {editingAddress ? <Edit className="w-5 h-5 text-primary-600" /> : <Plus className="w-5 h-5 text-primary-600" />}
                                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                                </h3>

                                                <form onSubmit={handleAddressSubmit} className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                Address Type
                                                            </label>
                                                            <select
                                                                value={addressForm.type}
                                                                onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                            >
                                                                <option value="home">🏠 Home</option>
                                                                <option value="work">🏢 Work</option>
                                                                <option value="other">📍 Other</option>
                                                            </select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                Full Name *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={addressForm.name}
                                                                onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                placeholder="Enter full name"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                Phone Number *
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                value={addressForm.phone}
                                                                onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                placeholder="Enter phone number"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                Pincode *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={addressForm.pincode}
                                                                onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                placeholder="Enter pincode"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Street Address *
                                                        </label>
                                                        <textarea
                                                            value={addressForm.address}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                            rows="3"
                                                            placeholder="Enter street address"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                City *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={addressForm.city}
                                                                onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                placeholder="Enter city"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                State *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={addressForm.state}
                                                                onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                placeholder="Enter state"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Landmark (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.landmark}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                            placeholder="Enter landmark"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={addressForm.isDefault}
                                                            onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">Set as default address</p>
                                                            <p className="text-sm text-gray-600">This will be used as your primary delivery address</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end space-x-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowAddressForm(false);
                                                                setEditingAddress(null);
                                                            }}
                                                            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="btn-primary group relative px-6 py-3 font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                                        >
                                                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                                            {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* Existing Addresses */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Saved Addresses</h3>
                                            {user?.addresses && user.addresses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {user.addresses.map((address, index) => (
                                                        <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 transition-all duration-200 hover:shadow-lg">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    {address.type === 'home' ? (
                                                                        <Home className="w-6 h-6 text-primary-600" />
                                                                    ) : address.type === 'work' ? (
                                                                        <Building className="w-6 h-6 text-primary-600" />
                                                                    ) : (
                                                                        <MapPinIcon className="w-6 h-6 text-primary-600" />
                                                                    )}
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 capitalize">
                                                                            {address.type}
                                                                        </h4>
                                                                        {address.isDefault && (
                                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                                                                                Default
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditAddress(address)}
                                                                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                                                                        title="Edit address"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAddress(address._id)}
                                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                                        title="Delete address"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="font-medium text-gray-900">
                                                                    {address.name}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {address.phone}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {address.address}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {address.city}, {address.state} - {address.pincode}
                                                                </p>
                                                                {address.landmark && (
                                                                    <p className="text-sm text-gray-500">
                                                                        Landmark: {address.landmark}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved yet</h3>
                                                    <p className="text-gray-600 mb-6">Add your first address to get started</p>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddressForm(true);
                                                            setEditingAddress(null);
                                                            setAddressForm({
                                                                type: 'home',
                                                                name: '',
                                                                phone: '',
                                                                address: '',
                                                                city: '',
                                                                state: '',
                                                                pincode: '',
                                                                landmark: '',
                                                                isDefault: false
                                                            });
                                                        }}
                                                        className="btn-primary group relative px-6 py-3 font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                                                    >
                                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                                        Add Your First Address
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
