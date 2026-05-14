import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: 'Wardrobe Design Solutions – Custom Storage | HomelineTeam',
  description:
    'Explore premium wardrobe solutions — sliding, hinged & walk-in designs. Custom fittings, space-maximising layouts, and premium hardware. Free consultation.',
  keywords: [
    'wardrobe design', 'custom wardrobe', 'wardrobe solutions India', 'sliding wardrobe',
    'built-in wardrobe', 'bedroom storage', 'wardrobe interior', 'HomelineTeam wardrobe',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/wardrobes' },
  openGraph: {
    title: 'Wardrobe Design Solutions | HomelineTeam',
    description: 'Custom wardrobe designs for modern homes — space-smart and stylish.',
    url: 'https://www.homelineteam.com/interior-design/wardrobes',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wardrobe Design Solutions | HomelineTeam',
    description: 'Premium wardrobe designs — sliding, hinged & walk-in. Custom fittings for every bedroom.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchWardrobeProducts() {
  try {
    const res = await fetch(`${API_BASE}/wardrobe-products`, { next: { revalidate: 3600 } });
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

const wardrobesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: 'Wardrobes', item: 'https://www.homelineteam.com/interior-design/wardrobes' },
      ],
    },
    {
      '@type': 'Service',
      name: 'Wardrobe Design Solutions',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'Premium sliding, hinged, and walk-in wardrobe designs with custom fittings and premium hardware.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
  ],
};

export default async function WardrobesPage() {
  const products = await fetchWardrobeProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(wardrobesJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Custom{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Wardrobe
            </span>{' '}
            Solutions
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Maximise your bedroom storage with custom wardrobe designs — from sliding doors to walk-in closets, crafted for your space.
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
          {['Space Optimised', 'Custom Fittings', 'Modern Styles', 'Free Installation', 'Expert Design'].map((f) => (
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
        type="wardrobes"
        basePath="/interior-design/wardrobes"
        emptyIcon="🚪"
        emptyTitle="No Products Available"
        emptyText="Our wardrobe catalogue is being updated. Contact us for custom designs."
      />

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Need a custom wardrobe for your space?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Our designers will measure your space and create the perfect storage solution tailored to your needs.
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
