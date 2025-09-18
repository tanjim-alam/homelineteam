'use client';

import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Phone, Mail, Calendar, Clock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';

export default function DeliveryPartnerDashboard() {
    const [partner, setPartner] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loginForm, setLoginForm] = useState({
        companyName: '',
        partnerId: ''
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Login function for delivery partners
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // For demo purposes, we'll use the partner ID directly
            // In production, you'd have proper authentication
            const response = await api.request(`/api/delivery-partners/${loginForm.partnerId}`);

            if (response) {
                setPartner(response);
                setIsLoggedIn(true);
                await fetchOrders(response._id);
            } else {
                setError('Invalid partner credentials');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders assigned to this partner
    const fetchOrders = async (partnerId) => {
        try {
            const response = await api.request(`/api/orders/partner/${partnerId}`);
            setOrders(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to load orders');
        }
    };

    // Update delivery status
    const updateDeliveryStatus = async (orderId, newStatus) => {
        try {
            await api.request(`/api/orders/${orderId}/delivery-status`, {
                method: 'PATCH',
                data: {
                    deliveryStatus: newStatus,
                    updatedBy: 'partner'
                }
            });

            // Refresh orders
            await fetchOrders(partner._id);
            setShowOrderDetails(false);
        } catch (err) {
            setError('Failed to update delivery status');
        }
    };

    // Filter orders by status
    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        return order.deliveryPartner?.deliveryStatus === statusFilter;
    });

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'assigned': 'bg-blue-100 text-blue-800',
            'picked_up': 'bg-yellow-100 text-yellow-800',
            'in_transit': 'bg-purple-100 text-purple-800',
            'out_for_delivery': 'bg-orange-100 text-orange-800',
            'delivered': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'returned': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Truck className="mx-auto h-12 w-12 text-blue-600" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Delivery Partner Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Access your assigned orders
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={loginForm.companyName}
                                    onChange={(e) => setLoginForm({ ...loginForm, companyName: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Shiprocket, Delhivery"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Partner ID
                                </label>
                                <input
                                    type="text"
                                    value={loginForm.partnerId}
                                    onChange={(e) => setLoginForm({ ...loginForm, partnerId: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your partner ID"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Truck className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {partner?.name} Dashboard
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {partner?.companyName} • Partner ID: {partner?._id?.slice(-8)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsLoggedIn(false);
                                setPartner(null);
                                setOrders([]);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(o.deliveryPartner?.deliveryStatus)).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Delivered</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => o.deliveryPartner?.deliveryStatus === 'delivered').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Failed</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => o.deliveryPartner?.deliveryStatus === 'failed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="all">All Orders</option>
                            <option value="assigned">Assigned</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="in_transit">In Transit</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Assigned Orders</h3>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No orders found for the selected filter.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        Order #{order.orderNumber}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {order.customer.name} • {order.customer.phone}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.deliveryPartner?.deliveryStatus)}`}>
                                                    {order.deliveryPartner?.deliveryStatus?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {order.customer.address}, {order.customer.city}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Assigned: {formatDate(order.deliveryPartner?.assignedAt)}
                                                </div>
                                                <div className="flex items-center">
                                                    <Package className="h-4 w-4 mr-2" />
                                                    {order.items.length} item(s) • {formatCurrency(order.total)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderDetails(true);
                                                }}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                                Order Details - #{selectedOrder.orderNumber}
                            </h3>
                            <button
                                onClick={() => setShowOrderDetails(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <EyeOff className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Information */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Customer Information</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Name</p>
                                            <p className="text-sm text-gray-900">{selectedOrder.customer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Phone</p>
                                            <p className="text-sm text-gray-900">{selectedOrder.customer.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Email</p>
                                            <p className="text-sm text-gray-900">{selectedOrder.customer.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Address</p>
                                            <p className="text-sm text-gray-900">
                                                {selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.zip}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Order Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                        <div className="mt-1">
                                                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                                <span key={key} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Order Summary</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Subtotal</span>
                                            <span className="text-sm font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Shipping</span>
                                            <span className="text-sm font-medium">{formatCurrency(selectedOrder.shipping)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Tax</span>
                                            <span className="text-sm font-medium">{formatCurrency(selectedOrder.tax)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="text-sm font-medium text-gray-900">Total</span>
                                            <span className="text-sm font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Status Update */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Update Delivery Status</h4>
                                <div className="flex items-center space-x-4">
                                    <select
                                        value={selectedOrder.deliveryPartner?.deliveryStatus || 'assigned'}
                                        onChange={(e) => updateDeliveryStatus(selectedOrder._id, e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="assigned">Assigned</option>
                                        <option value="picked_up">Picked Up</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="out_for_delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="failed">Failed</option>
                                        <option value="returned">Returned</option>
                                    </select>
                                    <span className="text-sm text-gray-600">
                                        Last updated: {formatDate(selectedOrder.deliveryPartner?.assignedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
