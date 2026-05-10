import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../store/slices/productSlice'
import { listCategories } from '../store/slices/categorySlice'
import { listOrders } from '../store/slices/orderSlice'
import { getDashboardAnalytics } from '../store/slices/analyticsSlice'
import {
  Package,
  FolderOpen,
  ShoppingCart,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
      {status}
    </span>
  )
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, loading, growth }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="h-7 w-16 bg-gray-200 rounded-lg animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
          )}
          <p className="text-sm text-gray-500 truncate">{title}</p>
        </div>
        {growth != null && !loading && (
          <div className={`ml-auto flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { items: products, loading: productsLoading } = useSelector(s => s.products)
  const { items: categories, loading: categoriesLoading } = useSelector(s => s.categories)
  const { items: orders, loading: ordersLoading } = useSelector(s => s.orders)
  const { dashboardData, loading: analyticsLoading } = useSelector(s => s.analytics)

  useEffect(() => {
    dispatch(listProducts())
    dispatch(listCategories())
    dispatch(listOrders())
    dispatch(getDashboardAnalytics())
  }, [dispatch])

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const lowStock = products.filter(p => (p.stock || 0) < 10).length
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)

  const topCategories = (() => {
    const counts = {}
    products.forEach(p => {
      const name = categories.find(c => c._id === p.categoryId)?.name || 'Uncategorized'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5)
  })()

  const overview = dashboardData?.overview

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          loading={productsLoading}
        />
        <StatCard
          title="Total Categories"
          value={categories.length}
          icon={FolderOpen}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          loading={categoriesLoading}
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={ordersLoading}
          growth={overview?.orderCountGrowth}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          loading={ordersLoading}
          growth={overview?.revenueGrowth}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Clock}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          loading={ordersLoading}
        />
        <StatCard
          title="Delivered Orders"
          value={deliveredOrders}
          icon={CheckCircle}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          loading={ordersLoading}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStock}
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          loading={productsLoading}
        />
        <StatCard
          title="Total Users"
          value={overview?.totalUsers ?? '—'}
          icon={Users}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          loading={analyticsLoading}
        />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <span className="text-xs text-gray-400">{orders.length} total</span>
          </div>
          <div className="divide-y divide-gray-50">
            {ordersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-mono text-gray-500 w-20 flex-shrink-0">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{order.customer?.name || 'Guest'}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">₹{(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Categories</h3>
          </div>
          <div className="p-5 space-y-4">
            {categoriesLoading || productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
            ) : topCategories.length > 0 ? (
              topCategories.map(([name, count], i) => {
                const max = topCategories[0][1]
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-medium truncate">{name}</span>
                      <span className="text-sm font-bold text-gray-900 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
