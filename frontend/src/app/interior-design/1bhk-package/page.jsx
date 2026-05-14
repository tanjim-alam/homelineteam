import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: '1 BHK Interior Package – Complete Home Design | HomelineTeam',
  description:
    'All-inclusive 1 BHK interior design packages — modular kitchen, wardrobes, TV unit, false ceiling and furniture. Budget-friendly, delivered fast.',
  keywords: [
    '1bhk interior package', '1 bhk design', 'interior design 1bhk', 'complete home package',
    'budget interior design', '1bhk furniture package', 'HomelineTeam 1bhk',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/1bhk-package' },
  openGraph: {
    title: '1 BHK Interior Package | HomelineTeam',
    description: 'Complete 1 BHK interior design — kitchen, wardrobe, and furniture included.',
    url: 'https://www.homelineteam.com/interior-design/1bhk-package',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1 BHK Interior Package | HomelineTeam',
    description: 'All-inclusive 1 BHK interior package — kitchen, wardrobe, TV unit and more.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchOneBHKPackages() {
  try {
    const res = await fetch(`${API_BASE}/1bhk-packages`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.packages)) return data.packages;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

const oneBHKJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: '1 BHK Package', item: 'https://www.homelineteam.com/interior-design/1bhk-package' },
      ],
    },
    {
      '@type': 'Service',
      name: '1 BHK Interior Design Package',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'All-inclusive 1 BHK interior package — modular kitchen, wardrobe, TV unit, false ceiling and more.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
  ],
};

export default async function OneBHKPackagePage() {
  const packages = await fetchOneBHKPackages();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(oneBHKJsonLd) }} />
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
            1 BHK{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Interior
            </span>{' '}
            Packages
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            All-inclusive interior packages for 1 BHK apartments — kitchen, wardrobe, furniture and more. Beautiful, budget-smart, delivered fast.
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
          {['Complete Setup', 'Budget Friendly', 'Fast Delivery', 'Free Installation', 'Expert Consultation'].map((f) => (
            <span key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Packages with filter sidebar */}
      <InteriorListingClient
        products={packages}
        type="1bhk"
        basePath="/interior-design/1bhk-package"
        emptyIcon="🏠"
        emptyTitle="No Packages Available"
        emptyText="Our 1 BHK packages are being updated. Contact us for a custom quote."
      />

      {/* What's Included section */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">What's Typically Included</h2>
            <p className="text-gray-500 text-sm">Every 1 BHK package comes with comprehensive home essentials</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Modular Kitchen', 'Wardrobe', 'TV Unit', 'Foyer Design', 'False Ceiling', 'Lighting'].map((item) => (
              <div key={item} className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 text-center">
                <CheckCircle className="w-5 h-5 text-red-500" />
                <span className="text-xs font-semibold text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to transform your 1 BHK?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Talk to our designers for a personalised package. We'll create a complete interior plan that fits your budget and style.
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
