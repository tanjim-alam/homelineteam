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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 mt-2">Manage customer orders</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{items.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{getTotalRevenue().toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{getOrdersByStatus('pending')}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{getOrdersByStatus('completed')}</p>
            </div>
            <div className="p-3 rounded-full bg-emerald-50">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
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

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Customer</p>
                          <p className="font-medium text-gray-900">
                            {order.customer?.name || 'Guest User'}
                          </p>
                          {order.customer?.email && (
                            <p className="text-gray-500">{order.customer.email}</p>
                          )}
                          {order.customer?.phone && (
                            <p className="text-gray-500">{order.customer.phone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-medium text-green-600 text-lg">
                            ₹{order.total || 0}
                          </p>
                          <p className="text-xs text-gray-500">
                            Subtotal: ₹{order.subtotal || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPaymentMethodInfo(order.paymentMethod).icon}</span>
                            <div>
                              <p className="font-medium text-gray-900 text-xs">
                                {getPaymentMethodInfo(order.paymentMethod).name}
                              </p>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus?.toUpperCase() || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-xs">
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

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                      >
                        View Details
                      </button>

                      {!order.deliveryPartner?.partnerId ? (
                        <button
                          onClick={() => handleAssignOrder(order)}
                          className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Assign Partner
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-2 font-medium">Delivery Status</p>
                          <select
                            value={order.deliveryPartner.deliveryStatus}
                            onChange={(e) => handleDeliveryStatusUpdate(order._id, e.target.value)}
                            className="text-xs border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
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

                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Update Status</p>
                        <StatusUpdateDropdown order={order} />
                      </div>

                      <button
                        onClick={() => handleOpenPaymentModal(order)}
                        className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
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
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all' ? 'No orders have been placed yet.' : `No ${statusFilter} orders found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => {
                  setShowOrderDetails(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {currentOrder ? (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{currentOrder.orderNumber || currentOrder._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at {new Date(currentOrder.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{currentOrder.total || 0}</p>
                      <OrderStatusBadge status={currentOrder.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-900">{currentOrder.customer?.name || 'Guest User'}</span>
                      </div>
                      {currentOrder.customer?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{currentOrder.customer.email}</span>
                        </div>
                      )}
                      {currentOrder.customer?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{currentOrder.customer.phone}</span>
                        </div>
                      )}
                      {currentOrder.user && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium">Registered User</p>
                          <p className="text-xs text-blue-600">User ID: {currentOrder.user._id || currentOrder.user}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Method:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPaymentMethodInfo(currentOrder.paymentMethod).icon}</span>
                          <span className="text-gray-900">{getPaymentMethodInfo(currentOrder.paymentMethod).name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`px-3 py-1 text-sm rounded-full ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                          {currentOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      {currentOrder.paymentDetails?.transactionId && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Transaction ID:</span>
                          <span className="text-xs font-mono text-gray-600">{currentOrder.paymentDetails.transactionId}</span>
                        </div>
                      )}
                      {currentOrder.paymentDetails?.paidAt && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Paid At:</span>
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


