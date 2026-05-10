import { useState, useEffect } from 'react'
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
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Layers,
  Building2,
  Tag,
  SlidersHorizontal,
  Mail,
} from 'lucide-react'

const INTERIOR_CHILDREN = [
  { path: '/kitchen-products',  label: 'Kitchen Products',  icon: ChefHat },
  { path: '/wardrobe-products', label: 'Wardrobe Products', icon: Settings },
  { path: '/1bhk-packages',     label: '1BHK Packages',     icon: Building2 },
  { path: '/2bhk-packages',     label: '2BHK Packages',     icon: Building2 },
]

const SETTINGS_CHILDREN = [
  { path: '/hero-section',    label: 'Hero Section',    icon: Image },
  { path: '/offer-banner',    label: 'Offer Banner',    icon: Tag },
  { path: '/admin-settings',  label: 'Email Settings',  icon: Mail },
]

const menuItems = [
  { path: '/dashboard',         label: 'Dashboard',          icon: BarChart3 },
  { path: '/categories',        label: 'Categories',         icon: FolderOpen },
  { path: '/products',          label: 'Products',           icon: Package },
  {
    key: 'interior-design',
    label: 'Interior Design',
    icon: Layers,
    children: INTERIOR_CHILDREN,
  },
  { path: '/delivery-partners', label: 'Delivery Partners',  icon: Truck },
  { path: '/orders',            label: 'Orders',             icon: ShoppingCart },
  { path: '/users',             label: 'Users',              icon: User },
  { path: '/leads',             label: 'Leads',              icon: User },
  { path: '/returns',           label: 'Returns & Exchanges',icon: RefreshCw },
  {
    key: 'settings',
    label: 'Settings',
    icon: SlidersHorizontal,
    children: SETTINGS_CHILDREN,
  },
]

const pageTitles = {
  '/dashboard':         'Dashboard',
  '/categories':              'Categories',
  '/categories/new':          'New Subcategory',
  '/categories/new-main':     'New Main Category',
  '/products':          'Products',
  '/kitchen-products':  'Kitchen Products',
  '/wardrobe-products': 'Wardrobe Products',
  '/1bhk-packages':     '1BHK Packages',
  '/2bhk-packages':     '2BHK Packages',
  '/delivery-partners': 'Delivery Partners',
  '/orders':            'Orders',
  '/users':             'Users',
  '/hero-section':      'Hero Section',
  '/offer-banner':      'Offer Banner',
  '/admin-settings':    'Email Settings',
  '/leads':             'Leads',
  '/returns':           'Returns & Exchanges',
}

const GROUP_CHILDREN = {
  'interior-design': INTERIOR_CHILDREN,
  'settings': SETTINGS_CHILDREN,
}

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const dispatch = useDispatch()

  const initialOpen = {}
  Object.entries(GROUP_CHILDREN).forEach(([key, children]) => {
    initialOpen[key] = children.some(c => c.path === location.pathname)
  })
  const [openGroups, setOpenGroups] = useState(initialOpen)

  const toggleGroup = (key) => setOpenGroups(g => ({ ...g, [key]: !g[key] }))

  // Auto-open group when navigating directly to a child page
  useEffect(() => {
    Object.entries(GROUP_CHILDREN).forEach(([key, children]) => {
      if (children.some(c => c.path === location.pathname)) {
        setOpenGroups(g => ({ ...g, [key]: true }))
      }
    })
  }, [location.pathname])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#1a2035' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">HomelineTeam</p>
              <p className="text-slate-400 text-xs">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-2 mb-2 mt-2">Menu</p>
          <nav className="space-y-0.5">
            {menuItems.map(item => {
              const Icon = item.icon

              // ── Group item (has children) ──────────────────────────────
              if (item.children) {
                const isGroupOpen = !!openGroups[item.key]
                const anyChildActive = item.children.some(c => c.path === location.pathname)
                return (
                  <div key={item.key}>
                    {/* Parent button */}
                    <button
                      onClick={() => toggleGroup(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                        anyChildActive
                          ? 'bg-white/10 text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="flex-shrink-0" style={{ width: 16, height: 16 }} />
                      <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                      <ChevronDown
                        style={{ width: 14, height: 14 }}
                        className={`opacity-60 transition-transform duration-200 ${isGroupOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Children */}
                    {isGroupOpen && (
                      <div className="mt-0.5 ml-3 pl-4 border-l border-white/10 space-y-0.5">
                        {item.children.map(child => {
                          const ChildIcon = child.icon
                          const isActive = location.pathname === child.path
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={onClose}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <ChildIcon className="flex-shrink-0" style={{ width: 14, height: 14 }} />
                              <span className="flex-1 text-sm font-medium">{child.label}</span>
                              {isActive && <ChevronRight style={{ width: 12, height: 12 }} className="opacity-70" />}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              // ── Regular item ───────────────────────────────────────────
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="flex-shrink-0" style={{ width: 16, height: 16 }} />
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {isActive && <ChevronRight style={{ width: 14, height: 14 }} className="opacity-70" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="flex-shrink-0 px-4 pb-5 pt-2">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
          >
            <LogOut style={{ width: 18, height: 18 }} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

const Header = ({ onMenuClick }) => {
  const { user } = useSelector(s => s.auth)
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname]
    || (location.pathname.startsWith('/categories/edit/') ? 'Edit Subcategory' : null)
    || (location.pathname.startsWith('/categories/edit-main/') ? 'Edit Main Category' : null)
    || 'Admin Panel'

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-gray-400" />
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-semibold text-gray-800">{pageTitle}</span>
          </div>
        </div>

        {/* Right: user */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-gray-400 text-xs leading-tight">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
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
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
