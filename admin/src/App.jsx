import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { fetchMe } from './store/slices/authSlice'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import AuthLoading from './components/AuthLoading'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CategoriesPage from './pages/CategoriesPage'
import ProductsPage from './pages/ProductsPage'
import KitchenProductsPage from './pages/KitchenProductsPage'
import WardrobeProductsPage from './pages/WardrobeProductsPage'
import OneBHKPackagePage from './pages/OneBHKPackagePage'
import TwoBHKPackagePage from './pages/TwoBHKPackagePage'
import DeliveryPartnerPage from './pages/DeliveryPartnerPage'
import OrdersPage from './pages/OrdersPage'
import UsersPage from './pages/UsersPage'
import HeroSectionPage from './pages/HeroSectionPage'
import LeadsPage from './pages/LeadsPage'
import BookingsPage from './pages/BookingsPage'
import ReturnsPage from './pages/ReturnsPage'
import OfferBannerPage from './pages/OfferBannerPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import CategoryFormPage from './pages/CategoryFormPage'
import MainCategoryFormPage from './pages/MainCategoryFormPage'
import TeamPage from './pages/TeamPage'

function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Access restricted</h2>
      <p className="text-sm text-gray-500">You don't have permission to view this page. Contact an admin to request access.</p>
    </div>
  )
}

// `permission` = module key the user's `permissions` array must include.
// `adminOnly` = only role 'admin' may view, regardless of permissions.
function ProtectedRoute({ children, permission, adminOnly }) {
  const user = useSelector((s) => s.auth.user)
  if (!user) return <Navigate to="/login" replace />
  const isAdmin = user.role === 'admin'
  if (adminOnly && !isAdmin) return <NotAuthorized />
  if (permission && !isAdmin && !user.permissions?.includes(permission)) return <NotAuthorized />
  return children
}

function App() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((s) => s.auth)

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  // Show loading screen while verifying authentication
  if (loading) {
    return <AuthLoading />
  }

  // Show login if not authenticated — admin accounts are created via Team Management, not self-registration
  if (!user) {
    return <LoginPage />
  }

  return (
    <ToastProvider>
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute permission="categories"><CategoriesPage /></ProtectedRoute>} />
        <Route path="/categories/new" element={<ProtectedRoute permission="categories"><CategoryFormPage /></ProtectedRoute>} />
        <Route path="/categories/edit/:id" element={<ProtectedRoute permission="categories"><CategoryFormPage /></ProtectedRoute>} />
        <Route path="/categories/new-main" element={<ProtectedRoute permission="categories"><MainCategoryFormPage /></ProtectedRoute>} />
        <Route path="/categories/edit-main/:id" element={<ProtectedRoute permission="categories"><MainCategoryFormPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute permission="products"><ProductsPage /></ProtectedRoute>} />
        <Route path="/kitchen-products" element={<ProtectedRoute permission="interior-design"><KitchenProductsPage /></ProtectedRoute>} />
        <Route path="/wardrobe-products" element={<ProtectedRoute permission="interior-design"><WardrobeProductsPage /></ProtectedRoute>} />
        <Route path="/1bhk-packages" element={<ProtectedRoute permission="interior-design"><OneBHKPackagePage /></ProtectedRoute>} />
        <Route path="/2bhk-packages" element={<ProtectedRoute permission="interior-design"><TwoBHKPackagePage /></ProtectedRoute>} />
        <Route path="/delivery-partners" element={<ProtectedRoute permission="delivery-partners"><DeliveryPartnerPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute permission="orders"><OrdersPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute permission="users"><UsersPage /></ProtectedRoute>} />
        <Route path="/hero-section" element={<ProtectedRoute permission="settings"><HeroSectionPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute permission="leads"><LeadsPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute permission="bookings"><BookingsPage /></ProtectedRoute>} />
        <Route path="/returns" element={<ProtectedRoute permission="returns"><ReturnsPage /></ProtectedRoute>} />
        <Route path="/offer-banner" element={<ProtectedRoute permission="settings"><OfferBannerPage /></ProtectedRoute>} />
        <Route path="/admin-settings" element={<ProtectedRoute permission="settings"><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute adminOnly><TeamPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
    </ToastProvider>
  )
}

export default App
