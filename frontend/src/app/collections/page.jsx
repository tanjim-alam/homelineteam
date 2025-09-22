'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Star, ShoppingBag, Loader2, Package } from 'lucide-react';
import api from '@/services/api';
import Metadata from '@/components/Metadata';
import { generateCollectionsMetadata } from '@/utils/metadata';

export default function CollectionsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await api.getCategories();

        // Fetch product count for each category
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              const products = await api.getProductsByCategory(category._id, { limit: 1000 });
              return {
                ...category,
                productCount: products.length,
                // Generate features based on category data
                features: generateCategoryFeatures(category)
              };
            } catch (err) {
              return {
                ...category,
                productCount: 0,
                features: generateCategoryFeatures(category)
              };
            }
          })
        );

        setCategories(categoriesWithCounts);
      } catch (err) {
        setError(err.message || 'Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Generate features based on category data
  const generateCategoryFeatures = (category) => {
    const features = [];

    // Add features based on custom fields
    if (category.customFields && category.customFields.length > 0) {
      const fieldNames = category.customFields.slice(0, 3).map(field => field.name);
      features.push(...fieldNames);
    }

    // Add features based on variant fields
    if (category.variantFields && category.variantFields.length > 0) {
      const variantNames = category.variantFields.slice(0, 2).map(field => field.name);
      features.push(...variantNames);
    }

    // Add default features if not enough custom ones
    const defaultFeatures = ['Premium Quality', 'Expert Craftsmanship', 'Modern Design', 'Durability'];
    while (features.length < 4) {
      const defaultFeature = defaultFeatures[features.length];
      if (defaultFeature && !features.includes(defaultFeature)) {
        features.push(defaultFeature);
      }
    }

    return features.slice(0, 4);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Metadata {...generateCollectionsMetadata()} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          {/* Hero Section with Background Image */}
          <section className="relative py-5 overflow-hidden h-[60vh]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/hero-bg-1.jpg"
                alt="Beautiful home interior with elegant furnishings"
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40"></div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20"></div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-100/30 to-pink-100/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
              <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
            </div>

            <div className="relative z-10 container-custom text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg mb-6 border border-white/30">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold text-white">Premium Collections</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Explore Our{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Beautiful Collections
                </span>
              </h1>

              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Discover thoughtfully curated home furnishings that blend style, comfort, and functionality.
                Each collection tells a unique story for your home.
              </p>

              {/* Loading indicator */}
              <div className="mt-8 flex justify-center">
                <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-full border border-white/30">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
            </div>
          </section>

          {/* Loading Collections Grid */}
          <section className="py-20">
            <div className="container-custom">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="relative overflow-hidden aspect-[4/3] bg-gray-200"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-6 bg-gray-200 rounded-full w-16"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Metadata {...generateCollectionsMetadata()} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          {/* Hero Section with Background Image */}
          <section className="relative py-5 overflow-hidden h-[60vh]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/hero-bg-1.jpg"
                alt="Beautiful home interior with elegant furnishings"
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40"></div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20"></div>
            </div>

            <div className="relative z-10 container-custom text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg mb-6 border border-white/30">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold text-white">Premium Collections</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Explore Our{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Beautiful Collections
                </span>
              </h1>

              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Discover thoughtfully curated home furnishings that blend style, comfort, and functionality.
                Each collection tells a unique story for your home.
              </p>
            </div>
          </section>

          {/* Error Section */}
          <section className="py-20">
            <div className="container-custom text-center">
              <div className="max-w-md mx-auto">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Collections</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Metadata {...generateCollectionsMetadata()} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section with Background Image */}
        <section className="relative py-5 overflow-hidden h-[60vh]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/hero-bg-1.jpg"
              alt="Beautiful home interior with elegant furnishings"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20"></div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-100/30 to-pink-100/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
          </div>

          <div className="relative z-10 container-custom text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg mb-6 border border-white/30">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold text-white">Premium Collections</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Explore Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Beautiful Collections
              </span>
            </h1>

            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Discover thoughtfully curated home furnishings that blend style, comfort, and functionality.
              Each collection tells a unique story for your home.
            </p>

            {/* Call to Action Button */}
            <div className="mt-8">
              <Link href="#collections">
                <button className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105 shadow-lg">
                  <span className="flex items-center gap-2">
                    Explore Collections
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section id="collections" className="py-20">
          <div className="container-custom">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Collections Available</h2>
                <p className="text-gray-600">Collections will appear here once they are added to the system.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Our Premium Collections
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Discover our carefully curated collections, each designed to transform your living spaces with style and sophistication.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/collections/${category.slug}`}
                      className="group block"
                    >
                      <div className="card transform group-hover:scale-105 transition-all duration-300 hover:shadow-xl">
                        {/* Collection Image */}
                        <div className="relative overflow-hidden aspect-[4/3]">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-100 via-pink-100 to-purple-100 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                  <ShoppingBag className="w-10 h-10 text-primary-600" />
                                </div>
                                <span className="text-gray-600 font-medium">{category.name}</span>
                              </div>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 text-center">
                                <span className="text-sm font-semibold text-gray-900">View Collection</span>
                              </div>
                            </div>
                          </div>

                          {/* Collection Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-md text-gray-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                              {category.productCount} Products
                            </span>
                          </div>
                        </div>

                        {/* Collection Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                            {category.name}
                          </h3>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {category.description || `Explore our ${category.name.toLowerCase()} collection featuring premium quality and modern designs.`}
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {category.features.map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Collection Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>4.8</span>
                            </span>
                            <span>•</span>
                            <span>Premium Quality</span>
                            <span>•</span>
                            <span>Free Shipping</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-primary-50">
          <div className="container-custom text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Ready to Transform Your Home?
              </h2>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our expert team is here to help you choose the perfect pieces for your space.
                Get personalized recommendations and expert advice.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <button className="btn-primary group">
                    <span>Get Expert Advice</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>

                <Link href="/interior-design">
                  <button className="btn-secondary group">
                    <span>Interior Design Services</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
