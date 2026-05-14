import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: 'Modular Kitchen Design – Custom Kitchen Solutions | HomelineTeam',
  description:
    'Explore premium modular kitchen designs. Custom layouts, smart storage, and premium finishes crafted for modern Indian homes. Free consultation.',
  keywords: [
    'modular kitchen', 'kitchen design', 'kitchen interior', 'modular kitchen India',
    'kitchen renovation', 'custom kitchen', 'kitchen packages', 'HomelineTeam kitchen',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/kitchen' },
  openGraph: {
    title: 'Modular Kitchen Design | HomelineTeam',
    description: 'Premium modular kitchen designs for every home and budget.',
    url: 'https://www.homelineteam.com/interior-design/kitchen',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modular Kitchen Design | HomelineTeam',
    description: 'Premium modular kitchen designs — custom layouts, smart storage, free installation.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchKitchenProducts() {
  try {
    const res = await fetch(`${API_BASE}/kitchen-products`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

const kitchenJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: 'Modular Kitchen', item: 'https://www.homelineteam.com/interior-design/kitchen' },
      ],
    },
    {
      '@type': 'Service',
      name: 'Modular Kitchen Design',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'Custom modular kitchen designs with smart storage, premium finishes, and professional installation.',
      areaServed: { '@type': 'Country', name: 'India' },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Modular Kitchen Designs' },
    },
  ],
};

export default async function KitchenPage() {
  const products = await fetchKitchenProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(kitchenJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Modular{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Kitchen
            </span>{' '}
            Designs
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Transform your kitchen with custom modular designs — smart storage, premium finishes, and layouts built for the way you cook.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="tel:+919611925494"
              className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Now
            </Link>
          </div>
        </div>
      </div>

      {/* Quick features strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {['Custom Layouts', 'Premium Materials', 'Free Installation', '5-Year Warranty', 'Expert Designers'].map((f) => (
            <span key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Products with filter sidebar */}
      <InteriorListingClient
        products={products}
        type="kitchen"
        basePath="/interior-design/kitchen"
        emptyIcon="🍳"
        emptyTitle="No Products Available"
        emptyText="Our kitchen catalogue is being updated. Contact us for custom designs."
      />

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Not sure which kitchen suits you?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Get a free consultation with our expert designers. We'll help you pick the perfect layout and finish for your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Book Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="tel:+919611925494"
              className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> +91 96119 25494
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
