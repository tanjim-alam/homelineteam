import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  listOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  clearError
} from '../store/slices/orderSlice'
import apiClient from '../api/client'
import { Truck, Package, Clock, CheckCircle, XCircle, User, Phone, Mail, RefreshCw, CreditCard, DollarSign, Calendar, MapPin } from 'lucide-react'

export default function OrdersPage() {
  const dispatch = useDispatch()
  const {
    items,
    currentOrder,
    loading,
    error,
    updateLoading
  } = useSelector(s => s.orders)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availablePartners, setAvailablePartners] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    partnerId: '',
    deliveryFee: '',
    estimatedDelivery: '',
    notes: ''
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: '',
    notes: ''
  })

  useEffect(() => {
    dispatch(listOrders())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const handleStatusUpdate = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }))
  }

  const handlePaymentStatusUpdate = (orderId, paymentStatus, notes = '') => {
    dispatch(updatePaymentStatus({ id: orderId, paymentStatus, notes }))
  }

  const handleOpenPaymentModal = (order) => {
    setSelectedOrder(order)
    setPaymentForm({
      paymentStatus: order.paymentStatus || 'pending',
      notes: ''
    })
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (selectedOrder && paymentForm.paymentStatus) {
      handlePaymentStatusUpdate(selectedOrder._id, paymentForm.paymentStatus, paymentForm.notes)
      setShowPaymentModal(false)
      setSelectedOrder(null)
      setPaymentForm({ paymentStatus: '', notes: '' })
    }
  }

  const handleRefresh = () => {
    dispatch(listOrders())
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
    dispatch(getOrderById(order._id))
  }

  const handleAssignOrder = async (order) => {
    setSelectedOrder(order)
    setShowAssignModal(true)

    // Fetch available partners for this order's location
    try {
      const response = await apiClient.get(`/api/orders/available-partners?city=${order.customer.city}&state=${order.customer.state}&pincode=${order.customer.zip}`)
      setAvailablePartners(response.data || response)
    } catch (error) {
      setAvailablePartners([])
    }
  }

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault()
    if (!assignmentForm.partnerId) return

    setAssigning(true)
    try {
      await apiClient.post(`/api/orders/${selectedOrder._id}/assign`, assignmentForm)
      setShowAssignModal(false)
      setAssignmentForm({ partnerId: '', deliveryFee: '', estimatedDelivery: '', notes: '' })
      dispatch(listOrders()) // Refresh orders
    } catch (error) {
    } finally {
      setAssigning(false)
    }
  }

  const handleDeliveryStatusUpdate = async (orderId, status) => {
    try {
      await apiClient.patch(`/api/orders/${orderId}/delivery-status`, { deliveryStatus: status })
      dispatch(listOrders()) // Refresh orders
    } catch (error) {
    }
  }

  const getStatusColor = (status) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      shipped: 'bg-purple-100 text-purple-800'
    }
    return statusConfig[status] || statusConfig.pending
  }

  const getPaymentMethodInfo = (paymentMethod) => {
    const methods = {
      cod: { name: 'Cash on Delivery', icon: '💰', color: 'bg-green-100 text-green-800' },
      card: { name: 'Credit/Debit Card', icon: '💳', color: 'bg-blue-100 text-blue-800' },
      upi: { name: 'UPI', icon: '📱', color: 'bg-purple-100 text-purple-800' },
      netbanking: { name: 'Net Banking', icon: '🏦', color: 'bg-indigo-100 text-indigo-800' },
      wallet: { name: 'Digital Wallet', icon: '👛', color: 'bg-orange-100 text-orange-800' }
    }
    return methods[paymentMethod] || { name: paymentMethod?.toUpperCase() || 'Unknown', icon: '❓', color: 'bg-gray-100 text-gray-800' }
  }

  const getPaymentStatusColor = (status) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return statusConfig[status] || statusConfig.pending
  }

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    return allStatuses.filter(status => status !== currentStatus)
  }

  const filteredOrders = statusFilter === 'all'
    ? items
    : items.filter(order => order.status === statusFilter)

  const getTotalRevenue = () => {
    return items.reduce((total, order) => total + (order.totalAmount || 0), 0)
  }

  const getOrdersByStatus = (status) => {
    return items.filter(order => order.status === status).length
  }

  const OrderStatusBadge = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )

  const StatusUpdateDropdown = ({ order }) => (
    <select
      value={order.status}
      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
      disabled={updateLoading}
      className="px-3 py-2 text-xs border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value={order.status}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </option>
      {getStatusOptions(order.status).map(status => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Orders Management
              </h1>
              <p className="text-lg text-gray-600">Manage customer orders and track delivery status</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Orders
              </button>
            </div>
          </div>
        </div>

        {/* Modern Error Alert */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 mb-2">Total Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">{items.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time orders</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">₹{getTotalRevenue().toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total earnings</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 mb-2">Pending Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-yellow-900 to-amber-900 bg-clip-text text-transparent">{getOrdersByStatus('pending')}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-600 mb-2">Completed Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">{getOrdersByStatus('completed')}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter and Orders List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    All Orders
                  </h2>
                  <p className="text-gray-600 mt-1 text-lg">Manage and track customer orders</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-bold text-gray-700">Filter by Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-6 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:shadow-xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100/50">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-5 h-5 text-blue-600" />
                              <p className="text-sm font-bold text-gray-700">Customer</p>
                            </div>
                            <p className="font-bold text-gray-900 text-lg">
                              {order.customer?.name || 'Guest User'}
                            </p>
                            {order.customer?.email && (
                              <p className="text-gray-600 text-sm mt-1">{order.customer.email}</p>
                            )}
                            {order.customer?.phone && (
                              <p className="text-gray-600 text-sm">{order.customer.phone}</p>
                            )}
                          </div>
                          <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-4 border border-green-100/50">
                            <div className="flex items-center gap-3 mb-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <p className="text-sm font-bold text-gray-700">Amount</p>
                            </div>
                            <p className="font-bold text-green-600 text-2xl">
                              ₹{order.total || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Subtotal: ₹{order.subtotal || 0}
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-4 border border-purple-100/50">
                            <div className="flex items-center gap-3 mb-2">
                              <CreditCard className="w-5 h-5 text-purple-600" />
                              <p className="text-sm font-bold text-gray-700">Payment</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getPaymentMethodInfo(order.paymentMethod).icon}</span>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">
                                  {getPaymentMethodInfo(order.paymentMethod).name}
                                </p>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                  {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-2xl p-4 border border-amber-100/50">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-amber-600" />
                              <p className="text-sm font-bold text-gray-700">Order Date</p>
                            </div>
                            <p className="font-bold text-gray-900 text-lg">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Items ({order.items.length}):</p>
                            <div className="space-y-1">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-700">{item.name || `Item ${index + 1}`}</span>
                                  <span className="text-gray-600">Qty: {item.quantity || 1}</span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{order.items.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {order.customer && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Shipping Address:</p>
                            <p className="text-sm text-gray-700">
                              {order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.zip}
                            </p>
                          </div>
                        )}

                        {/* Delivery Partner Information */}
                        {order.deliveryPartner?.partnerId ? (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Delivery Partner</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Partner:</span>
                                <span className="ml-2 font-medium text-gray-900">{order.deliveryPartner.partnerName}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${order.deliveryPartner.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.deliveryPartner.deliveryStatus === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                    order.deliveryPartner.deliveryStatus === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                  {order.deliveryPartner.deliveryStatus}
                                </span>
                              </div>
                              {order.deliveryPartner.trackingNumber && (
                                <div>
                                  <span className="text-gray-600">Tracking:</span>
                                  <span className="ml-2 font-mono text-gray-900">{order.deliveryPartner.trackingNumber}</span>
                                </div>
                              )}
                              {order.deliveryPartner.estimatedDelivery && (
                                <div>
                                  <span className="text-gray-600">Est. Delivery:</span>
                                  <span className="ml-2 text-gray-900">
                                    {new Date(order.deliveryPartner.estimatedDelivery).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-900">No Delivery Partner Assigned</span>
                            </div>
                            <p className="text-xs text-yellow-700">This order needs to be assigned to a delivery partner</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-3 ml-6">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          View Details
                        </button>

                        {!order.deliveryPartner?.partnerId ? (
                          <button
                            onClick={() => handleAssignOrder(order)}
                            className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                          >
                            <Truck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Assign Partner
                          </button>
                        ) : (
                          <div className="text-center bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-4 border border-green-100/50">
                            <p className="text-xs text-gray-700 mb-3 font-bold">Delivery Status</p>
                            <select
                              value={order.deliveryPartner.deliveryStatus}
                              onChange={(e) => handleDeliveryStatusUpdate(order._id, e.target.value)}
                              className="text-sm border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                            >
                              <option value="assigned">Assigned</option>
                              <option value="picked_up">Picked Up</option>
                              <option value="in_transit">In Transit</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        )}

                        <div className="text-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100/50">
                          <p className="text-xs text-gray-700 mb-3 font-bold">Update Status</p>
                          <StatusUpdateDropdown order={order} />
                        </div>

                        <button
                          onClick={() => handleOpenPaymentModal(order)}
                          className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Payment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
                <p className="text-lg text-gray-600">
                  {statusFilter === 'all' ? 'No orders have been placed yet.' : `No ${statusFilter} orders found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-gray-600 mt-1">Complete order information and tracking</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOrderDetails(false)
                  setSelectedOrder(null)
                }}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {currentOrder ? (
              <div className="space-y-8">
                {/* Modern Order Header */}
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                        Order #{currentOrder.orderNumber || currentOrder._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-lg text-gray-600 mt-2">
                        Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at {new Date(currentOrder.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{currentOrder.total || 0}</p>
                      <div className="mt-2">
                        <OrderStatusBadge status={currentOrder.status} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Modern Customer Information */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                        Customer Information
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700">Name:</span>
                        <span className="text-gray-900 font-semibold">{currentOrder.customer?.name || 'Guest User'}</span>
                      </div>
                      {currentOrder.customer?.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{currentOrder.customer.email}</span>
                        </div>
                      )}
                      {currentOrder.customer?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{currentOrder.customer.phone}</span>
                        </div>
                      )}
                      {currentOrder.user && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200/50">
                          <p className="text-sm text-blue-700 font-bold">Registered User</p>
                          <p className="text-sm text-blue-600">User ID: {currentOrder.user._id || currentOrder.user}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modern Payment Information */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                        Payment Information
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">Method:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getPaymentMethodInfo(currentOrder.paymentMethod).icon}</span>
                          <span className="text-gray-900 font-semibold">{getPaymentMethodInfo(currentOrder.paymentMethod).name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">Status:</span>
                        <span className={`px-4 py-2 text-sm rounded-full font-bold ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                          {currentOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      {currentOrder.paymentDetails?.transactionId && (
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-700">Transaction ID:</span>
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{currentOrder.paymentDetails.transactionId}</span>
                        </div>
                      )}
                      {currentOrder.paymentDetails?.paidAt && (
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-700">Paid At:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(currentOrder.paymentDetails.paidAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Order Summary
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium text-gray-900">₹{currentOrder.subtotal || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-medium text-gray-900">₹{currentOrder.shipping || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tax (GST)</p>
                        <p className="font-medium text-gray-900">₹{currentOrder.tax || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-bold text-green-600 text-lg">₹{currentOrder.total || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {currentOrder.items && currentOrder.items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Items ({currentOrder.items.length})
                    </h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      {currentOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name || `Item ${index + 1}`}</p>
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}
                              </p>
                            )}
                            {item.image && (
                              <div className="mt-2">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium text-gray-900">₹{item.price || 0}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                            <p className="text-sm font-medium text-green-600">
                              Total: ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {currentOrder.customer && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Shipping Address
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{currentOrder.customer.name}</p>
                        <p className="text-gray-700">{currentOrder.customer.address}</p>
                        <p className="text-gray-700">
                          {currentOrder.customer.city}, {currentOrder.customer.state} {currentOrder.customer.zip}
                        </p>
                        <p className="text-gray-700">{currentOrder.customer.country || 'India'}</p>
                        {currentOrder.customer.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-700 font-medium">Special Instructions:</p>
                            <p className="text-xs text-yellow-600">{currentOrder.customer.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowOrderDetails(false)
                      setSelectedOrder(null)
                    }}
                    className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                  >
                    Close
                  </button>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600">Update Status:</span>
                    <StatusUpdateDropdown order={currentOrder} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading order details...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Delivery Partner</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedOrder.customer?.name} - {selectedOrder.customer?.city}, {selectedOrder.customer?.state}
              </p>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Delivery Partner
                </label>
                <select
                  value={assignmentForm.partnerId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, partnerId: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  required
                >
                  <option value="">Choose a partner...</option>
                  {availablePartners.map((partner) => (
                    <option key={partner._id} value={partner._id}>
                      {partner.name} - {partner.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={assignmentForm.deliveryFee}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, deliveryFee: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={assignmentForm.estimatedDelivery}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, estimatedDelivery: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  rows={3}
                  placeholder="Special delivery instructions..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !assignmentForm.partnerId}
                  className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {assigning ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Assigning...
                    </div>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Assign Partner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Status Update Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedOrder.customer?.name} - ₹{selectedOrder.total}
                </p>
                <p className="text-xs text-gray-500">
                  Payment Method: {getPaymentMethodInfo(selectedOrder.paymentMethod).name}
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={paymentForm.paymentStatus}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    rows={3}
                    placeholder="Add notes about payment status change..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {updateLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Update Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


