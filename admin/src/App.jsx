import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { fetchMe } from './store/slices/authSlice'
import Layout from './components/Layout'
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
import HeroSectionPage from './pages/HeroSectionPage'
import LeadsPage from './pages/LeadsPage'

function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.auth.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/kitchen-products" element={<ProtectedRoute><KitchenProductsPage /></ProtectedRoute>} />
        <Route path="/wardrobe-products" element={<ProtectedRoute><WardrobeProductsPage /></ProtectedRoute>} />
        <Route path="/1bhk-packages" element={<ProtectedRoute><OneBHKPackagePage /></ProtectedRoute>} />
        <Route path="/2bhk-packages" element={<ProtectedRoute><TwoBHKPackagePage /></ProtectedRoute>} />
        <Route path="/delivery-partners" element={<ProtectedRoute><DeliveryPartnerPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/hero-section" element={<ProtectedRoute><HeroSectionPage /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
