import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

async function fetchFeaturedProducts() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';
  try {
    const res = await fetch(`${base}/products?featured=true&limit=8`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data
      : Array.isArray(data?.products) ? data.products
      : Array.isArray(data?.data) ? data.data
      : [];
    return list.slice(0, 8);
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Products — HomelineTeam',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        url: `https://homelineteam.com/products/${p.slug || p._id}`,
        image: p.mainImages?.[0] || '',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: p.basePrice ?? 0,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <section className="pb-12 sm:pb-16 lg:pb-20 bg-white" aria-labelledby="featured-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 id="featured-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">
            Featured{' '}
            <span className="text-gradient">Products</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-3xl mx-auto px-4">
            Discover our handpicked selection of premium home furnishings
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-12">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/collections" passHref>
            <button className="btn-primary group flex items-center gap-2 mx-auto">
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
