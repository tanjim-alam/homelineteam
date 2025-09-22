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
    DollarSign,
    Truck,
    CreditCard,
    User,
    Calendar,
    MessageSquare
} from 'lucide-react'

export default function ReturnsPage() {
    const dispatch = useDispatch()
    const {
        items,
        currentReturn,
        stats,
        loading,
        error,
        updateLoading,
        pagination
    } = useSelector(s => s.returns)

    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showReturnDetails, setShowReturnDetails] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showRefundModal, setShowRefundModal] = useState(false)
    const [selectedReturn, setSelectedReturn] = useState(null)
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
        const params = {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            search: searchTerm || undefined
        }
        dispatch(listReturns(params))
    }, [dispatch, statusFilter, typeFilter, searchTerm])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000)
            return () => clearTimeout(timer)
        }
    }, [error, dispatch])

    const handleRefresh = () => {
        const params = {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            search: searchTerm || undefined
        }
        dispatch(listReturns(params))
    }

    const handleViewReturn = async (returnItem) => {
        try {
            setSelectedReturn(returnItem)
            setShowReturnDetails(true)

            // Try to fetch detailed return data, but don't block the modal if it fails
            try {
                await dispatch(getReturnById(returnItem._id)).unwrap()
            } catch (error) {
                // Modal will still show with the basic data from the list
            }
        } catch (error) {
            alert('Failed to open return details. Please try again.')
        }
    }

    const handleUpdateStatus = async (e) => {
        e.preventDefault()
        if (selectedReturn && statusForm.status) {
            try {
                await dispatch(updateReturnStatus({
                    id: selectedReturn._id,
                    status: statusForm.status,
                    adminNotes: statusForm.adminNotes,
                    refundMethod: statusForm.refundMethod,
                    trackingNumber: statusForm.trackingNumber
                })).unwrap()

                // Show success message
                alert(`Return status updated to ${statusForm.status} successfully!`)

                setShowStatusModal(false)
                setStatusForm({ status: '', adminNotes: '', refundMethod: 'original_payment', trackingNumber: '' })

                // Refresh the returns list
                handleRefresh()
            } catch (error) {
                alert('Failed to update status. Please try again.')
            }
        }
    }

    const handleProcessRefund = async (e) => {
        e.preventDefault()
        if (selectedReturn && refundForm.transactionId) {
            dispatch(processRefund({
                id: selectedReturn._id,
                transactionId: refundForm.transactionId,
                method: refundForm.method
            }))
            setShowRefundModal(false)
            setRefundForm({ transactionId: '', method: 'original_payment' })
        }
    }

    const handleCompleteRefund = async (returnItem) => {
        if (confirm('Are you sure you want to mark this refund as completed?')) {
            dispatch(completeRefund(returnItem._id))
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            received: 'bg-cyan-100 text-cyan-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            approved: CheckCircle,
            rejected: XCircle,
            processing: RefreshCw,
            shipped: Truck,
            received: Package,
            completed: CheckCircle,
            cancelled: XCircle
        }
        return icons[status] || AlertCircle
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // No need for client-side filtering since we're doing it server-side

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
                    <p className="text-gray-600">Manage customer return and exchange requests</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalReturns}</p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-50">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stats.byStatus?.find(s => s._id === 'pending')?.count || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-50">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stats.byStatus?.find(s => s._id === 'completed')?.count || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-50">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Refund</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.totalRefundAmount || 0}</p>
                            </div>
                            <div className="p-3 rounded-full bg-green-50">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search returns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading returns...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Returns Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'No returns match your current filters.'
                                : 'No return requests have been submitted yet.'
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((returnItem) => {
                        const StatusIcon = getStatusIcon(returnItem.status)

                        return (
                            <div key={returnItem._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <StatusIcon className="w-5 h-5 text-gray-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {returnItem.type === 'return' ? 'Return' : 'Exchange'} Request
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(returnItem.status)}`}>
                                                {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{returnItem.user?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                <span>Order: #{returnItem.order?.orderNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(returnItem.requestedAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                <span>₹{returnItem.refund?.amount || 0}</span>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="mb-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Items to Return:</h4>
                                            <div className="space-y-2">
                                                {returnItem.items.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                        <img
                                                            src={item.image || '/placeholder-product.jpg'}
                                                            alt={item.name}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-xs text-gray-600">
                                                                Qty: {item.quantity} • ₹{item.price} each • {item.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {returnItem.customerNotes && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Customer Notes:</p>
                                                        <p className="text-sm text-gray-700">{returnItem.customerNotes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => handleViewReturn(returnItem)}
                                            className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            View Details
                                        </button>

                                        {returnItem.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReturn(returnItem)
                                                        setStatusForm({
                                                            status: 'approved',
                                                            adminNotes: '',
                                                            refundMethod: 'original_payment',
                                                            trackingNumber: ''
                                                        })
                                                        setShowStatusModal(true)
                                                    }}
                                                    className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReturn(returnItem)
                                                        setStatusForm({
                                                            status: 'rejected',
                                                            adminNotes: '',
                                                            refundMethod: 'original_payment',
                                                            trackingNumber: ''
                                                        })
                                                        setShowStatusModal(true)
                                                    }}
                                                    className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {returnItem.status === 'approved' && returnItem.refund?.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedReturn(returnItem)
                                                    setRefundForm({ transactionId: '', method: 'original_payment' })
                                                    setShowRefundModal(true)
                                                }}
                                                className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Process Refund
                                            </button>
                                        )}

                                        {returnItem.refund?.status === 'processing' && (
                                            <button
                                                onClick={() => handleCompleteRefund(returnItem)}
                                                className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Complete Refund
                                            </button>
                                        )}

                                        {/* Additional status update button for any status */}
                                        <button
                                            onClick={() => {
                                                setSelectedReturn(returnItem)
                                                setStatusForm({
                                                    status: returnItem.status,
                                                    adminNotes: returnItem.adminNotes || '',
                                                    refundMethod: returnItem.refund?.method || 'original_payment',
                                                    trackingNumber: returnItem.returnShipping?.trackingNumber || ''
                                                })
                                                setShowStatusModal(true)
                                            }}
                                            className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedReturn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select status</option>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={statusForm.adminNotes}
                                    onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add notes about this status update..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Method
                                </label>
                                <select
                                    value={statusForm.refundMethod}
                                    onChange={(e) => setStatusForm({ ...statusForm, refundMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="original_payment">Original Payment Method</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="store_credit">Store Credit</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tracking Number
                                </label>
                                <input
                                    type="text"
                                    value={statusForm.trackingNumber}
                                    onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter tracking number (if applicable)"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updateLoading ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Return Details Modal */}
            {showReturnDetails && (currentReturn || selectedReturn) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Return Details</h3>
                            <button
                                onClick={() => {
                                    setShowReturnDetails(false)
                                    setSelectedReturn(null)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {(() => {
                                const returnData = currentReturn || selectedReturn
                                if (!returnData) return null

                                return (
                                    <>
                                        {/* Header Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Return ID</p>
                                                <p className="text-lg font-semibold text-gray-900">{returnData._id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Status</p>
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(returnData.status)}`}>
                                                    {returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Type</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {returnData.type === 'return' ? 'Return' : 'Exchange'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Customer Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Customer Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Name</p>
                                                    <p className="text-gray-900">{returnData.customer?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                                    <p className="text-gray-900">{returnData.customer?.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Phone</p>
                                                    <p className="text-gray-900">{returnData.customer?.phone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Requested At</p>
                                                    <p className="text-gray-900">{formatDate(returnData.requestedAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Order Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Order Number</p>
                                                    <p className="text-gray-900">#{returnData.order?.orderNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Order Date</p>
                                                    <p className="text-gray-900">{returnData.order?.createdAt ? formatDate(returnData.order.createdAt) : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Payment Method</p>
                                                    <p className="text-gray-900">{returnData.order?.paymentMethod || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Payment Status</p>
                                                    <p className="text-gray-900">{returnData.order?.paymentStatus || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items to Return */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Items to Return</h4>
                                            <div className="space-y-3">
                                                {returnData.items?.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                                        <img
                                                            src={item.image || '/placeholder-product.jpg'}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                                                                <div>
                                                                    <span className="font-medium">Quantity:</span> {item.quantity}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Price:</span> ₹{item.price}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Reason:</span> {item.reason}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Condition:</span> {item.condition}
                                                                </div>
                                                            </div>
                                                            {item.description && (
                                                                <div className="mt-2">
                                                                    <span className="font-medium text-gray-600">Description:</span>
                                                                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Exchange Items */}
                                        {returnData.exchangeItems && returnData.exchangeItems.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Exchange Items</h4>
                                                <div className="space-y-3">
                                                    {returnData.exchangeItems.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                                            <img
                                                                src={item.image || '/placeholder-product.jpg'}
                                                                alt={item.name}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <h5 className="font-medium text-gray-900">{item.name}</h5>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                                                                    <div>
                                                                        <span className="font-medium">Quantity:</span> {item.quantity}
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium">Price:</span> ₹{item.price}
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium">Size:</span> {item.size || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Refund Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-900">Refund Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Refund Amount</p>
                                                    <p className="text-xl font-bold text-gray-900">₹{returnData.refund?.amount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Refund Method</p>
                                                    <p className="text-gray-900">{returnData.refund?.method || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Refund Status</p>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${returnData.refund?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        returnData.refund?.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {returnData.refund?.status || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Notes */}
                                        {returnData.customerNotes && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Customer Notes</h4>
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-gray-700">{returnData.customerNotes}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Admin Notes */}
                                        {returnData.adminNotes && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Admin Notes</h4>
                                                <div className="p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-gray-700">{returnData.adminNotes}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Return Shipping */}
                                        {returnData.returnShipping && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Return Shipping</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Tracking Number</p>
                                                        <p className="text-gray-900">{returnData.returnShipping.trackingNumber || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Shipping Cost</p>
                                                        <p className="text-gray-900">₹{returnData.returnShipping.cost || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )
                            })()}
                        </div>

                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowReturnDetails(false)
                                    setSelectedReturn(null)
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Processing Modal */}
            {showRefundModal && selectedReturn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
                            <button
                                onClick={() => setShowRefundModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleProcessRefund} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID
                                </label>
                                <input
                                    type="text"
                                    value={refundForm.transactionId}
                                    onChange={(e) => setRefundForm({ ...refundForm, transactionId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter transaction ID"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Method
                                </label>
                                <select
                                    value={refundForm.method}
                                    onChange={(e) => setRefundForm({ ...refundForm, method: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="original_payment">Original Payment Method</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="store_credit">Store Credit</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRefundModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {updateLoading ? 'Processing...' : 'Process Refund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
