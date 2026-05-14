import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: '2 BHK Interior Package – Full Home Design | HomelineTeam',
  description:
    'Premium 2 BHK interior design packages — kitchen, wardrobes, living room, false ceiling and furniture. Expert consultation, warranty included.',
  keywords: [
    '2bhk interior package', '2 bhk design', 'interior design 2bhk', '2bhk home design',
    'full home interior package', '2bhk furniture package', 'HomelineTeam 2bhk',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/2bhk-package' },
  openGraph: {
    title: '2 BHK Interior Package | HomelineTeam',
    description: 'Complete 2 BHK interior design — premium quality, full home transformation.',
    url: 'https://www.homelineteam.com/interior-design/2bhk-package',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2 BHK Interior Package | HomelineTeam',
    description: 'Full-home 2 BHK interior — kitchen, wardrobes, living room, false ceiling and more.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchTwoBHKPackages() {
  try {
    const res = await fetch(`${API_BASE}/2bhk-packages`, { next: { revalidate: 3600 } });
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

const twoBHKJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: '2 BHK Package', item: 'https://www.homelineteam.com/interior-design/2bhk-package' },
      ],
    },
    {
      '@type': 'Service',
      name: '2 BHK Interior Design Package',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'Premium full-home 2 BHK interior package — kitchen, wardrobes, living room, and furniture. Expert consultation included.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
  ],
};

export default async function TwoBHKPackagePage() {
  const packages = await fetchTwoBHKPackages();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(twoBHKJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            2 BHK{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Interior
            </span>{' '}
            Packages
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Premium full-home interior packages for 2 BHK apartments — expert consultation, premium quality, and complete home transformation.
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
          {['Premium Quality', 'Full Home Design', 'Expert Consultation', 'Free Installation', 'Warranty Included'].map((f) => (
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
        type="2bhk"
        basePath="/interior-design/2bhk-package"
        emptyIcon="🏢"
        emptyTitle="No Packages Available"
        emptyText="Our 2 BHK packages are being updated. Contact us for a custom quote."
      />

      {/* What's Included section */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">What's Typically Included</h2>
            <p className="text-gray-500 text-sm">Every 2 BHK package covers your complete home</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Modular Kitchen', '2 Wardrobes', 'Living Room', 'TV Unit', 'False Ceiling', 'Lighting & More'].map((item) => (
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
            Ready to transform your 2 BHK?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Our expert designers will craft a personalised plan for your full home — premium quality that fits your budget.
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
