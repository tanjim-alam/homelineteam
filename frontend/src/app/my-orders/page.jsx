'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import api from '@/services/api';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, RefreshCw, ShoppingBag, Truck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function MyOrdersPage() {
    const { user, isAuthenticated, loading: authLoading } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUserOrders();
        }
    }, [isAuthenticated, user]);

    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            const response = await api.getUserOrders(user.id);
            if (response.success) {
                setOrders(response.orders || []);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (error) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Show loading spinner while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
                <div className="container-custom">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
                        <p className="text-gray-600 mb-8 text-lg">
                            Please sign in to view your orders.
                        </p>
                        <Link
                            href="/"
                            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header Section */}
            <div className="inset-0 bg-primary text-white">
                <div className="container-custom py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Home
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
                            <p className="text-white/80 text-lg">Track and manage your orders</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading orders...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
                        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                        </p>
                        <Link
                            href="/collections"
                            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200"
                        >
                            <Package className="w-5 h-5" />
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300">
                                {/* Order Header */}
                                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                                <Package className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Order #{order.orderNumber}
                                                </h3>
                                                <p className="text-gray-600 flex items-center gap-2 mt-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                <CreditCard className="w-4 h-4" />
                                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                            <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">Items Ordered</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                                                {item.image && (
                                                    <div className="relative">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-20 h-20 object-cover rounded-xl shadow-sm"
                                                        />
                                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                            {item.quantity}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h5>
                                                    <p className="text-gray-600 mb-2">Quantity: {item.quantity}</p>
                                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                                <span key={key} className="px-3 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600">Total: ₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="px-8 py-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 border-t border-gray-100">
                                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Delivery Address</p>
                                                    <p className="text-sm text-gray-600">{order.customer.city}, {order.customer.state}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Payment Method</p>
                                                    <p className="text-sm text-gray-600">{order.paymentMethod.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <div className="space-y-2 text-right">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span className="font-semibold text-primary-600">₹{order.subtotal.toLocaleString()}</span>
                                                </div>
                                                {order.shipping > 0 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Shipping:</span>
                                                        <span className="font-semibold text-primary-600">₹{order.shipping.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {order.tax > 0 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Tax:</span>
                                                        <span className="font-semibold text-primary-600">₹{order.tax.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-200 pt-2 mt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-bold text-gray-900">Total: </span>
                                                        <span className="text-xl font-bold text-primary-600 pl-1">₹ {order.total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Return/Exchange Button */}
                                {order.status === 'delivered' && (
                                    <div className="px-8 py-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-t border-blue-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                                    <RefreshCw className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-blue-900">Need to return or exchange items?</h4>
                                                    <p className="text-blue-700">You can request a return or exchange for delivered orders</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/return-request?orderId=${order._id}`}
                                                className="group relative px-6 py-3 text-sm font-semibold text-white btn-primary rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Return/Exchange
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
