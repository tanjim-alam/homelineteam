import './globals.css';
import Navbar from '@/components/Navbar';
import ProductNavbar from '@/components/ProductNavbar';
import Footer from '@/components/Footer';
import BottomNavbar from '@/components/BottomNavbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';
import { SubmissionProvider } from '@/contexts/SubmissionContext';
import { UserProvider } from '@/contexts/UserContext';

const SITE_URL = 'https://homelineteam.com';

/* ── Global SEO metadata ────────────────────────────────────────────────────── */
export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'HomelineTeam – Premium Home Furnishings & Interior Design',
    template: '%s | HomelineTeam',
  },

  description:
    'Shop premium curtains, blinds, wallpapers, cushions, rugs & more at HomelineTeam. Expert interior design services across India. Transform your space today.',

  keywords: [
    'home furnishings', 'curtains', 'blinds', 'wallpaper', 'cushions', 'rugs',
    'interior design', 'home decor', 'window treatments', 'HomelineTeam',
    'premium curtains India', 'buy curtains online', 'home textiles',
  ],

  authors: [{ name: 'HomelineTeam', url: SITE_URL }],
  creator: 'HomelineTeam',
  publisher: 'HomelineTeam',

  /* ── Verification ──────────────────────────────────────────────────────── */
  verification: {
    google: 'bstKA4IaQutGTowDRs2Q1F6bCK_iaSd1LJr5aEz7fkw',
  },

  /* ── Robots ────────────────────────────────────────────────────────────── */
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  /* ── Open Graph ────────────────────────────────────────────────────────── */
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'HomelineTeam',
    title: 'HomelineTeam – Premium Home Furnishings & Interior Design',
    description:
      'Shop premium curtains, blinds, wallpapers, cushions, rugs & more. Expert interior design services across India.',
    images: [
      {
        url: '/hero-bg-1.jpg',
        width: 1200,
        height: 630,
        alt: 'HomelineTeam – Premium Home Furnishings',
      },
    ],
  },

  /* ── Twitter / X ───────────────────────────────────────────────────────── */
  twitter: {
    card: 'summary_large_image',
    title: 'HomelineTeam – Premium Home Furnishings',
    description:
      'Shop premium curtains, blinds, wallpapers, cushions, rugs & more at HomelineTeam.',
    images: ['/hero-bg-1.jpg'],
  },

  /* ── Canonical & alternates ────────────────────────────────────────────── */
  alternates: {
    canonical: SITE_URL,
  },

  /* ── Icons ─────────────────────────────────────────────────────────────── */
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },

  /* ── Category ──────────────────────────────────────────────────────────── */
  category: 'shopping',
};

/* ── Fetch categories for nav ───────────────────────────────────────────────── */
async function fetchCategories() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';
  try {
    const res = await fetch(`${base}/categories/hierarchical`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data))             return data;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data?.data))       return data.data;
    return [];
  } catch {
    return [];
  }
}

/* ── JSON-LD structured data ────────────────────────────────────────────────── */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HomelineTeam',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpeg`,
  description:
    'Premium home furnishings — curtains, blinds, wallpapers, cushions, rugs and interior design services across India.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HomelineTeam',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/* ── Root layout ────────────────────────────────────────────────────────────── */
export default async function RootLayout({ children }) {
  const categories = await fetchCategories();

  return (
    <html lang="en">
      <body>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

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
