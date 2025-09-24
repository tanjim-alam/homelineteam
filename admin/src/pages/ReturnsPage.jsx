import { useEffect, useState } from 'react'
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
    DollarSign
} from 'lucide-react'

const ReturnsPage = () => {
    const dispatch = useDispatch()
    const {
        items,
        loading,
        error,
        stats,
        currentReturn,
        updateLoading
    } = useSelector(s => s.returns)

    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showReturnDetails, setShowReturnDetails] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showRefundModal, setShowRefundModal] = useState(false)
    const [showProductDetails, setShowProductDetails] = useState(false)
    const [selectedReturn, setSelectedReturn] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [statusForm, setStatusForm] = useState({
        status: '',
        adminNotes: '',
        refundMethod: 'original_payment',
        trackingNumber: ''
    })
    const [refundForm, setRefundForm] = useState({
        transactionId: '',
        method: 'original_payment'
    })

    useEffect(() => {
        dispatch(listReturns())
        dispatch(getReturnStats())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            alert(`Error: ${error}`)
            dispatch(clearError())
        }
    }, [error, dispatch])

    const filteredItems = items?.filter(item => {
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        const matchesType = typeFilter === 'all' || item.type === typeFilter
        const matchesSearch = searchTerm === '' ||
            item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesType && matchesSearch
    }) || []

    const handleStatusUpdate = async (e) => {
        e.preventDefault()
            try {
                await dispatch(updateReturnStatus({
                    id: selectedReturn._id,
                ...statusForm
                })).unwrap()
                setShowStatusModal(false)
                setStatusForm({ status: '', adminNotes: '', refundMethod: 'original_payment', trackingNumber: '' })
            alert('Status updated successfully!')
        } catch (err) {
            alert(`Error: ${err}`)
        }
    }

    const handleRefundProcess = async (e) => {
        e.preventDefault()
        try {
            await dispatch(processRefund({
                id: selectedReturn._id,
                ...refundForm
            })).unwrap()
            setShowRefundModal(false)
            setRefundForm({ transactionId: '', method: 'original_payment' })
            alert('Refund processed successfully!')
        } catch (err) {
            alert(`Error: ${err}`)
        }
    }

    const handleRefundComplete = async (id) => {
        try {
            await dispatch(completeRefund(id)).unwrap()
            alert('Refund completed successfully!')
        } catch (err) {
            alert(`Error: ${err}`)
        }
    }

    const openStatusModal = (returnItem) => {
        setSelectedReturn(returnItem)
        setStatusForm({
            status: returnItem.status,
            adminNotes: returnItem.adminNotes || '',
            refundMethod: returnItem.refund?.method || 'original_payment',
            trackingNumber: returnItem.returnShipping?.trackingNumber || ''
        })
        setShowStatusModal(true)
    }

    const openRefundModal = (returnItem) => {
        setSelectedReturn(returnItem)
        setRefundForm({
            transactionId: '',
            method: 'original_payment'
        })
        setShowRefundModal(true)
    }

    const openReturnDetails = async (returnItem) => {
        try {
            await dispatch(getReturnById(returnItem._id)).unwrap()
            setSelectedReturn(returnItem)
            setShowReturnDetails(true)
        } catch (err) {
            alert(`Error loading return details: ${err}`)
        }
    }

    const openProductDetails = (product) => {
        setSelectedProduct(product)
        setShowProductDetails(true)
    }

    const handleQuickStatusUpdate = async (returnId, status) => {
        try {
            await dispatch(updateReturnStatus({
                id: returnId,
                status,
                adminNotes: `Quick ${status} by admin`,
                refundMethod: 'original_payment',
                trackingNumber: ''
            })).unwrap()
            alert(`Return ${status} successfully!`)
        } catch (err) {
            alert(`Error: ${err}`)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            received: 'bg-indigo-100 text-indigo-800',
            completed: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            rejected: <XCircle className="w-3 h-3" />,
            processing: <RefreshCw className="w-3 h-3" />,
            shipped: <Package className="w-3 h-3" />,
            received: <CheckCircle className="w-3 h-3" />,
            completed: <CheckCircle className="w-3 h-3" />,
            cancelled: <XCircle className="w-3 h-3" />
        }
        return icons[status] || <AlertCircle className="w-3 h-3" />
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <span className="text-lg">Loading returns...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Modern Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                                Returns & Exchanges
                            </h1>
                            <p className="text-gray-600 text-lg">Streamline your return management process</p>
                </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/20">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">Live Updates</span>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

                {/* Modern Stats Cards */}
            {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                                    <Clock className="w-6 h-6 text-white" />
                            </div>
                                <div className="ml-4">
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.pending || 0}</p>
                            </div>
                        </div>
                    </div>

                        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                                    <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                                <div className="ml-4">
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.approved || 0}</p>
                            </div>
                        </div>
                    </div>

                        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                            </div>
                                <div className="ml-4">
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Refunds</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalRefunds || 0}</p>
                            </div>
                        </div>
                    </div>

                        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                                    <Package className="w-6 h-6 text-white" />
                            </div>
                                <div className="ml-4">
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Returns</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalReturns || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

                {/* Modern Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Filter & Search</h3>
                        <Filter className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search returns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
                        />
                    </div>
                        <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
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
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                    </div>
                        </div>
                        <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                                <option value="return">Return</option>
                                <option value="exchange">Exchange</option>
                        </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                    </div>
                </div>
            </div>

                {/* Modern Returns Cards */}
                <div className="space-y-4">
                    {filteredItems.map((returnItem) => (
                        <div key={returnItem._id} className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                {/* Main Content */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Order & Customer Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                                                <Package className="w-5 h-5 text-white" />
                    </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-600">Order</p>
                                                <p className="text-lg font-bold text-gray-900">#{returnItem.order?.orderNumber || 'N/A'}</p>
                </div>
                    </div>
                                        <div className="pl-12">
                                            <p className="text-sm font-medium text-gray-900">{returnItem.user?.name}</p>
                                            <p className="text-xs text-gray-500">{returnItem.user?.email}</p>
                </div>
                    </div>

                                    {/* Type & Status */}
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${returnItem.type === 'return'
                                                ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                                                : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                                                }`}>
                                                {returnItem.type}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(returnItem.status)}`}>
                                                {getStatusIcon(returnItem.status)}
                                                <span className="ml-1 capitalize">{returnItem.status}</span>
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(returnItem.createdAt).toLocaleDateString()}
                                            </div>
                                            </div>

                                    {/* Items */}
                                    <div className="space-y-3 col-span-2">
                                        <p className="text-sm font-semibold text-gray-600">{returnItem.items?.length || 0} Items</p>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {returnItem.items?.slice(0, 2).map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="group bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl p-2 cursor-pointer transition-all duration-200 border border-blue-100 hover:border-blue-200"
                                                    onClick={() => openProductDetails(item.productId)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0 max-w-[180px]">
                                                            <h4 className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-900" title={item.productId?.name || 'Unknown Product'}>
                                                                {item.productId?.name || 'Unknown Product'}
                                                            </h4>
                                                            <div className="flex items-center space-x-1 mt-1">
                                                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                                <span className="text-xs text-gray-500">•</span>
                                                                <span className="text-xs font-medium text-blue-600">
                                                                    ₹{item.productId?.price || 'N/A'}
                                                                </span>
                                            </div>
                                            </div>
                                                        <div className="ml-1 flex-shrink-0">
                                                            <Eye className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {returnItem.items?.length > 2 && (
                                                <div className="bg-gray-50 rounded-xl p-2 text-center">
                                                    <span className="text-xs font-medium text-gray-600">
                                                        +{returnItem.items.length - 2} more
                                                    </span>
                                                </div>
                                            )}
                                            </div>
                                        </div>

                                    {/* Refund Status */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-600">Refund Status</p>
                                        {returnItem.refund ? (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${returnItem.refund.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                                                returnItem.refund.status === 'processing' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                                                    'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                                                }`}>
                                                {returnItem.refund.status}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No refund</span>
                                        )}

                                        {/* Bank Account Indicator */}
                                        {returnItem.bankAccount && Object.keys(returnItem.bankAccount).length > 0 && (
                                            <div className="flex items-center space-x-1 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                <span className="text-xs text-blue-600 font-medium">Bank Details</span>
                                                    </div>
                                        )}

                                        {/* Shipping Address Indicator */}
                                        {returnItem.shippingAddress && Object.keys(returnItem.shippingAddress).length > 0 && (
                                            <div className="flex items-center space-x-1 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                <span className="text-xs text-purple-600 font-medium">Shipping Address</span>
                                            </div>
                                        )}
                                    </div>
                                    </div>

                                {/* Actions */}
                                <div className="mt-4 lg:mt-0 lg:ml-6">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openReturnDetails(returnItem)}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </button>

                                        <button
                                            onClick={() => openStatusModal(returnItem)}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Update Status
                                        </button>

                                        {returnItem.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleQuickStatusUpdate(returnItem._id, 'approved')}
                                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleQuickStatusUpdate(returnItem._id, 'rejected')}
                                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {returnItem.status === 'approved' && (
                                            <button
                                                onClick={() => openRefundModal(returnItem)}
                                                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                            >
                                                <DollarSign className="w-4 h-4 mr-1" />
                                                Process Refund
                                            </button>
                                        )}

                                        {returnItem.refund?.status === 'processing' && (
                                            <button
                                                onClick={() => handleRefundComplete(returnItem._id)}
                                                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Complete Refund
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                </div>
                    ))}
                </div>

                {/* Modern Status Update Modal */}
                {showStatusModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                    Update Return Status
                                </h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                            <form onSubmit={handleStatusUpdate} className="space-y-6">
                            <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                                    required
                                >
                                        <option value="">Select Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="received">Received</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes</label>
                                <textarea
                                    value={statusForm.adminNotes}
                                    onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                                        rows="3"
                                        placeholder="Add admin notes..."
                                />
                            </div>
                            <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Method</label>
                                <select
                                    value={statusForm.refundMethod}
                                    onChange={(e) => setStatusForm({ ...statusForm, refundMethod: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                                >
                                    <option value="original_payment">Original Payment Method</option>
                                    <option value="store_credit">Store Credit</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={statusForm.trackingNumber}
                                    onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                                        placeholder="Enter tracking number"
                                />
                            </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {updateLoading ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

                {/* Modern Refund Process Modal */}
                {showRefundModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                                    Process Refund
                                </h3>
                            <button
                                    onClick={() => setShowRefundModal(false)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                            <form onSubmit={handleRefundProcess} className="space-y-6">
                                            <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={refundForm.transactionId}
                                        onChange={(e) => setRefundForm({ ...refundForm, transactionId: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200"
                                        placeholder="Enter transaction ID"
                                        required
                                    />
                                            </div>
                                            <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Method</label>
                                    <select
                                        value={refundForm.method}
                                        onChange={(e) => setRefundForm({ ...refundForm, method: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                                    >
                                        <option value="original_payment">Original Payment Method</option>
                                        <option value="store_credit">Store Credit</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                            </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRefundModal(false)}
                                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {updateLoading ? 'Processing...' : 'Process Refund'}
                                    </button>
                                            </div>
                            </form>
                                        </div>
                    </div>
                )}

                {/* Modern Return Details Modal */}
                {showReturnDetails && currentReturn && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-6xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                    Return Details
                                </h3>
                                <button
                                    onClick={() => setShowReturnDetails(false)}
                                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Return Information */}
                                        <div className="space-y-4">
                                    <div className="bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Return Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Return ID:</span>
                                                <span className="font-medium">{currentReturn._id}</span>
                                                </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Order Number:</span>
                                                <span className="font-medium">#{currentReturn.order?.orderNumber}</span>
                                                </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentReturn.type === 'return'
                                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                                                    : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                                                    }`}>
                                                    {currentReturn.type}
                                                </span>
                                                </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(currentReturn.status)}`}>
                                                    {getStatusIcon(currentReturn.status)}
                                                    <span className="ml-1 capitalize">{currentReturn.status}</span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Requested:</span>
                                                <span className="font-medium">{new Date(currentReturn.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                    {/* Customer Information */}
                                    <div className="bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Name:</span>
                                                <span className="font-medium">{currentReturn.user?.name}</span>
                                                </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Email:</span>
                                                <span className="font-medium">{currentReturn.user?.email}</span>
                                                </div>
                                                </div>
                                            </div>
                                        </div>

                                {/* Return Items */}
                                        <div className="space-y-4">
                                    <div className="bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Return Items</h4>
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {currentReturn.items?.map((item, index) => (
                                                <div key={index} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200">
                                                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                                        {/* Product Image Placeholder */}
                                                        <div className="flex-shrink-0 self-center sm:self-start">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
                                                                {item.productId?.images && item.productId.images.length > 0 ? (
                                                                    <img
                                                                        src={item.productId.images[0]}
                                                                        alt={item.productId.name}
                                                                        className="w-full h-full object-cover rounded-xl"
                                                                    />
                                                                ) : (
                                                                    <Package className="w-8 h-8 text-blue-600" />
                                                                )}
                                                                </div>
                                                                </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1 min-w-0 w-full">
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <h5 className="text-lg font-bold text-gray-900 mb-2 break-words" title={item.productId?.name || 'Unknown Product'}>
                                                                        {item.productId?.name || 'Unknown Product'}
                                                                    </h5>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                                                                        <span className="flex items-center">
                                                                            <Package className="w-4 h-4 mr-1 flex-shrink-0" />
                                                                            Qty: {item.quantity}
                                                                        </span>
                                                                        <span className="text-lg font-bold text-blue-600">
                                                                            ₹{item.productId?.price || 'N/A'}
                                                                        </span>
                                                                </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-semibold text-gray-700">Reason:</span>
                                                                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                                        {item.reason}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-semibold text-gray-700">Condition:</span>
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.condition === 'new' ? 'bg-green-100 text-green-800' :
                                                                        item.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {item.condition}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Exchange Items */}
                                    {currentReturn.exchangeItems?.length > 0 && (
                                        <div className="bg-gray-50/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Exchange Items</h4>
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {currentReturn.exchangeItems.map((item, index) => (
                                                    <div key={index} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200">
                                                        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                                            {/* Product Image Placeholder */}
                                                            <div className="flex-shrink-0 self-center sm:self-start">
                                                                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                                                    {item.productId?.images && item.productId.images.length > 0 ? (
                                                                        <img
                                                                            src={item.productId.images[0]}
                                                                            alt={item.productId.name}
                                                                            className="w-full h-full object-cover rounded-xl"
                                                                        />
                                                                    ) : (
                                                                        <Package className="w-8 h-8 text-green-600" />
                                                                    )}
                                                                    </div>
                                                                    </div>

                                                            {/* Product Details */}
                                                            <div className="flex-1 min-w-0 w-full">
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <h5 className="text-lg font-bold text-gray-900 mb-2 break-words" title={item.productId?.name || 'Unknown Product'}>
                                                                            {item.productId?.name || 'Unknown Product'}
                                                                        </h5>
                                                                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                                                                            <span className="flex items-center">
                                                                                <Package className="w-4 h-4 mr-1 flex-shrink-0" />
                                                                                Qty: {item.quantity}
                                                                            </span>
                                                                            <span className="text-lg font-bold text-green-600">
                                                                                ₹{item.productId?.price || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes and Additional Information */}
                            <div className="mt-8 space-y-6">
                                {currentReturn.customerNotes && (
                                    <div className="bg-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Notes</h4>
                                        <p className="text-gray-700">{currentReturn.customerNotes}</p>
                                    </div>
                                )}

                                {currentReturn.adminNotes && (
                                    <div className="bg-yellow-50/50 backdrop-blur-sm p-6 rounded-2xl border border-yellow-200/50">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h4>
                                        <p className="text-gray-700">{currentReturn.adminNotes}</p>
                                            </div>
                                        )}

                                        {/* Refund Information */}
                                {currentReturn.refund && (
                                    <div className="bg-green-50/50 backdrop-blur-sm p-6 rounded-2xl border border-green-200/50">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Refund Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                <span className="text-gray-600">Method:</span>
                                                <span className="ml-2 font-medium capitalize">{currentReturn.refund.method?.replace('_', ' ')}</span>
                                                </div>
                                                <div>
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${currentReturn.refund.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    currentReturn.refund.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                    {currentReturn.refund.status}
                                                    </span>
                                                </div>
                                            {currentReturn.refund.transactionId && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-600">Transaction ID:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.refund.transactionId}</span>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bank Account Information */}
                                {currentReturn.bankAccount && Object.keys(currentReturn.bankAccount).length > 0 && (
                                    <div className="bg-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Bank Account Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentReturn.bankAccount.accountHolderName && (
                                                <div>
                                                    <span className="text-gray-600">Account Holder:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.bankAccount.accountHolderName}</span>
                                                </div>
                                            )}
                                            {currentReturn.bankAccount.bankName && (
                                                <div>
                                                    <span className="text-gray-600">Bank Name:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.bankAccount.bankName}</span>
                                                </div>
                                            )}
                                            {currentReturn.bankAccount.accountNumber && (
                                                <div>
                                                    <span className="text-gray-600">Account Number:</span>
                                                    <span className="ml-2 font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                                                        {currentReturn.bankAccount.accountNumber}
                                                    </span>
                                                </div>
                                            )}
                                            {currentReturn.bankAccount.ifscCode && (
                                                <div>
                                                    <span className="text-gray-600">IFSC Code:</span>
                                                    <span className="ml-2 font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                                                        {currentReturn.bankAccount.ifscCode}
                                                    </span>
                                                </div>
                                            )}
                                            {currentReturn.bankAccount.branchName && (
                                                <div>
                                                    <span className="text-gray-600">Branch:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.bankAccount.branchName}</span>
                                                </div>
                                            )}
                                            {currentReturn.bankAccount.accountType && (
                                                <div>
                                                    <span className="text-gray-600">Account Type:</span>
                                                    <span className="ml-2 font-medium capitalize">{currentReturn.bankAccount.accountType}</span>
                                                </div>
                                            )}
                                                </div>
                                            </div>
                                        )}

                                {/* Shipping Address Information */}
                                {currentReturn.shippingAddress && Object.keys(currentReturn.shippingAddress).length > 0 && (
                                    <div className="bg-purple-50/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Return Shipping Address</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentReturn.shippingAddress.fullName && (
                                                <div>
                                                    <span className="text-gray-600">Full Name:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.fullName}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.phone && (
                                                <div>
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.phone}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.address && (
                                                <div className="md:col-span-2">
                                                    <span className="text-gray-600">Address:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.address}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.city && (
                                                <div>
                                                    <span className="text-gray-600">City:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.city}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.state && (
                                                <div>
                                                    <span className="text-gray-600">State:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.state}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.zipCode && (
                                                <div>
                                                    <span className="text-gray-600">ZIP Code:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.zipCode}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.country && (
                                                <div>
                                                    <span className="text-gray-600">Country:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.country}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.landmark && (
                                                <div>
                                                    <span className="text-gray-600">Landmark:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.shippingAddress.landmark}</span>
                                                </div>
                                            )}
                                            {currentReturn.shippingAddress.addressType && (
                                                <div>
                                                    <span className="text-gray-600">Address Type:</span>
                                                    <span className="ml-2 font-medium capitalize">{currentReturn.shippingAddress.addressType}</span>
                                                </div>
                                            )}
                                                </div>
                                            </div>
                                        )}

                                {/* Shipping Information */}
                                {currentReturn.returnShipping?.trackingNumber && (
                                    <div className="bg-purple-50/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Shipping Information</h4>
                                        <div className="space-y-2">
                                                    <div>
                                                <span className="text-gray-600">Tracking Number:</span>
                                                <span className="ml-2 font-medium">{currentReturn.returnShipping.trackingNumber}</span>
                                                    </div>
                                            {currentReturn.returnShipping.carrier && (
                                                    <div>
                                                    <span className="text-gray-600">Carrier:</span>
                                                    <span className="ml-2 font-medium">{currentReturn.returnShipping.carrier}</span>
                                                    </div>
                                            )}
                                                </div>
                                            </div>
                                        )}
                        </div>

                            <div className="mt-8 flex justify-end">
                            <button
                                    onClick={() => setShowReturnDetails(false)}
                                    className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

                {/* Modern Product Details Modal */}
                {showProductDetails && selectedProduct && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Product Details
                                </h3>
                            <button
                                    onClick={() => setShowProductDetails(false)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                            <div className="space-y-6">
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                    <div className="text-center">
                                        <img
                                            src={selectedProduct.images[0]}
                                            alt={selectedProduct.name}
                                            className="w-40 h-40 object-cover rounded-3xl mx-auto shadow-lg"
                                />
                            </div>
                                )}

                                <div className="text-center">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        ₹{selectedProduct.price}
                                    </p>
                            </div>

                                {selectedProduct.description && (
                                    <div className="bg-gray-50/50 rounded-2xl p-4">
                                        <h5 className="font-semibold text-gray-700 mb-2">Description</h5>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setShowProductDetails(false)}
                                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Close
                                </button>
                            </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}

export default ReturnsPage
