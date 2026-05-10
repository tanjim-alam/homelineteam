'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../contexts/UserContext';
import apiService from '../../services/api';
import {
    Package, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle,
    Filter, Search, ArrowLeft, ShoppingBag, RotateCcw, ChevronDown,
    ChevronUp, Truck, DollarSign
} from 'lucide-react';

const STATUS_META = {
    pending:    { label: 'Pending',    bg: 'bg-amber-100',   text: 'text-amber-800',  border: 'border-amber-200',  icon: Clock        },
    approved:   { label: 'Approved',   bg: 'bg-blue-100',    text: 'text-blue-800',   border: 'border-blue-200',   icon: CheckCircle  },
    rejected:   { label: 'Rejected',   bg: 'bg-red-100',     text: 'text-red-800',    border: 'border-red-200',    icon: XCircle      },
    processing: { label: 'Processing', bg: 'bg-purple-100',  text: 'text-purple-800', border: 'border-purple-200', icon: RefreshCw    },
    shipped:    { label: 'Shipped',    bg: 'bg-indigo-100',  text: 'text-indigo-800', border: 'border-indigo-200', icon: Truck        },
    received:   { label: 'Received',   bg: 'bg-cyan-100',    text: 'text-cyan-800',   border: 'border-cyan-200',   icon: Package      },
    completed:  { label: 'Completed',  bg: 'bg-green-100',   text: 'text-green-800',  border: 'border-green-200',  icon: CheckCircle  },
    cancelled:  { label: 'Cancelled',  bg: 'bg-gray-100',    text: 'text-gray-700',   border: 'border-gray-200',   icon: XCircle      },
};

const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] || STATUS_META.pending;
    const Icon = m.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
            <Icon className="w-3.5 h-3.5" />
            {m.label}
        </span>
    );
};

const MyReturnsPage = () => {
    const { isAuthenticated, loading: authLoading } = useUser();
    const router = useRouter();

    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) fetchReturns();
    }, [isAuthenticated, statusFilter, typeFilter]);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await apiService.getUserReturns(
                statusFilter === 'all' ? null : statusFilter,
                typeFilter === 'all' ? null : typeFilter
            );
            if (res.success) {
                setReturns(res.data || []);
            } else {
                setError(res.message || 'Failed to load returns');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (returnId) => {
        if (!window.confirm('Are you sure you want to cancel this return request?')) return;
        setCancelling(returnId);
        try {
            const res = await apiService.cancelReturnRequest(returnId);
            if (res.success) {
                setReturns(prev => prev.map(r => r._id === returnId ? { ...r, status: 'cancelled' } : r));
                showToast('Return request cancelled.');
            } else {
                showToast(res.message || 'Could not cancel request.', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Failed to cancel.', 'error');
        } finally {
            setCancelling(null);
        }
    };

    const filtered = returns.filter(r => {
        const q = searchTerm.toLowerCase();
        return !q || r.order?.orderNumber?.toLowerCase().includes(q) || r._id.toLowerCase().includes(q);
    });

    const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-primary text-white">
                <div className="container-custom py-10">
                    <Link href="/my-orders" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <RotateCcw className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">My Returns & Exchanges</h1>
                            <p className="text-white/70 text-sm mt-0.5">Track your return and exchange requests</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8 max-w-4xl">
                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order # or request ID…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800">
                            <option value="all">All Status</option>
                            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800">
                            <option value="all">All Types</option>
                            <option value="return">Returns</option>
                            <option value="exchange">Exchanges</option>
                        </select>
                    </div>
                    <button onClick={fetchReturns} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors ml-auto">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-40" />
                                        <div className="h-3 bg-gray-100 rounded w-56" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No returns found</h3>
                        <p className="text-sm text-gray-500">
                            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'No results match your filters.'
                                : "You haven't submitted any return or exchange requests yet."}
                        </p>
                        {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                            <Link href="/my-orders" className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                                <ShoppingBag className="w-4 h-4" /> Go to My Orders
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(r => {
                            const isExpanded = expandedId === r._id;
                            const dateStr = r.createdAt || r.timestamps?.requestedAt;

                            return (
                                <div key={r._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                    {/* Card Header */}
                                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                                <RotateCcw className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-gray-900">
                                                        {r.type === 'return' ? 'Return' : 'Exchange'} Request
                                                    </p>
                                                    <StatusBadge status={r.status} />
                                                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${r.type === 'return' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {r.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Order #{r.order?.orderNumber || 'N/A'} &nbsp;·&nbsp;
                                                    {r.items?.length || 0} item{r.items?.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                                                    {dateStr ? formatDate(dateStr) : '—'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {r.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancel(r._id)}
                                                    disabled={cancelling === r._id}
                                                    className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                                                >
                                                    {cancelling === r._id ? 'Cancelling…' : 'Cancel'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : r._id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide</> : <><ChevronDown className="w-3.5 h-3.5" />Details</>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                                            {/* Items */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                                                <div className="space-y-2">
                                                    {r.items?.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
                                                            {(item.productId?.images?.[0] || item.image) && (
                                                                <img src={item.productId?.images?.[0] || item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                                    {item.productId?.name || item.name || 'Product'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Qty: {item.quantity} · Reason: {item.reason?.replace(/_/g, ' ')} · {item.condition}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-700 shrink-0">
                                                                ₹{item.productId?.price || item.price || '—'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Refund info */}
                                            {r.refund && r.refund.status !== 'pending' && (
                                                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                                                    <DollarSign className="w-4 h-4 text-green-600 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-green-700">Refund Status</p>
                                                        <p className="text-sm text-green-800 capitalize">{r.refund.status} via {r.refund.method?.replace(/_/g, ' ')}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Shipping tracking */}
                                            {r.returnShipping?.trackingNumber && (
                                                <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
                                                    <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-purple-700">Return Tracking</p>
                                                        <p className="text-sm font-mono text-purple-800">{r.returnShipping.trackingNumber}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {r.customerNotes && (
                                                <div className="bg-white border border-gray-200 rounded-xl p-3">
                                                    <p className="text-xs font-bold text-gray-500 mb-1">Your Notes</p>
                                                    <p className="text-sm text-gray-700">{r.customerNotes}</p>
                                                </div>
                                            )}
                                            {r.adminNotes && (
                                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                                    <p className="text-xs font-bold text-amber-600 mb-1">Admin Notes</p>
                                                    <p className="text-sm text-gray-700">{r.adminNotes}</p>
                                                </div>
                                            )}

                                            {/* Status timeline */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status Guide</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {['pending', 'approved', 'processing', 'completed'].map(s => {
                                                        const m = STATUS_META[s];
                                                        const isActive = r.status === s;
                                                        const isDone = ['approved', 'processing', 'completed'].indexOf(s) <= ['approved', 'processing', 'completed'].indexOf(r.status);
                                                        return (
                                                            <div key={s} className={`text-center p-2 rounded-lg text-xs font-semibold ${isActive ? `${m.bg} ${m.text}` : isDone ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                                {m.label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
