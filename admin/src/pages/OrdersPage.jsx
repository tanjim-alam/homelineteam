import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  listOrders,
  getOrderById,
  updateOrderStatus,
  clearError
} from '../store/slices/orderSlice'
import apiClient from '../api/client'
import { Truck, Package, Clock, CheckCircle, XCircle, User, Phone, Mail } from 'lucide-react'

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
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      shipped: 'bg-purple-100 text-purple-800'
    }
    return statusConfig[status] || statusConfig.pending
  }

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
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
      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
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
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-gray-600">Customer</p>
                          <p className="font-medium text-gray-900">
                            {order.customer?.name || 'Guest User'}
                          </p>
                          {order.customer?.email && (
                            <p className="text-gray-500">{order.customer.email}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-medium text-green-600 text-lg">
                            ₹{order.total || 0}
                          </p>
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
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>

                      {!order.deliveryPartner?.partnerId ? (
                        <button
                          onClick={() => handleAssignOrder(order)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          Assign Partner
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-1">Delivery Status</p>
                          <select
                            value={order.deliveryPartner.deliveryStatus}
                            onChange={(e) => handleDeliveryStatusUpdate(order._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
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
                        <p className="text-xs text-gray-600 mb-1">Update Status</p>
                        <StatusUpdateDropdown order={order} />
                      </div>
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p><span className="font-medium">Name:</span> {currentOrder.customer?.name || 'Guest User'}</p>
                      <p><span className="font-medium">Email:</span> {currentOrder.customer?.email || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {currentOrder.customer?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p><span className="font-medium">Status:</span> <OrderStatusBadge status={currentOrder.status} /></p>
                      <p><span className="font-medium">Total:</span> ₹{currentOrder.total || 0}</p>
                      <p><span className="font-medium">Payment Method:</span> {currentOrder.paymentMethod?.toUpperCase() || 'N/A'}</p>
                      <p><span className="font-medium">Payment Status:</span>
                        <span className={`ml-1 ${currentOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {currentOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </p>
                      <p><span className="font-medium">Date:</span> {new Date(currentOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {currentOrder.items && currentOrder.items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {currentOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="font-medium">{item.name || `Item ${index + 1}`}</p>
                            <p className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.price || 0}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentOrder.customer && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p>{currentOrder.customer.address}</p>
                      <p>{currentOrder.customer.city}, {currentOrder.customer.state} {currentOrder.customer.zip}</p>
                      <p>{currentOrder.customer.country || 'India'}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowOrderDetails(false)
                      setSelectedOrder(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Update Status:</span>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Special delivery instructions..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !assignmentForm.partnerId}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {assigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      Assign Partner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


