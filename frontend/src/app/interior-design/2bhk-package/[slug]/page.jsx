import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Shield, CheckCircle, Users } from 'lucide-react';
import DesignDetailClient from '@/components/interior/DesignDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

async function fetchPackage(slug) {
  try {
    const res = await fetch(`${API_BASE}/2bhk-packages/slug/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchAllPackages() {
  try {
    const res = await fetch(`${API_BASE}/2bhk-packages`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.packages || data?.data || []);
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await fetchPackage(slug);
  if (!pkg) return { title: '2 BHK Package Not Found' };
  const title = pkg.metaData?.title || `${pkg.name} – 2 BHK Interior Package | HomelineTeam`;
  const description = pkg.metaData?.description || pkg.description || '';
  return {
    title,
    description,
    keywords: pkg.metaData?.keywords || ['2bhk interior package', '2bhk design', 'HomelineTeam'],
    alternates: { canonical: `https://www.homelineteam.com/interior-design/2bhk-package/${slug}` },
    openGraph: {
      title: pkg.name,
      description,
      images: pkg.mainImages?.[0] ? [{ url: pkg.mainImages[0] }] : [],
      url: `https://www.homelineteam.com/interior-design/2bhk-package/${slug}`,
      siteName: 'HomelineTeam',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: pkg.mainImages?.[0] ? [pkg.mainImages[0]] : [],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default async function TwoBHKDetailPage({ params }) {
  const { slug } = await params;
  const [pkg, allPackages] = await Promise.all([fetchPackage(slug), fetchAllPackages()]);
  if (!pkg) notFound();

  const similar = allPackages.filter(p => p.slug !== slug);
  const inclusions = pkg.inclusions || [];
  const features = pkg.features || pkg.availableFeatures || [];
  const styles = pkg.packageMetadata?.style || [];
  const suitableFor = pkg.packageMetadata?.suitableFor || [];
  const deliveryTime = pkg.packageMetadata?.deliveryTime;
  const warranty = pkg.packageMetadata?.warranty;
  const area = pkg.packageMetadata?.area;

  const inclusionsByCategory = inclusions.reduce((acc, inc) => {
    const cat = inc.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(inc);
    return acc;
  }, {});

  const detailSections = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {pkg.kitchenLayout && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Users className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Kitchen</p>
              <p className="text-xs font-bold text-gray-800 capitalize">{pkg.kitchenLayout}</p>
            </div>
          </div>
        )}
        {pkg.wardrobeType && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Users className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Wardrobe</p>
              <p className="text-xs font-bold text-gray-800 capitalize">{pkg.wardrobeType}</p>
            </div>
          </div>
        )}
        {deliveryTime && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Clock className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Delivery</p>
              <p className="text-xs font-bold text-gray-800">{deliveryTime}</p>
            </div>
          </div>
        )}
        {warranty && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Shield className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Warranty</p>
              <p className="text-xs font-bold text-gray-800">{warranty}</p>
            </div>
          </div>
        )}
        {area && (area.min || area.max) && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 col-span-2">
            <Users className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Area Coverage</p>
              <p className="text-xs font-bold text-gray-800">
                {area.min && area.max ? `${area.min}–${area.max} sq ft` : area.min ? `From ${area.min} sq ft` : `Up to ${area.max} sq ft`}
              </p>
            </div>
          </div>
        )}
      </div>

      {styles.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Style</p>
          <div className="flex flex-wrap gap-2">
            {styles.map(s => (
              <span key={s} className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-3 py-1 rounded-full font-medium capitalize">{s}</span>
            ))}
          </div>
        </div>
      )}
      {suitableFor.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Suitable For</p>
          <div className="flex flex-wrap gap-2">
            {suitableFor.map(s => (
              <span key={s} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium capitalize">{s}</span>
            ))}
          </div>
        </div>
      )}

      {inclusions.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">What's Included</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(inclusionsByCategory).flatMap(([, items]) => items).slice(0, 8).map((inc, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">{inc.item}{inc.quantity > 1 ? ` ×${inc.quantity}` : ''}</span>
              </div>
            ))}
            {inclusions.length > 8 && (
              <p className="text-xs text-sky-500 font-medium col-span-2">+{inclusions.length - 8} more items included</p>
            )}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Features</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.slice(0, 6).map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full flex-shrink-0" />
                <span className="text-xs text-gray-700">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
          { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
          { '@type': 'ListItem', position: 3, name: '2 BHK Package', item: 'https://www.homelineteam.com/interior-design/2bhk-package' },
          { '@type': 'ListItem', position: 4, name: pkg.name, item: `https://www.homelineteam.com/interior-design/2bhk-package/${slug}` },
        ],
      },
      {
        '@type': 'Product',
        name: pkg.name,
        description: pkg.description || '',
        image: pkg.mainImages || [],
        brand: { '@type': 'Brand', name: 'HomelineTeam' },
        offers: pkg.basePrice ? {
          '@type': 'Offer',
          price: pkg.basePrice,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'HomelineTeam' },
        } : undefined,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/interior-design" className="hover:text-sky-600 transition-colors">Interior Design</Link>
          <span>/</span>
          <Link href="/interior-design/2bhk-package" className="hover:text-sky-600 transition-colors">2 BHK Package</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[180px]">{pkg.name}</span>
        </div>
      </div>

      <DesignDetailClient
        product={pkg}
        similar={similar}
        backHref="/interior-design/2bhk-package"
        backLabel="Back to 2 BHK Packages"
        basePath="/interior-design/2bhk-package"
        detailSections={detailSections}
      />
    </div>
  );
}
