import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNavbar from '@/components/BottomNavbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>HomeLine - Premium Home Furnishings & Interior Design</title>
        <meta name="description" content="Discover premium home furnishings, curtains, table runners, and professional interior design services. Transform your space with HomeLine's curated collection of high-quality home decor items." />
        <meta name="keywords" content="home furnishings, curtains, table runners, interior design, home decor, premium fabrics, home textiles" />
        <meta name="author" content="HomeLine" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://homeline.com/" />
        <meta property="og:title" content="HomeLine - Premium Home Furnishings & Interior Design" />
        <meta property="og:description" content="Discover premium home furnishings, curtains, table runners, and professional interior design services." />
        <meta property="og:image" content="https://homeline.com/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://homeline.com/" />
        <meta property="twitter:title" content="HomeLine - Premium Home Furnishings & Interior Design" />
        <meta property="twitter:description" content="Discover premium home furnishings, curtains, table runners, and professional interior design services." />
        <meta property="twitter:image" content="https://homeline.com/og-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
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
