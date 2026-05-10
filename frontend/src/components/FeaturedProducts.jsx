import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import api from '@/services/api';

export default async function FeaturedProducts() {
  let products = [];

  try {
    const data = await api.getFeaturedProducts(8);
    products = Array.isArray(data) ? data : [];
  } catch (err) {
    products = [];
  }

  return (
    <section className="pb-12 sm:pb-16 lg:pb-20 bg-white">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">
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
            {products.slice(0, 8).map((product) => (
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