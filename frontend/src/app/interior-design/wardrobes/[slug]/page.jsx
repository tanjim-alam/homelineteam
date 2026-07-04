import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Shield, Tag, Home } from 'lucide-react';
import DesignDetailClient from '@/components/interior/DesignDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

async function fetchProduct(slug) {
  try {
    const res = await fetch(`${API_BASE}/wardrobe-products/slug/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/wardrobe-products`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.products || data?.data || []);
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Wardrobe Design Not Found' };
  const title = product.metaData?.title || `${product.name} – Wardrobe Solution | HomelineTeam`;
  const description = product.metaData?.description || product.description || '';
  return {
    title,
    description,
    keywords: product.metaData?.keywords || ['wardrobe design', 'custom wardrobe', 'HomelineTeam'],
    alternates: { canonical: `https://www.homelineteam.com/interior-design/wardrobes/${slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.mainImages?.[0] ? [{ url: product.mainImages[0] }] : [],
      url: `https://www.homelineteam.com/interior-design/wardrobes/${slug}`,
      siteName: 'HomelineTeam',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.mainImages?.[0] ? [product.mainImages[0]] : [],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default async function WardrobeDetailPage({ params }) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([fetchProduct(slug), fetchAllProducts()]);
  if (!product) notFound();

  const similar = allProducts.filter(p => p.slug !== slug);

  const styles = product.wardrobeMetadata?.style || [];
  const suitableFor = product.wardrobeMetadata?.suitableFor || [];
  const colorScheme = product.wardrobeMetadata?.colorScheme || [];
  const deliveryTime = product.wardrobeMetadata?.deliveryTime;
  const warranty = product.wardrobeMetadata?.warranty;
  const availableTypes = product.availableTypes || [];

  const detailSections = (
    <div className="space-y-4">
      {/* Quick meta chips */}
      <div className="grid grid-cols-2 gap-3">
        {product.defaultOpening && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Tag className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Opening</p>
              <p className="text-xs font-bold text-gray-800 capitalize">{product.defaultOpening}</p>
            </div>
          </div>
        )}
        {product.defaultType && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Home className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Type</p>
              <p className="text-xs font-bold text-gray-800 capitalize">{product.defaultType}</p>
            </div>
          </div>
        )}
        {deliveryTime && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Delivery</p>
              <p className="text-xs font-bold text-gray-800">{deliveryTime}</p>
            </div>
          </div>
        )}
        {warranty && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <Shield className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Warranty</p>
              <p className="text-xs font-bold text-gray-800">{warranty}</p>
            </div>
          </div>
        )}
      </div>

      {availableTypes.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available Types</p>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(t => (
              <span key={t} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium capitalize">{t}</span>
            ))}
          </div>
        </div>
      )}
      {styles.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Style</p>
          <div className="flex flex-wrap gap-2">
            {styles.map(s => (
              <span key={s} className="text-xs bg-primary-50 text-primary-600 border border-primary-100 px-3 py-1 rounded-full font-medium capitalize">{s}</span>
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
      {colorScheme.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color Schemes</p>
          <div className="flex flex-wrap gap-2">
            {colorScheme.map(c => (
              <span key={c} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium capitalize">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Materials & Features */}
      {(product.availableMaterials?.length > 0 || product.availableFeatures?.length > 0 || product.defaultFeatures?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {(product.availableMaterials || product.defaultMaterials || []).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Materials</p>
              <div className="space-y-2">
                {(product.availableMaterials || product.defaultMaterials).slice(0, 4).map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-800">{m.material}</span>
                    <span className="text-[10px] bg-white text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded capitalize flex-shrink-0">{m.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(product.availableFeatures || product.defaultFeatures || []).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Features</p>
              <div className="space-y-2">
                {(product.availableFeatures || product.defaultFeatures).slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                    <span className="text-xs text-gray-700">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          { '@type': 'ListItem', position: 3, name: 'Wardrobes', item: 'https://www.homelineteam.com/interior-design/wardrobes' },
          { '@type': 'ListItem', position: 4, name: product.name, item: `https://www.homelineteam.com/interior-design/wardrobes/${slug}` },
        ],
      },
      {
        '@type': 'Product',
        name: product.name,
        description: product.description || '',
        image: product.mainImages || [],
        brand: { '@type': 'Brand', name: 'HomelineTeam' },
        offers: product.basePrice ? {
          '@type': 'Offer',
          price: product.basePrice,
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
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/interior-design" className="hover:text-primary-600 transition-colors">Interior Design</Link>
          <span>/</span>
          <Link href="/interior-design/wardrobes" className="hover:text-primary-600 transition-colors">Wardrobes</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[180px]">{product.name}</span>
        </div>
      </div>

      <DesignDetailClient
        product={product}
        similar={similar}
        backHref="/interior-design/wardrobes"
        backLabel="Back to Wardrobe Designs"
        basePath="/interior-design/wardrobes"
        detailSections={detailSections}
      />
    </div>
  );
}
