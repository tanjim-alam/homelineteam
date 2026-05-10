import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    listReturns,
    getReturnById,
    updateReturnStatus,
    processRefund,
    completeRefund,
    getReturnStats,
    clearError
} from '../store/slices/returnSlice'
import { useToast } from '../context/ToastContext'
import {
    Package, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle,
    Eye, Filter, Search, DollarSign, ArrowRight, Truck, RotateCcw
} from 'lucide-react'

const Portal = ({ children }) => createPortal(children, document.body)

const STATUS_CONFIG = {
    pending:    { label: 'Pending',    bg: 'bg-amber-100',   text: 'text-amber-700',  dot: 'bg-amber-500'  },
    approved:   { label: 'Approved',   bg: 'bg-green-100',   text: 'text-green-700',  dot: 'bg-green-500'  },
    rejected:   { label: 'Rejected',   bg: 'bg-red-100',     text: 'text-red-700',    dot: 'bg-red-500'    },
    processing: { label: 'Processing', bg: 'bg-blue-100',    text: 'text-blue-700',   dot: 'bg-blue-500'   },
    shipped:    { label: 'Shipped',    bg: 'bg-purple-100',  text: 'text-purple-700', dot: 'bg-purple-500' },
    received:   { label: 'Received',   bg: 'bg-indigo-100',  text: 'text-indigo-700', dot: 'bg-indigo-500' },
    completed:  { label: 'Completed',  bg: 'bg-emerald-100', text: 'text-emerald-700',dot: 'bg-emerald-500'},
    cancelled:  { label: 'Cancelled',  bg: 'bg-gray-100',    text: 'text-gray-600',   dot: 'bg-gray-400'   },
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

const TypeBadge = ({ type }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${type === 'return' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        {type === 'return' ? 'Return' : 'Exchange'}
    </span>
)

export default function ReturnsPage() {
    const dispatch = useDispatch()
    const { items, loading, error, stats, currentReturn, updateLoading } = useSelector(s => s.returns)

    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const { showToast: _showToast } = useToast()
    const showToast = (msg, type = 'success') => _showToast(type, typeof msg === 'string' ? msg : (msg?.message || 'An error occurred'))

    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showRefundModal, setShowRefundModal] = useState(false)
    const [selectedReturn, setSelectedReturn] = useState(null)

    const [statusForm, setStatusForm] = useState({ status: '', adminNotes: '', refundMethod: 'original_payment', trackingNumber: '' })
    const [refundForm, setRefundForm] = useState({ transactionId: '', method: 'original_payment' })

    useEffect(() => {
        dispatch(listReturns())
        dispatch(getReturnStats())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            showToast(error, 'error')
            dispatch(clearError())
        }
    }, [error, dispatch])

    const filtered = (items || []).filter(r => {
        const matchStatus = statusFilter === 'all' || r.status === statusFilter
        const matchType = typeFilter === 'all' || r.type === typeFilter
        const q = searchTerm.toLowerCase()
        const matchSearch = !q ||
            r.user?.name?.toLowerCase().includes(q) ||
            r.user?.email?.toLowerCase().includes(q) ||
            r.order?.orderNumber?.toLowerCase().includes(q)
        return matchStatus && matchType && matchSearch
    })

    const openDetails = async (r) => {
        setSelectedReturn(r)
        setShowDetailsModal(true)
        try { await dispatch(getReturnById(r._id)).unwrap() } catch (e) { showToast(e, 'error') }
    }

    const openStatusModal = (r) => {
        setSelectedReturn(r)
        setStatusForm({
            status: r.status,
            adminNotes: r.adminNotes || '',
            refundMethod: r.refund?.method || 'original_payment',
            trackingNumber: r.returnShipping?.trackingNumber || ''
        })
        setShowStatusModal(true)
    }

    const openRefundModal = (r) => {
        setSelectedReturn(r)
        setRefundForm({ transactionId: '', method: 'original_payment' })
        setShowRefundModal(true)
    }

    const handleStatusUpdate = async (e) => {
        e.preventDefault()
        try {
            await dispatch(updateReturnStatus({ id: selectedReturn._id, ...statusForm })).unwrap()
            setShowStatusModal(false)
            showToast('Status updated successfully')
        } catch (e) { showToast(e, 'error') }
    }

    const handleRefundProcess = async (e) => {
        e.preventDefault()
        try {
            await dispatch(processRefund({ id: selectedReturn._id, ...refundForm })).unwrap()
            setShowRefundModal(false)
            showToast('Refund processing initiated')
        } catch (e) { showToast(e, 'error') }
    }

    const handleCompleteRefund = async (id) => {
        try {
            await dispatch(completeRefund(id)).unwrap()
            showToast('Refund completed')
        } catch (e) { showToast(e, 'error') }
    }

    const handleQuickApprove = async (r) => {
        try {
            await dispatch(updateReturnStatus({ id: r._id, status: 'approved', adminNotes: 'Approved by admin', refundMethod: 'original_payment', trackingNumber: '' })).unwrap()
            showToast('Return approved')
        } catch (e) { showToast(e, 'error') }
    }

    const handleQuickReject = async (r) => {
        try {
            await dispatch(updateReturnStatus({ id: r._id, status: 'rejected', adminNotes: 'Rejected by admin', refundMethod: 'original_payment', trackingNumber: '' })).unwrap()
            showToast('Return rejected')
        } catch (e) { showToast(e, 'error') }
    }

    const statCards = [
        { label: 'Pending',      value: stats?.pending || 0,      icon: Clock,        color: 'amber'   },
        { label: 'Approved',     value: stats?.approved || 0,     icon: CheckCircle,  color: 'green'   },
        { label: 'Total Returns',value: stats?.totalReturns || 0, icon: RotateCcw,    color: 'blue'    },
        { label: 'Refunds Done', value: stats?.totalRefunds || 0, icon: DollarSign,   color: 'purple'  },
    ]

    const colorMap = {
        amber:  { icon: 'bg-amber-100 text-amber-600',   val: 'text-amber-700',  border: 'border-amber-100'  },
        green:  { icon: 'bg-green-100 text-green-600',   val: 'text-green-700',  border: 'border-green-100'  },
        blue:   { icon: 'bg-blue-100 text-blue-600',     val: 'text-blue-700',   border: 'border-blue-100'   },
        purple: { icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700', border: 'border-purple-100' },
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Review and manage return requests</p>
                    </div>
                    <button
                        onClick={() => { dispatch(listReturns()); dispatch(getReturnStats()) }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color }) => {
                        const c = colorMap[color]
                        return (
                            <div key={label} className={`bg-white rounded-xl border ${c.border} p-5 flex items-center gap-4`}>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
                                    <p className="text-xs font-semibold text-gray-600 leading-none">{label}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or order #…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50"
                            >
                                <option value="all">All Status</option>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50"
                            >
                                <option value="all">All Types</option>
                                <option value="return">Return</option>
                                <option value="exchange">Exchange</option>
                            </select>
                        </div>
                        <span className="text-xs text-gray-600 font-medium ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 bg-gray-200 rounded w-36" />
                                        <div className="h-3 bg-gray-100 rounded w-48" />
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                                <Package className="w-7 h-7 text-gray-400" />
                            </div>
                            <p className="text-base font-semibold text-gray-700">No returns found</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters' : 'No return requests yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer / Order</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Refund</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(r => (
                                        <tr key={r._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-gray-900">{r.user?.name || '—'}</p>
                                                <p className="text-xs text-gray-600">{r.user?.email}</p>
                                                <p className="text-xs text-blue-600 font-mono mt-0.5">#{r.order?.orderNumber || 'N/A'}</p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <TypeBadge type={r.type} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-gray-800 font-medium">{r.items?.length || 0} item{r.items?.length !== 1 ? 's' : ''}</p>
                                                <p className="text-xs text-gray-600 truncate max-w-32">
                                                    {r.items?.map(i => i.productId?.name).filter(Boolean).slice(0, 2).join(', ')}
                                                    {r.items?.length > 2 ? ` +${r.items.length - 2}` : ''}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={r.status} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {r.refund?.status ? (
                                                    <StatusBadge status={r.refund.status} />
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-gray-700 font-medium">
                                                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openDetails(r)}
                                                        title="View Details"
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(r)}
                                                        title="Update Status"
                                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                    {r.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleQuickApprove(r)}
                                                                disabled={updateLoading}
                                                                title="Quick Approve"
                                                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuickReject(r)}
                                                                disabled={updateLoading}
                                                                title="Quick Reject"
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {r.status === 'approved' && (
                                                        <button
                                                            onClick={() => openRefundModal(r)}
                                                            title="Process Refund"
                                                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {r.refund?.status === 'processing' && (
                                                        <button
                                                            onClick={() => handleCompleteRefund(r._id)}
                                                            disabled={updateLoading}
                                                            title="Complete Refund"
                                                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Details Modal ── */}
            {showDetailsModal && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-[9999] overflow-y-auto py-10 px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">Return Details</h3>
                                        <p className="text-xs text-gray-600">#{selectedReturn?.order?.orderNumber}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDetailsModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {!currentReturn ? (
                                <div className="flex flex-col items-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                                    <p className="text-sm text-gray-600 mt-3">Loading details…</p>
                                </div>
                            ) : (
                                <div className="p-6 space-y-5">
                                    {/* Summary */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Customer', value: currentReturn.user?.name },
                                            { label: 'Email', value: currentReturn.user?.email },
                                            { label: 'Order #', value: `#${currentReturn.order?.orderNumber}` },
                                            { label: 'Requested', value: new Date(currentReturn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                                                <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">{value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <TypeBadge type={currentReturn.type} />
                                        <StatusBadge status={currentReturn.status} />
                                        {currentReturn.refund?.status && (
                                            <span className="text-xs text-gray-500">Refund: <StatusBadge status={currentReturn.refund.status} /></span>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Return Items</p>
                                        <div className="space-y-2">
                                            {currentReturn.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    {item.productId?.images?.[0] ? (
                                                        <img src={item.productId.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-blue-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.productId?.name || 'Unknown Product'}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity} · Reason: {item.reason} · Condition: {item.condition}</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-700 shrink-0">₹{item.productId?.price || '—'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Exchange Items */}
                                    {currentReturn.exchangeItems?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Exchange Items</p>
                                            <div className="space-y-2">
                                                {currentReturn.exchangeItems.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-green-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.productId?.name || 'Unknown Product'}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {currentReturn.customerNotes && (
                                        <div className="p-3.5 bg-blue-50 rounded-xl">
                                            <p className="text-xs font-semibold text-blue-600 mb-1">Customer Notes</p>
                                            <p className="text-sm text-gray-700">{currentReturn.customerNotes}</p>
                                        </div>
                                    )}
                                    {currentReturn.adminNotes && (
                                        <div className="p-3.5 bg-amber-50 rounded-xl">
                                            <p className="text-xs font-semibold text-amber-600 mb-1">Admin Notes</p>
                                            <p className="text-sm text-gray-700">{currentReturn.adminNotes}</p>
                                        </div>
                                    )}

                                    {/* Refund Info */}
                                    {currentReturn.refund && (
                                        <div className="p-3.5 bg-emerald-50 rounded-xl">
                                            <p className="text-xs font-semibold text-emerald-600 mb-2">Refund Info</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><span className="text-gray-500">Method: </span><span className="font-medium capitalize">{currentReturn.refund.method?.replace('_', ' ')}</span></div>
                                                <div><span className="text-gray-500">Status: </span><span className="font-medium capitalize">{currentReturn.refund.status}</span></div>
                                                {currentReturn.refund.transactionId && (
                                                    <div className="col-span-2"><span className="text-gray-500">Txn ID: </span><span className="font-mono font-medium">{currentReturn.refund.transactionId}</span></div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bank Account */}
                                    {currentReturn.bankAccount?.accountNumber && (
                                        <div className="p-3.5 bg-indigo-50 rounded-xl">
                                            <p className="text-xs font-semibold text-indigo-600 mb-2">Bank Account</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {currentReturn.bankAccount.accountHolderName && <div><span className="text-gray-500">Holder: </span><span className="font-medium">{currentReturn.bankAccount.accountHolderName}</span></div>}
                                                {currentReturn.bankAccount.bankName && <div><span className="text-gray-500">Bank: </span><span className="font-medium">{currentReturn.bankAccount.bankName}</span></div>}
                                                {currentReturn.bankAccount.accountNumber && <div><span className="text-gray-500">Acc #: </span><span className="font-mono font-medium">{currentReturn.bankAccount.accountNumber}</span></div>}
                                                {currentReturn.bankAccount.ifscCode && <div><span className="text-gray-500">IFSC: </span><span className="font-mono font-medium">{currentReturn.bankAccount.ifscCode}</span></div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Shipping */}
                                    {currentReturn.returnShipping?.trackingNumber && (
                                        <div className="p-3.5 bg-purple-50 rounded-xl flex items-center gap-3">
                                            <Truck className="w-4 h-4 text-purple-500 shrink-0" />
                                            <div className="text-sm">
                                                <span className="text-gray-500">Tracking: </span>
                                                <span className="font-mono font-semibold">{currentReturn.returnShipping.trackingNumber}</span>
                                                {currentReturn.returnShipping.carrier && <span className="text-gray-400"> via {currentReturn.returnShipping.carrier}</span>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                        <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            Close
                                        </button>
                                        <button
                                            onClick={() => { setShowDetailsModal(false); openStatusModal(selectedReturn) }}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Portal>
            )}

            {/* ── Status Update Modal ── */}
            {showStatusModal && selectedReturn && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="text-base font-bold text-gray-900">Update Return Status</h3>
                                <button onClick={() => setShowStatusModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Status</label>
                                    <select
                                        value={statusForm.status}
                                        onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                                    >
                                        <option value="">Select status…</option>
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admin Notes</label>
                                    <textarea
                                        value={statusForm.adminNotes}
                                        onChange={e => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                                        rows={3}
                                        placeholder="Add notes (optional)…"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Refund Method</label>
                                    <select
                                        value={statusForm.refundMethod}
                                        onChange={e => setStatusForm({ ...statusForm, refundMethod: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50"
                                    >
                                        <option value="original_payment">Original Payment Method</option>
                                        <option value="store_credit">Store Credit</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tracking Number (optional)</label>
                                    <input
                                        type="text"
                                        value={statusForm.trackingNumber}
                                        onChange={e => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                                        placeholder="e.g. IN123456789"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={updateLoading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                                        {updateLoading ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />Saving…</> : 'Update Status'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}

            {/* ── Process Refund Modal ── */}
            {showRefundModal && selectedReturn && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Process Refund</h3>
                                </div>
                                <button onClick={() => setShowRefundModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleRefundProcess} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={refundForm.transactionId}
                                        onChange={e => setRefundForm({ ...refundForm, transactionId: e.target.value })}
                                        required
                                        placeholder="Enter transaction ID"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Refund Method</label>
                                    <select
                                        value={refundForm.method}
                                        onChange={e => setRefundForm({ ...refundForm, method: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-gray-50"
                                    >
                                        <option value="original_payment">Original Payment Method</option>
                                        <option value="store_credit">Store Credit</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowRefundModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={updateLoading} className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                                        {updateLoading ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />Processing…</> : 'Initiate Refund'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
