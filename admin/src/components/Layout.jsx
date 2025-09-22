import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import {
  Home,
  FolderOpen,
  Package,
  ShoppingCart,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Image,
  ChefHat,
  Truck,
  RefreshCw
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const dispatch = useDispatch()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboards', icon: BarChart3 },
    { path: '/categories', label: 'Categories', icon: FolderOpen },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/kitchen-products', label: 'Kitchen Products', icon: ChefHat },
    { path: '/wardrobe-products', label: 'Wardrobe Products', icon: Settings },
    { path: '/1bhk-packages', label: '1BHK Packages', icon: Home },
    { path: '/2bhk-packages', label: '2BHK Packages', icon: Home },
    { path: '/delivery-partners', label: 'Delivery Partners', icon: Truck },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/users', label: 'Users', icon: User },
    { path: '/returns', label: 'Returns & Exchanges', icon: RefreshCw },
    { path: '/hero-section', label: 'Hero Section', icon: Image },
    { path: '/leads', label: 'Leads', icon: User },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-xl transform transition-all duration-300 ease-in-out z-50 lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HomeLineTeam
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    onClick={onClose}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const location = useLocation()

  const getPageTitle = () => {
    const currentPath = location.pathname
    const titles = {
      '/dashboard': 'Dashboard',
      '/categories': 'Categories',
      '/products': 'Products',
      '/kitchen-products': 'Kitchen Products',
      '/wardrobe-products': 'Wardrobe Products',
      '/1bhk-packages': '1BHK Packages',
      '/2bhk-packages': '2BHK Packages',
      '/delivery-partners': 'Delivery Partners',
      '/orders': 'Orders',
      '/users': 'Users',
      '/returns': 'Returns & Exchanges',
      '/hero-section': 'Hero Section',
      '/leads': 'Leads'
    }
    return titles[currentPath] || 'Admin Panel'
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(logout())}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Page Title and Description */}
      {/* <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h2>
        <p className="text-gray-600 mt-1">{getPageDescription()}</p>
      </div> */}
    </header>
  )
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
