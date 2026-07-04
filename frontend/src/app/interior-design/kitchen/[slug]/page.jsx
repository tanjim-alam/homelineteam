import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Shield, CheckCircle } from 'lucide-react';
import DesignDetailClient from '@/components/interior/DesignDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

async function fetchProduct(slug) {
  try {
    const res = await fetch(`${API_BASE}/kitchen-products/slug/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/kitchen-products`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.products || data?.data || []);
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Kitchen Design Not Found' };
  const title = product.metaData?.title || `${product.name} – Modular Kitchen | HomelineTeam`;
  const description = product.metaData?.description || product.description || '';
  return {
    title,
    description,
    keywords: product.metaData?.keywords || ['modular kitchen', 'kitchen design', 'HomelineTeam'],
    alternates: { canonical: `https://www.homelineteam.com/interior-design/kitchen/${slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.mainImages?.[0] ? [{ url: product.mainImages[0] }] : [],
      url: `https://www.homelineteam.com/interior-design/kitchen/${slug}`,
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

export default async function KitchenDetailPage({ params }) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([fetchProduct(slug), fetchAllProducts()]);
  if (!product) notFound();

  const similar = allProducts.filter(p => p.slug !== slug);

  const styles = product.kitchenMetadata?.style || [];
  const suitableFor = product.kitchenMetadata?.suitableFor || [];
  const colorScheme = product.kitchenMetadata?.colorScheme || [];
  const deliveryTime = product.kitchenMetadata?.deliveryTime;
  const warranty = product.kitchenMetadata?.warranty;
  const layouts = product.availableLayouts || [];
  const materials = product.availableMaterials || product.defaultMaterials || [];
  const features = product.availableFeatures || product.defaultFeatures || [];

  const detailSections = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
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
        {product.kitchenMetadata?.installation?.included !== undefined && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 col-span-2">
            <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Installation</p>
              <p className="text-xs font-bold text-gray-800">
                {product.kitchenMetadata.installation.included ? 'Included Free' : 'Extra Cost'}
              </p>
            </div>
          </div>
        )}
      </div>

      {layouts.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available Layouts</p>
          <div className="flex flex-wrap gap-2">
            {layouts.map((l, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium capitalize">
                {l.name || l.type}
              </span>
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

      {(materials.length > 0 || features.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {materials.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Materials</p>
              <div className="space-y-2">
                {materials.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-800">{m.material}</span>
                    {m.quality && <span className="text-[10px] bg-white text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded capitalize flex-shrink-0">{m.quality}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {features.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Features</p>
              <div className="space-y-2">
                {features.slice(0, 4).map((f, i) => (
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
          { '@type': 'ListItem', position: 3, name: 'Modular Kitchen', item: 'https://www.homelineteam.com/interior-design/kitchen' },
          { '@type': 'ListItem', position: 4, name: product.name, item: `https://www.homelineteam.com/interior-design/kitchen/${slug}` },
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
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/interior-design" className="hover:text-primary-600 transition-colors">Interior Design</Link>
          <span>/</span>
          <Link href="/interior-design/kitchen" className="hover:text-primary-600 transition-colors">Kitchen</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[180px]">{product.name}</span>
        </div>
      </div>

      <DesignDetailClient
        product={product}
        similar={similar}
        backHref="/interior-design/kitchen"
        backLabel="Back to Kitchen Designs"
        basePath="/interior-design/kitchen"
        detailSections={detailSections}
      />
    </div>
  );
}
