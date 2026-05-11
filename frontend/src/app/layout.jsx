import './globals.css';
import Navbar from '@/components/Navbar';
import ProductNavbar from '@/components/ProductNavbar';
import Footer from '@/components/Footer';
import BottomNavbar from '@/components/BottomNavbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';
import { SubmissionProvider } from '@/contexts/SubmissionContext';
import { UserProvider } from '@/contexts/UserContext';

export const metadata = {
  title: 'HomeLine - Premium Home Furnishings & Interior Design',
  description: 'Discover premium home furnishings, curtains, table runners, and professional interior design services. Transform your space with HomeLine\'s curated collection of high-quality home decor items.',
};

async function fetchCategories() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'
  try {
    const res = await fetch(`${base}/categories/hierarchical`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data))             return data
    if (Array.isArray(data?.categories)) return data.categories
    if (Array.isArray(data?.data))       return data.data
    return []
  } catch {
    return []
  }
}

export default async function RootLayout({ children }) {
  const categories = await fetchCategories()

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <UserProvider>
            <CartProvider>
              <SubmissionProvider>
                <div className="sticky top-0 z-40">
                  <Navbar categories={categories} />
                  <ProductNavbar categories={categories} />
                </div>
                <main className="pb-20 lg:pb-0">{children}</main>
                <Footer />
                <BottomNavbar />
              </SubmissionProvider>
            </CartProvider>
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
