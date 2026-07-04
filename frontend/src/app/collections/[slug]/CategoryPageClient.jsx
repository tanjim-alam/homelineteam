'use client';

import ProductCard from '@/components/ProductCard';
import api from '@/services/api';
import {
  ChevronDown, ChevronLeft, ChevronUp,
  Filter, Grid, List, ShoppingBag, ShoppingCart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CategoryPageClient({
  slug,
  initialCategory,
  initialProducts,
  initialFilterOptions,
  isMainCategory = false,
  initialSubcategories = [],
}) {
  const [category] = useState(initialCategory);
  const [products, setProducts] = useState(initialProducts);
  const [filterOptions] = useState(initialFilterOptions);
  const [subcategories] = useState(initialSubcategories);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isMainCategory) return;

    const fetchProducts = async () => {
      try {
        const productsData = await api.getCategoryProducts(slug, {
          sort: sortBy,
          ...filters,
        });
        if (Array.isArray(productsData)) setProducts(productsData);
        else if (productsData?.products) setProducts(productsData.products);
        else if (productsData?.data) setProducts(productsData.data);
      } catch {
        // silent
      }
    };

    fetchProducts();
  }, [sortBy, filters, slug, isMainCategory]);

  const handleSortChange = (newSort) => setSortBy(newSort);

  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({ ...prev, priceRange: { min, max } }));
  };

  const handleBrandToggle = (brand) => {
    setFilters(prev => {
      const current = prev.brands || [];
      return {
        ...prev,
        brands: current.includes(brand)
          ? current.filter(b => b !== brand)
          : [...current, brand],
      };
    });
  };

  const handleRatingToggle = (rating) => {
    setFilters(prev => {
      const current = prev.ratings || [];
      return {
        ...prev,
        ratings: current.includes(rating)
          ? current.filter(r => r !== rating)
          : [...current, rating],
      };
    });
  };

  const handleAvailabilityToggle = (availability) => {
    setFilters(prev => {
      const current = prev.availability || [];
      return {
        ...prev,
        availability: current.includes(availability)
          ? current.filter(a => a !== availability)
          : [...current, availability],
      };
    });
  };

  const handleImportantFilterToggle = (filterKey, value) => {
    setFilters(prev => {
      const current = prev[filterKey] || [];
      return {
        ...prev,
        [filterKey]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const clearAllFilters = () => setFilters({});

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach(value => {
      if (Array.isArray(value)) count += value.length;
      else if (value && typeof value === 'object')
        count += Object.values(value).filter(v => v != null).length;
      else if (value) count += 1;
    });
    return count;
  };

  const CategoryHeader = ({ showStats = true }) => (
    <div className="relative bg-white overflow-hidden h-[50vh] min-h-[400px]">
      <div className="absolute inset-0">
        {category?.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-pink-100 to-purple-100" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-100/20 to-pink-100/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 container-custom h-full flex flex-col justify-center">
        <div className="text-center">
          <nav className="flex items-center justify-center space-x-2 text-sm text-white/80 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-white font-medium">{category?.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {category?.name}
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-md">
            {category?.description ||
              `Explore our amazing collection of ${category?.name?.toLowerCase()} products`}
          </p>

          {showStats && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-white/90">
              {isMainCategory ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm md:text-base font-medium">
                    {subcategories.length} categor{subcategories.length !== 1 ? 'ies' : 'y'} available
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-sm md:text-base font-medium">
                      {products.length} product{products.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                  {filterOptions?.priceRange && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className="text-sm md:text-base">
                        ₹{filterOptions.priceRange.min} – ₹{filterOptions.priceRange.max}
                      </span>
                    </div>
                  )}
                  {filterOptions?.brands?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-sm md:text-base">
                        {filterOptions.brands.length} brand{filterOptions.brands.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {category?.customFields?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {category.customFields.slice(0, 4).map((field, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30"
                >
                  {field.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // MAIN CATEGORY: show subcategory grid
  if (isMainCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryHeader />

        <div className="container-custom py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Browse {category?.name} Categories
            </h2>
            <p className="text-gray-600">Select a category to explore products</p>
          </div>

          {subcategories.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No subcategories found.</p>
              <Link href="/collections" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
                Back to Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {subcategories.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/collections/${sub.slug}`}
                  className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {sub.image ? (
                      <Image
                        src={sub.image}
                        alt={sub.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 via-pink-100 to-purple-100 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-primary-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                        {sub.productCount ?? 0} Products
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{sub.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {category?.seoContent && (
          <div className="bg-white border-t">
            <div className="container-custom py-8 lg:py-12">
              <div className="max-w-4xl mx-auto">
                <div className="seo-content" dangerouslySetInnerHTML={{ __html: category.seoContent }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LEAF CATEGORY: show products with filters
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryHeader />

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden bg-white border-b sticky top-20 z-20">
        <div className="container-custom py-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 text-gray-700 hover:text-primary-600 w-full py-2 px-4 bg-gray-50 rounded-lg border transition-all duration-200 hover:bg-gray-100 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="container-custom py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Sidebar Filters */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-80 w-full`}>
            <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100 shadow-lg lg:sticky lg:top-8 lg:h-fit">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Filters</h3>
                <p className="text-sm text-gray-600">{products.length} products found</p>
              </div>

              <div className="space-y-4">
                {filterOptions?.priceRange && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <span>💰</span> Price Range
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        min={filterOptions.priceRange.min}
                        max={filterOptions.priceRange.max}
                        className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handlePriceRangeChange(e.target.value, filters.priceRange?.max)}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        min={filterOptions.priceRange.min}
                        max={filterOptions.priceRange.max}
                        className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handlePriceRangeChange(filters.priceRange?.min, e.target.value)}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg py-2 mt-2">
                      Range: ₹{filterOptions.priceRange.min} – ₹{filterOptions.priceRange.max}
                    </div>
                  </div>
                )}

                {filterOptions?.brands?.length > 0 && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <span>🏷️</span> Brand
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.brands.map((brand) => (
                        <label key={brand} className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.brands?.includes(brand) || false}
                            onChange={() => handleBrandToggle(brand)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filterOptions?.ratings?.length > 0 && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <span>⭐</span> Rating
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.ratings.map((rating) => (
                        <label key={rating} className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.ratings?.includes(rating) || false}
                            onChange={() => handleRatingToggle(rating)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                            {rating}★ & above
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filterOptions?.availability?.length > 0 && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <span>📦</span> Availability
                    </h4>
                    <div className="space-y-2">
                      {filterOptions.availability.map((item) => (
                        <label key={item} className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.availability?.includes(item) || false}
                            onChange={() => handleAvailabilityToggle(item)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filterOptions?.importantFilters?.length > 0 && (
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <span>🎨</span> Product Features
                    </h4>
                    <div className="space-y-4">
                      {filterOptions.importantFilters.map((filter) => (
                        <div key={filter.key} className="border-l-2 border-blue-200 pl-3">
                          <h5 className="text-xs font-semibold text-gray-800 mb-2">
                            {filter.name}
                            {filter.unit && <span className="text-gray-500 ml-1">({filter.unit})</span>}
                          </h5>
                          <div className="space-y-1">
                            {filter.options.map((option) => (
                              <label key={option} className="flex items-center group cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters[filter.key]?.includes(option) || false}
                                  onChange={() => handleImportantFilterToggle(filter.key, option)}
                                  className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-xs text-gray-600 group-hover:text-gray-800">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-blue-200">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center cursor-pointer justify-center gap-1 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1">
            {!isMainCategory && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                    {getActiveFiltersCount() > 0 && (
                      <span className="text-primary-600 ml-1">
                        ({getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="border border-gray-200 text-gray-900 cursor-pointer rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className={`p-2 cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or browse other categories.
                </p>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
                >
                  Browse All Categories
                </Link>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'}`}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {category?.seoContent && (
        <div className="bg-white border-t">
          <div className="container-custom py-8 lg:py-12">
            <div className="max-w-4xl mx-auto">
              <div className="seo-content" dangerouslySetInnerHTML={{ __html: category.seoContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
