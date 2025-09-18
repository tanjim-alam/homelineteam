import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNavbar from '@/components/BottomNavbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';

export const metadata = {
  title: 'HomeLine - Premium Home Furnishings & Interior Design',
  description: 'Discover premium home furnishings, curtains, table runners, and professional interior design services. Transform your space with HomeLine\'s curated collection of high-quality home decor items.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <CartProvider>
            <Navbar />
            <main className="pb-20 lg:pb-0">{children}</main>
            <Footer />
            <BottomNavbar />
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
