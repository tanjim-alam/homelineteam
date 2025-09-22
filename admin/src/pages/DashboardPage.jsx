import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../store/slices/productSlice'
import { listCategories } from '../store/slices/categorySlice'
import { listOrders } from '../store/slices/orderSlice'
import { getDashboardAnalytics, getRouteInfo } from '../store/slices/analyticsSlice'
import {
  Package,
  FolderOpen,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  BarChart3,
  Eye,
  Users,
  RotateCcw,
  Route,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { items: products, loading: productsLoading } = useSelector(s => s.products)
  const { items: categories, loading: categoriesLoading } = useSelector(s => s.categories)
  const { items: orders, loading: ordersLoading } = useSelector(s => s.orders)
  const { dashboardData, routeInfo, loading: analyticsLoading } = useSelector(s => s.analytics)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    dispatch(listProducts())
    dispatch(listCategories())
    dispatch(listOrders())
    dispatch(getDashboardAnalytics())
    dispatch(getRouteInfo())
  }, [dispatch])

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + (order.totalAmount || 0), 0)
  }

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending').length
  }

  const getCompletedOrders = () => {
    return orders.filter(order => order.status === 'completed').length
  }

  const getLowStockProducts = () => {
    return products.filter(product => (product.stock || 0) < 10).length
  }

  const getRecentOrders = () => {
    return orders.slice(0, 5).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getTopCategories = () => {
    const categoryCounts = {}
    products.forEach(product => {
      const categoryName = categories.find(cat => cat._id === product.categoryId)?.name || 'Uncategorized'
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
    })
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const StatCard = ({ title, value, icon: Icon, color, bgColor, loading, trend }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <TrendingUp className={`w-3 h-3 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${bgColor}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  )

  const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Pending' },
      processing: { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Processing' },
      completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Completed' },
      cancelled: { color: 'bg-red-50 text-red-700 border-red-200', text: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const TrendIndicator = ({ value, isPositive = true }) => {
    const isUp = isPositive ? value > 0 : value < 0
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
        {isUp ? (
          <ArrowUpRight className="w-3 h-3 text-green-600" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-red-600" />
        )}
        <span>{Math.abs(value)}%</span>
      </div>
    )
  }

  const RouteCard = ({ route }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded ${route.method === 'GET' ? 'bg-green-100 text-green-700' :
            route.method === 'POST' ? 'bg-blue-100 text-blue-700' :
              route.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                route.method === 'PATCH' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
          }`}>
          {route.method}
        </span>
        <span className="text-xs text-gray-500">{route.category}</span>
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{route.path}</h4>
      <p className="text-sm text-gray-600">{route.description}</p>
    </div>
  )

  const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-center text-gray-500 py-8">No data available</div>

    const maxRevenue = Math.max(...data.map(d => d.revenue))

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Revenue (Last 30 Days)</h3>
        <div className="flex items-end space-x-1 h-64">
          {data.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                style={{ height: `${(day.revenue / maxRevenue) * 200}px` }}
              ></div>
              <div className="text-xs text-gray-500 mt-2">
                {day._id.day}
              </div>
              <div className="text-xs text-gray-700 font-medium">
                ₹{day.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 mt-3">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analytics'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'routes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          API Routes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={products.length}
              icon={Package}
              color="text-blue-600"
              bgColor="bg-blue-50"
              loading={productsLoading}
            />
            <StatCard
              title="Total Categories"
              value={categories.length}
              icon={FolderOpen}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              loading={categoriesLoading}
            />
            <StatCard
              title="Total Orders"
              value={orders.length}
              icon={ShoppingCart}
              color="text-purple-600"
              bgColor="bg-purple-50"
              loading={ordersLoading}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${getTotalRevenue().toLocaleString()}`}
              icon={DollarSign}
              color="text-amber-600"
              bgColor="bg-amber-50"
              loading={ordersLoading}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Orders"
              value={getPendingOrders()}
              icon={Clock}
              color="text-amber-600"
              bgColor="bg-amber-50"
              loading={ordersLoading}
            />
            <StatCard
              title="Completed Orders"
              value={getCompletedOrders()}
              icon={CheckCircle}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              loading={ordersLoading}
            />
            <StatCard
              title="Low Stock Products"
              value={getLowStockProducts()}
              icon={AlertTriangle}
              color="text-red-600"
              bgColor="bg-red-50"
              loading={productsLoading}
            />
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : getRecentOrders().length > 0 ? (
                  <div className="space-y-4">
                    {getRecentOrders().map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</p>
                            <p className="text-sm text-gray-600">₹{order.totalAmount || 0}</p>
                          </div>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No orders found</p>
                    <p className="text-sm text-gray-400">Orders will appear here once they're created</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Top Categories</h3>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {categoriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : getTopCategories().length > 0 ? (
                  <div className="space-y-4">
                    {getTopCategories().map(([category, count], index) => (
                      <div key={category} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${index === 0 ? 'bg-gradient-to-br from-amber-100 to-orange-100' :
                            index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200' :
                              index === 2 ? 'bg-gradient-to-br from-amber-100 to-yellow-100' :
                                'bg-gradient-to-br from-blue-100 to-purple-100'
                            }`}>
                            <span className={`text-sm font-bold ${index === 0 ? 'text-amber-700' :
                              index === 1 ? 'text-gray-700' :
                                index === 2 ? 'text-amber-700' :
                                  'text-blue-700'
                              }`}>{index + 1}</span>
                          </div>
                          <span className="font-medium text-gray-900">{category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500">products</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No categories found</p>
                    <p className="text-sm text-gray-400">Categories will appear here once they're created</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-gray-600">Get started with these common tasks</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="group p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-md">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-lg mb-2">Add Product</p>
                  <p className="text-gray-600">Create a new product listing</p>
                </div>
              </button>

              <button className="group p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 transition-all duration-200 hover:shadow-md">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <FolderOpen className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-lg mb-2">Add Category</p>
                  <p className="text-gray-600">Organize your products</p>
                </div>
              </button>

              <button className="group p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-200 hover:shadow-md">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-lg mb-2">View Analytics</p>
                  <p className="text-gray-600">Detailed reports & insights</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                  <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : dashboardData ? (
            <>
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="This Month Orders"
                  value={dashboardData.overview.thisMonthOrders}
                  icon={ShoppingCart}
                  color="text-purple-600"
                  bgColor="bg-purple-50"
                  trend={dashboardData.overview.orderCountGrowth}
                />
                <StatCard
                  title="This Month Revenue"
                  value={`₹${dashboardData.overview.thisMonthRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="text-amber-600"
                  bgColor="bg-amber-50"
                  trend={dashboardData.overview.revenueGrowth}
                />
                <StatCard
                  title="Total Users"
                  value={dashboardData.overview.totalUsers}
                  icon={Users}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <StatCard
                  title="Total Returns"
                  value={dashboardData.overview.totalReturns}
                  icon={RotateCcw}
                  color="text-red-600"
                  bgColor="bg-red-50"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <RevenueChart data={dashboardData.charts.dailyRevenue} />
                </div>

                {/* Orders by Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
                  <div className="space-y-3">
                    {dashboardData.charts.ordersByStatus.map((status, index) => (
                      <div key={status._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${status._id === 'pending' ? 'bg-amber-500' :
                              status._id === 'processing' ? 'bg-blue-500' :
                                status._id === 'completed' ? 'bg-green-500' :
                                  'bg-red-500'
                            }`}></div>
                          <span className="font-medium text-gray-900 capitalize">{status._id}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                <div className="space-y-4">
                  {dashboardData.charts.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          {product.productImage && (
                            <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.productName}</h4>
                          <p className="text-sm text-gray-600">Quantity: {product.totalQuantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{product.totalRevenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No analytics data available</p>
            </div>
          )}
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-8">
          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : routeInfo ? (
            <>
              {/* Route Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">API Routes</h3>
                    <p className="text-gray-600">Complete list of available API endpoints</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{routeInfo.totalRoutes}</p>
                    <p className="text-sm text-gray-600">Total Routes</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {routeInfo.categories.map(category => (
                    <span key={category} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Routes by Category */}
              <div className="space-y-8">
                {Object.entries(routeInfo.routes).map(([category, routes]) => (
                  <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Route className="w-5 h-5 mr-2 text-blue-600" />
                      {category}
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {routes.length} routes
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {routes.map((route, index) => (
                        <RouteCard key={index} route={route} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No route information available</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
