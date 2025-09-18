'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import api from '@/services/api';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();

        // Handle different possible data structures
        let categoriesData = [];
        if (data && Array.isArray(data)) {
          // If API returns array directly
          categoriesData = data;
        } else if (data && data.categories && Array.isArray(data.categories)) {
          // If API returns { categories: [...] }
          categoriesData = data.categories;
        } else if (data && data.data && Array.isArray(data.data)) {
          // If API returns { data: [...] }
          categoriesData = data.data;
        }


        if (categoriesData.length > 0) {
          setCategories(categoriesData);
        } else {
          // No fallback data - show empty state
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);



  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-8 bg-gray-200 rounded-full w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-glass px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Explore Our Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Shop by Category
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover our carefully curated collections designed to transform every room in your home with style, comfort, and elegance.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category._id}
              href={`/collections/${category.slug}`}
              className="group block"
            >
              <div className="relative text-center">
                {/* Circular Card */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-3 sm:mb-4 overflow-hidden rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-110 border-4 border-gray-100 group-hover:border-primary-200">

                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-transparent to-secondary-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>

                  {/* Category Image */}
                  <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image
                      src={category.image || 'https://via.placeholder.com/400x400?text=Category'}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/70 transition-all duration-500 rounded-full"></div>

                    {/* Featured Badge */}
                    {category.metaData?.featured && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse"></div>
                          ★
                        </span>
                      </div>
                    )}

                    {/* Popular Badge */}
                    {category.metaData?.popular && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse"></div>
                          🔥
                        </span>
                      </div>
                    )}

                    {/* Product Count Badge */}
                    <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                      {category.productCount} items
                    </div>
                  </div>

                  {/* Hover Effect Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-primary-300/50 transition-all duration-500"></div>
                </div>

                {/* Category Info Below Circle */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {category.name}
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 line-clamp-2 px-1 sm:px-2">
                    {category.description}
                  </p>

                  {/* Action Button */}
                  <div className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* Floating Decorative Elements */}
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>
                <div className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150" style={{ transitionDelay: '0.1s' }}></div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link href="/collections">
            <button className="btn-primary group flex items-center gap-2 mx-auto">
              <span>View All Collections</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
