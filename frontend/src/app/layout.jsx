import './globals.css';
import Navbar from '@/components/Navbar';
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <UserProvider>
            <CartProvider>
              <SubmissionProvider>
                <Navbar />
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
