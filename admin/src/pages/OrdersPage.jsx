import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../context/ToastContext'
import {
  listOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  clearError
} from '../store/slices/orderSlice'
import apiClient from '../api/client'
import config from '../config/config'
import {
  Truck, Package, Clock, CheckCircle, User, Phone, Mail,
  RefreshCw, CreditCard, IndianRupee, MapPin, X, Eye, ChevronDown
} from 'lucide-react'

// ─── Modal Shell ───────────────────────────────────────────────────────────────
function Modal({ open, onClose, maxWidth = 'max-w-4xl', children }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col w-full ${maxWidth}`}
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

function ModalHeader({ icon: Icon, iconBg = 'bg-blue-50', iconColor = 'text-blue-600', title, subtitle, onClose }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

function ModalBody({ children }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
      {children}
    </div>
  )
}

function ModalFooter({ children }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
      {children}
    </div>
  )
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-500',    pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped:   { label: 'Shipped',   dot: 'bg-indigo-500',  pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',     pill: 'bg-red-50 text-red-700 border-red-200' },
}
const PAYMENT_CFG = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:     { label: 'Paid',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:   { label: 'Failed',   cls: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Refunded', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.pill}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function PaymentPill({ status }) {
  const cfg = PAYMENT_CFG[status] || PAYMENT_CFG.pending
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, iconBg, iconColor, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          {loading
            ? <div className="mt-2 h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
            : <p className="mt-1.5 text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          }
          {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = {
  cod:        { name: 'Cash on Delivery', icon: '💰' },
  card:       { name: 'Card',             icon: '💳' },
  upi:        { name: 'UPI',              icon: '📱' },
  netbanking: { name: 'Net Banking',      icon: '🏦' },
  wallet:     { name: 'Wallet',           icon: '👛' },
}
const pmInfo = m => PAYMENT_METHODS[m] || { name: m?.toUpperCase() || 'Unknown', icon: '❓' }

function productLink(item) {
  const slug = item.slug || item.productId?.slug
  return slug ? `${config.FRONTEND_BASE_URL?.replace(/\/$/, '')}/products/${slug}` : null
}

const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

// ─── Detail Info Block ─────────────────────────────────────────────────────────
function DetailBlock({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const dispatch = useDispatch()
  const { items, currentOrder, loading, error, updateLoading } = useSelector(s => s.orders)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availablePartners, setAvailablePartners] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({ partnerId: '', deliveryFee: '', estimatedDelivery: '', notes: '' })

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ paymentStatus: '', notes: '' })

  const { showToast } = useToast()
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => { dispatch(listOrders()) }, [dispatch])

  useEffect(() => {
    if (error) {
      showToast('error', error)
      const t = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(t)
    }
  }, [error, dispatch, showToast])

  const handleStatusUpdate = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }))
    setOpenDropdown(null)
  }

  const handleOpenPaymentModal = (order) => {
    setSelectedOrder(order)
    setPaymentForm({ paymentStatus: order.paymentStatus || 'pending', notes: '' })
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (!selectedOrder || !paymentForm.paymentStatus) return
    dispatch(updatePaymentStatus({ id: selectedOrder._id, paymentStatus: paymentForm.paymentStatus, notes: paymentForm.notes }))
    setShowPaymentModal(false)
    setSelectedOrder(null)
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
    dispatch(getOrderById(order._id))
  }

  const handleCloseDetails = () => { setShowOrderDetails(false); setSelectedOrder(null) }

  const handleAssignOrder = async (order) => {
    setSelectedOrder(order)
    setShowAssignModal(true)
    try {
      const res = await apiClient.get(`/orders/available-partners?city=${order.customer?.city}&state=${order.customer?.state}&pincode=${order.customer?.zip}`)
      setAvailablePartners(res.data || res)
    } catch { setAvailablePartners([]) }
  }

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault()
    if (!assignmentForm.partnerId) return
    setAssigning(true)
    try {
      await apiClient.post(`/orders/${selectedOrder._id}/assign`, assignmentForm)
      setShowAssignModal(false)
      setAssignmentForm({ partnerId: '', deliveryFee: '', estimatedDelivery: '', notes: '' })
      dispatch(listOrders())
      showToast('success', 'Delivery partner assigned')
    } catch { showToast('error', 'Failed to assign partner') }
    finally { setAssigning(false) }
  }

  const handleDeliveryStatusUpdate = async (orderId, status) => {
    try {
      await apiClient.patch(`/orders/${orderId}/delivery-status`, { deliveryStatus: status })
      dispatch(listOrders())
    } catch { showToast('error', 'Failed to update delivery status') }
  }

  const filteredOrders = statusFilter === 'all' ? items : items.filter(o => o.status === statusFilter)
  const totalRevenue = items.reduce((s, o) => s + (o.total || 0), 0)
  const pendingCount = items.filter(o => o.status === 'pending').length
  const deliveredCount = items.filter(o => o.status === 'delivered').length

  return (
    <div className="space-y-6" onClick={() => setOpenDropdown(null)}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} total orders</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); dispatch(listOrders()) }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders"   value={items.length}  sub="All time" icon={Package}      iconBg="bg-blue-50"    iconColor="text-blue-600"    loading={loading} />
        <StatCard title="Revenue"        value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="Total earned" icon={IndianRupee} iconBg="bg-emerald-50" iconColor="text-emerald-600" loading={loading} />
        <StatCard title="Pending"        value={pendingCount}  sub="Need action" icon={Clock}        iconBg="bg-amber-50"   iconColor="text-amber-500"   loading={loading} />
        <StatCard title="Delivered"      value={deliveredCount} sub="Completed" icon={CheckCircle}  iconBg="bg-green-50"   iconColor="text-green-600"   loading={loading} />
      </div>

      {/* ── Orders Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {FILTER_TABS.map(tab => {
              const count = tab.key === 'all' ? items.length : items.filter(o => o.status === tab.key).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${statusFilter === tab.key
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                  {tab.key !== 'all' && count > 0 && (
                    <span className={`ml-1.5 text-xs font-bold ${statusFilter === tab.key ? 'text-blue-600' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-sm text-gray-400 font-medium">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Scrollable table area */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: '1060px' }}>

            {/* Table Header — must use SAME cols + gap as rows */}
            {!loading && filteredOrders.length > 0 && (
              <div
                className="grid items-center px-6 py-3 gap-x-3 bg-gray-50 border-b border-gray-100"
                style={{ gridTemplateColumns: '132px 210px 72px 112px 148px 140px 116px' }}
              >
                {['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Actions'].map((h, i) => (
                  <span key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-widest ${i === 6 ? 'text-right' : ''}`}>{h}</span>
                ))}
              </div>
            )}

            {/* Rows */}
            {loading ? (
              <div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid items-center px-6 py-5 gap-x-3 border-b border-gray-50"
                    style={{ gridTemplateColumns: '132px 210px 72px 112px 148px 140px 116px' }}
                  >
                    <div className="h-5 w-28 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-5 w-40 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-5 w-10 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-5 w-20 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-7 w-24 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse ml-auto" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">No orders found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {statusFilter === 'all' ? 'No orders have been placed yet.' : `No ${statusFilter} orders.`}
                </p>
              </div>
            ) : (
              <div>
                {filteredOrders.map(order => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    updateLoading={updateLoading}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    onView={() => handleViewOrder(order)}
                    onAssign={() => handleAssignOrder(order)}
                    onPayment={() => handleOpenPaymentModal(order)}
                    onStatusChange={(s) => handleStatusUpdate(order._id, s)}
                    onDeliveryStatus={(s) => handleDeliveryStatusUpdate(order._id, s)}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Order Details Modal ── */}
      <Modal open={showOrderDetails && !!selectedOrder} onClose={handleCloseDetails}>
        <ModalHeader
          icon={Package}
          title={`Order #${selectedOrder?.orderNumber || selectedOrder?._id?.slice(-8).toUpperCase()}`}
          subtitle={selectedOrder ? `Placed ${new Date(selectedOrder.createdAt).toLocaleString()}` : ''}
          onClose={handleCloseDetails}
        />
        <ModalBody>
          {currentOrder ? (
            <div className="space-y-5">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-3xl font-bold text-gray-900">₹{(currentOrder.total || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Subtotal ₹{currentOrder.subtotal || 0} · Shipping ₹{currentOrder.shipping || 0} · Tax ₹{currentOrder.tax || 0}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusPill status={currentOrder.status} />
                  <PaymentPill status={currentOrder.paymentStatus} />
                </div>
              </div>

              {/* Customer + Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailBlock icon={User} iconBg="bg-blue-50" iconColor="text-blue-600" title="Customer">
                  <p className="font-semibold text-gray-900 text-base">{currentOrder.customer?.name || 'Guest'}</p>
                  {currentOrder.customer?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1.5">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />{currentOrder.customer.email}
                    </div>
                  )}
                  {currentOrder.customer?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />{currentOrder.customer.phone}
                    </div>
                  )}
                </DetailBlock>

                <DetailBlock icon={CreditCard} iconBg="bg-purple-50" iconColor="text-purple-600" title="Payment">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{pmInfo(currentOrder.paymentMethod).icon}</span>
                    <span className="font-semibold text-gray-900">{pmInfo(currentOrder.paymentMethod).name}</span>
                  </div>
                  <PaymentPill status={currentOrder.paymentStatus} />
                  {currentOrder.paymentDetails?.transactionId && (
                    <p className="text-xs font-mono text-gray-400 mt-2 bg-gray-100 px-2 py-1 rounded-lg truncate">
                      {currentOrder.paymentDetails.transactionId}
                    </p>
                  )}
                  {currentOrder.razorpayPaymentId && currentOrder.paymentStatus === 'paid' && (
                    <button
                      className="mt-3 w-full text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
                      onClick={async () => {
                        if (!window.confirm('Initiate a refund for this order?')) return
                        try {
                          await apiClient.post(`/orders/${currentOrder._id}/refund`)
                          dispatch(listOrders())
                          showToast('success', 'Refund initiated')
                        } catch (err) {
                          showToast('error', err.response?.data?.message || 'Refund failed')
                        }
                      }}
                    >
                      Initiate Razorpay Refund
                    </button>
                  )}
                </DetailBlock>
              </div>

              {/* Shipping */}
              {currentOrder.customer && (
                <DetailBlock icon={MapPin} iconBg="bg-orange-50" iconColor="text-orange-500" title="Shipping Address">
                  <p className="font-semibold text-gray-900">{currentOrder.customer.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{currentOrder.customer.address}</p>
                  <p className="text-sm text-gray-600">
                    {currentOrder.customer.city}, {currentOrder.customer.state} {currentOrder.customer.zip}
                  </p>
                  <p className="text-sm text-gray-600">{currentOrder.customer.country || 'India'}</p>
                  {currentOrder.customer.notes && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs text-amber-700">Note: {currentOrder.customer.notes}</p>
                    </div>
                  )}
                </DetailBlock>
              )}

              {/* Items */}
              {currentOrder.items?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Order Items ({currentOrder.items.length})
                  </p>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    {currentOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-11 h-11 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                          : <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.name || `Item ${i + 1}`}</p>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                            </p>
                          )}
                          {productLink(item) && (
                            <a href={productLink(item)} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                              View Product ↗
                            </a>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(0)}</p>
                          <p className="text-xs text-gray-400">₹{item.price} × {item.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Partner */}
              {currentOrder.deliveryPartner?.partnerId && (
                <DetailBlock icon={Truck} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Delivery Partner">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Partner</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{currentOrder.deliveryPartner.partnerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="font-semibold text-gray-900 mt-0.5 capitalize">{currentOrder.deliveryPartner.deliveryStatus}</p>
                    </div>
                    {currentOrder.deliveryPartner.trackingNumber && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400">Tracking #</p>
                        <p className="font-mono text-gray-900 mt-0.5">{currentOrder.deliveryPartner.trackingNumber}</p>
                      </div>
                    )}
                    {currentOrder.deliveryPartner.estimatedDelivery && (
                      <div>
                        <p className="text-xs text-gray-400">Est. Delivery</p>
                        <p className="font-semibold text-gray-900 mt-0.5">
                          {new Date(currentOrder.deliveryPartner.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </DetailBlock>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600" />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {currentOrder && (
            <>
              <span className="text-sm text-gray-500 mr-auto font-medium">Update Status</span>
              <select
                value={currentOrder.status}
                onChange={e => dispatch(updateOrderStatus({ id: currentOrder._id, status: e.target.value }))}
                disabled={updateLoading}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </>
          )}
          <button onClick={handleCloseDetails} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Close
          </button>
        </ModalFooter>
      </Modal>

      {/* ── Assign Partner Modal ── */}
      <Modal open={showAssignModal && !!selectedOrder} onClose={() => setShowAssignModal(false)} maxWidth="max-w-md">
        <ModalHeader
          icon={Truck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="Assign Delivery Partner"
          subtitle={selectedOrder ? `Order #${selectedOrder._id.slice(-8).toUpperCase()} · ${selectedOrder.customer?.name}` : ''}
          onClose={() => setShowAssignModal(false)}
        />
        <ModalBody>
          <form id="assign-form" onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Partner <span className="text-red-500">*</span></label>
              <select
                value={assignmentForm.partnerId}
                onChange={e => setAssignmentForm({ ...assignmentForm, partnerId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Choose a partner…</option>
                {availablePartners.map(p => (
                  <option key={p._id} value={p._id}>{p.name} — {p.companyName}</option>
                ))}
              </select>
              {availablePartners.length === 0 && (
                <p className="text-xs text-amber-600 mt-1.5">No partners available for this location.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Fee (₹)</label>
              <input
                type="number"
                value={assignmentForm.deliveryFee}
                onChange={e => setAssignmentForm({ ...assignmentForm, deliveryFee: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Est. Delivery Date</label>
              <input
                type="date"
                value={assignmentForm.estimatedDelivery}
                onChange={e => setAssignmentForm({ ...assignmentForm, estimatedDelivery: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
              <textarea
                value={assignmentForm.notes}
                onChange={e => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Special delivery instructions…"
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            form="assign-form" type="submit"
            disabled={assigning || !assignmentForm.partnerId}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {assigning
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Assigning…</>
              : <><Truck className="w-4 h-4" />Assign Partner</>
            }
          </button>
        </ModalFooter>
      </Modal>

      {/* ── Payment Status Modal ── */}
      <Modal open={showPaymentModal && !!selectedOrder} onClose={() => setShowPaymentModal(false)} maxWidth="max-w-md">
        <ModalHeader
          icon={CreditCard}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          title="Update Payment Status"
          subtitle={selectedOrder ? `Order #${selectedOrder._id.slice(-8).toUpperCase()} · ₹${selectedOrder.total?.toLocaleString('en-IN')}` : ''}
          onClose={() => setShowPaymentModal(false)}
        />
        <ModalBody>
          <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
              <p className="text-sm font-semibold text-gray-900">{selectedOrder?.customer?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pmInfo(selectedOrder?.paymentMethod).icon} {pmInfo(selectedOrder?.paymentMethod).name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Status <span className="text-red-500">*</span></label>
              <select
                value={paymentForm.paymentStatus}
                onChange={e => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Notes about this payment status change…"
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            form="payment-form" type="submit"
            disabled={updateLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {updateLoading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</>
              : <><CreditCard className="w-4 h-4" />Update Payment</>
            }
          </button>
        </ModalFooter>
      </Modal>

    </div>
  )
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({ order, updateLoading, openDropdown, setOpenDropdown, onView, onAssign, onPayment, onStatusChange, onDeliveryStatus }) {
  const isOpen = openDropdown === order._id
  const itemCount = order.items?.length || 0

  return (
    <div className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/70 transition-colors">

      {/* Main row — cols + gap-x-3 must match the header exactly */}
      <div
        className="grid items-center px-6 py-5 gap-x-3"
        style={{ gridTemplateColumns: '132px 210px 72px 112px 148px 140px 116px' }}
      >
        {/* Order ID + Date */}
        <div>
          <p className="text-[15px] font-bold text-gray-900 font-mono">
            #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Customer — no truncate, full name always visible */}
        <div>
          <p className="text-[15px] font-semibold text-gray-900 leading-snug">
            {order.customer?.name || 'Guest'}
          </p>
          <p className="text-sm text-gray-400 mt-0.5 leading-snug">
            {order.customer?.phone || '—'}
          </p>
        </div>

        {/* Items */}
        <div>
          <p className="text-[15px] font-bold text-gray-800">{itemCount}</p>
          <p className="text-sm text-gray-400 mt-0.5">{itemCount === 1 ? 'item' : 'items'}</p>
        </div>

        {/* Amount */}
        <div>
          <p className="text-[15px] font-bold text-gray-900">
            ₹{(order.total || 0).toLocaleString('en-IN')}
          </p>
          {order.subtotal && order.subtotal !== order.total && (
            <p className="text-sm text-gray-400 mt-0.5">Sub ₹{order.subtotal?.toLocaleString('en-IN')}</p>
          )}
        </div>

        {/* Payment */}
        <div className="space-y-1.5">
          <PaymentPill status={order.paymentStatus} />
          <p className="text-sm text-gray-400">
             {pmInfo(order.paymentMethod).name}
          </p>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <StatusPill status={order.status} />
          {order.deliveryPartner?.partnerId && (
            <p className="text-sm text-indigo-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{order.deliveryPartner.partnerName?.split(' ')[0]}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          {/* View — blue */}
          <button
            onClick={onView}
            title="View Details"
            className="rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
            style={{ width: 36, height: 36 }}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Payment — purple */}
          <button
            onClick={onPayment}
            title="Update Payment"
            className="rounded-full bg-purple-500 text-white hover:bg-purple-600 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
            style={{ width: 36, height: 36 }}
          >
            <CreditCard className="w-4 h-4" />
          </button>

          {/* Assign — green (only if no partner yet) */}
          {!order.deliveryPartner?.partnerId && (
            <button
              onClick={onAssign}
              title="Assign Partner"
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <Truck className="w-4 h-4" />
            </button>
          )}

          {/* Status dropdown — slate */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : order._id) }}
              disabled={updateLoading}
              title="Change Status"
              className={`rounded-full flex items-center justify-center transition-colors shadow-sm disabled:opacity-40
                ${isOpen ? 'bg-slate-600 text-white' : 'bg-slate-500 text-white hover:bg-slate-600'}`}
              style={{ width: 36, height: 36 }}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 py-2 w-44">
                <p className="px-4 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Set Status</p>
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                      ${s === order.status
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CFG[s]?.dot}`} />
                    {STATUS_CFG[s]?.label}
                    {s === order.status && <span className="ml-auto text-blue-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery sub-row — only when partner assigned */}
      {order.deliveryPartner?.partnerId && (
        <div
          className="flex items-center gap-3 px-6 pb-4"
          style={{ paddingLeft: 'calc(1.5rem + 132px + 0.75rem)' }}
          onClick={e => e.stopPropagation()}
        >
          <Truck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Delivery:</span>
          <select
            value={order.deliveryPartner.deliveryStatus}
            onChange={e => onDeliveryStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-medium"
          >
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
          <span className="text-sm text-gray-400">{order.deliveryPartner.partnerName}</span>
        </div>
      )}
    </div>
  )
}
