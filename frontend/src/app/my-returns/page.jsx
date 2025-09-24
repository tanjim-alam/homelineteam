'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../contexts/UserContext';
import apiService from '../../services/api';
import {
    Package,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Filter,
    Search,
    ArrowLeft,
    ShoppingBag,
    Truck,
    RotateCcw
} from 'lucide-react';

const MyReturnsPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useUser();
    const router = useRouter();

    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchReturns();
        }
    }, [isAuthenticated, statusFilter, typeFilter]);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUserReturns(
                statusFilter === 'all' ? null : statusFilter,
                typeFilter === 'all' ? null : typeFilter
            );

            if (response.success) {
                setReturns(response.data);
            } else {
                setError(response.message || 'Failed to fetch returns');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching returns');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            processing: 'bg-purple-100 text-purple-800 border-purple-200',
            shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            received: 'bg-cyan-100 text-cyan-800 border-cyan-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            approved: CheckCircle,
            rejected: XCircle,
            processing: RefreshCw,
            shipped: Package,
            received: Package,
            completed: CheckCircle,
            cancelled: XCircle
        };
        return icons[status] || AlertCircle;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredReturns = returns.filter(returnItem => {
        const matchesSearch = searchTerm === '' ||
            returnItem.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            returnItem._id.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

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
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header Section */}
            <div className="inset-0 bg-primary text-white">
                <div className="container-custom py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => router.push('/profile')}
                            className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Profile
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <RotateCcw className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Returns & Exchanges</h1>
                            <p className="text-white/80 text-lg">Track your return and exchange requests</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Refresh Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={fetchReturns}
                        disabled={loading}
                        className="btn-primary group relative px-6 py-3 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        <RefreshCw className={`w-5 h-5 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 mb-8 p-8">
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-3 flex-1 min-w-64">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <Search className="w-5 h-5 text-white" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search returns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <Filter className="w-5 h-5 text-white" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="received">Received</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                            >
                                <option value="all">All Types</option>
                                <option value="return">Returns</option>
                                <option value="exchange">Exchanges</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Returns List */}
                {loading ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading returns...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                ) : filteredReturns.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-12">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Package className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Returns Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'No returns match your current filters.'
                                    : 'You haven\'t submitted any return or exchange requests yet.'
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredReturns.map((returnItem) => {
                            const StatusIcon = getStatusIcon(returnItem.status);

                            return (
                                <div key={returnItem._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300">
                                    {/* Header */}
                                    <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                                    <StatusIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {returnItem.type === 'return' ? 'Return' : 'Exchange'} Request
                                                    </h3>
                                                    <p className="text-gray-600">Request ID: #{returnItem._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(returnItem.status)}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
                                            <div className="flex-1">

                                                {/* Order Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-gray-700">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                                <ShoppingBag className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">Order Number</p>
                                                                <p className="text-sm text-gray-600">#{returnItem.order?.orderNumber || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-700">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                                <Clock className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">Requested Date</p>
                                                                <p className="text-sm text-gray-600">{formatDate(returnItem.requestedAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-gray-700">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                                <Package className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">Items Count</p>
                                                                <p className="text-sm text-gray-600">{returnItem.items.length} item(s)</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-700">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                                <RefreshCw className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">Refund Amount</p>
                                                                <p className="text-sm text-gray-600 text-primary-600 font-bold">₹{returnItem.refund?.amount || 0}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Customer Notes */}
                                                {returnItem.customerNotes && (
                                                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-xl border border-gray-100">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <AlertCircle className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 mb-1">Customer Notes</p>
                                                                <p className="text-sm text-gray-700">{returnItem.customerNotes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Items to Return */}
                                                <div className="mt-6">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-white" />
                                                        </div>
                                                        <h4 className="text-lg font-bold text-gray-900">Items to Return</h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {returnItem.items.map((item, index) => (
                                                            <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                                                                <img
                                                                    src={item.image || '/placeholder-product.jpg'}
                                                                    alt={item.name}
                                                                    className="w-16 h-16 object-cover rounded-xl shadow-sm"
                                                                />
                                                                <div className="flex-1">
                                                                    <h5 className="font-bold text-gray-900 mb-1">{item.name}</h5>
                                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                        <span>Qty: {item.quantity}</span>
                                                                        <span>₹{item.price} each</span>
                                                                        <span className="px-3 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">
                                                                            {item.reason}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-3 lg:min-w-48">
                                                <button
                                                    onClick={() => {
                                                        // Navigate to return details
                                                        router.push(`/my-returns/${returnItem._id}`);
                                                    }}
                                                    className="btn-primary group relative px-6 py-3 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    View Details
                                                </button>

                                                {returnItem.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            // Cancel return request
                                                            if (confirm('Are you sure you want to cancel this return request?')) {
                                                                // Implement cancel functionality
                                                            }
                                                        }}
                                                        className="group relative px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        Cancel Request
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReturnsPage;
