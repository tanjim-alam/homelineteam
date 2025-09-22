'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Filter, Grid, List, Star, ShoppingCart, Heart, X, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import api from '@/services/api';
import Metadata from '@/components/Metadata';
import { generateCategoryMetadata, generateCategoryStructuredData } from '@/utils/metadata';

export default function CategoryPage() {
  const params = useParams();
  const { slug } = params;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        // Fetch category details
        const categoryData = await api.getCategoryBySlug(slug);
        setCategory(categoryData);

        // Fetch filter options for this category
        const filterData = await api.getCategoryFilterOptions(slug);
        setFilterOptions(filterData);

        // Initialize expanded filters based on available filter options
        const initialExpandedState = {};
        if (filterData.brands?.length > 0) initialExpandedState.brands = true;
        if (filterData.ratings?.length > 0) initialExpandedState.ratings = true;
        if (filterData.availability?.length > 0) initialExpandedState.availability = true;
        if (filterData.importantFilters && Object.keys(filterData.importantFilters).length > 0) {
          initialExpandedState.importantFilters = true;
        }
        initialExpandedState.price = true; // Always show price filter

        setExpandedFilters(initialExpandedState);

        // Fetch products for this category
        const productsData = await api.getCategoryProducts(slug, {
          sort: sortBy,
          ...filters
        });

        // Handle different possible data structures
        let productsArray = [];
        if (productsData && Array.isArray(productsData)) {
          // If API returns array directly
          productsArray = productsData;
        } else if (productsData && productsData.products && Array.isArray(productsData.products)) {
          // If API returns { products: [...] }
          productsArray = productsData.products;
        } else if (productsData && productsData.data && Array.isArray(productsData.data)) {
          // If API returns { data: [...] }
          productsArray = productsData.data;
        } else if (productsData && productsData.success && productsData.data && Array.isArray(productsData.data)) {
          // If API returns { success: true, data: [...] }
          productsArray = productsData.data;
        }

        setProducts(productsArray);

      } catch (err) {
        setError(err.message);

        // Fallback data
        setCategory({
          name: 'Category',
          description: 'Explore our amazing collection',
          image: '/images/category-placeholder.jpg'
        });
        setProducts([]);
        setFilterOptions({
          priceRange: { min: 0, max: 10000 },
          brands: [],
          ratings: [5, 4, 3, 2, 1],
          availability: ['In Stock', 'Out of Stock', 'Pre-order'],
          importantFilters: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    // Refetch products when filters or sort changes
    if (category && !loading) {
      const fetchProducts = async () => {
        try {
          const productsData = await api.getCategoryProducts(slug, {
            sort: sortBy,
            ...filters
          });

          // Handle different possible data structures
          let productsArray = [];
          if (productsData && Array.isArray(productsData)) {
            // If API returns array directly
            productsArray = productsData;
          } else if (productsData && productsData.products && Array.isArray(productsData.products)) {
            // If API returns { products: [...] }
            productsArray = productsData.products;
          } else if (productsData && productsData.data && Array.isArray(productsData.data)) {
            // If API returns { data: [...] }
            productsArray = productsData.data;
          } else if (productsData && productsData.success && productsData.data && Array.isArray(productsData.data)) {
            // If API returns { success: true, data: [...] }
            productsArray = productsData.data;
          }

          setProducts(productsArray);
        } catch (err) {
          // Handle error silently or show user-friendly message
        }
      };

      fetchProducts();
    }
  }, [sortBy, filters, category, loading, slug]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const handleBrandToggle = (brand) => {
    setFilters(prev => {
      const currentBrands = prev.brands || [];
      const newBrands = currentBrands.includes(brand)
        ? currentBrands.filter(b => b !== brand)
        : [...currentBrands, brand];
      return { ...prev, brands: newBrands };
    });
  };

  const handleRatingToggle = (rating) => {
    setFilters(prev => {
      const currentRatings = prev.ratings || [];
      const newRatings = currentRatings.includes(rating)
        ? currentRatings.filter(r => r !== rating)
        : [...currentRatings, rating];
      return { ...prev, ratings: newRatings };
    });
  };

  const handleAvailabilityToggle = (availability) => {
    setFilters(prev => {
      const currentAvailability = prev.availability || [];
      const newAvailability = currentAvailability.includes(availability)
        ? currentAvailability.filter(a => a !== availability)
        : [...currentAvailability, availability];
      return { ...prev, availability: newAvailability };
    });
  };

  const handleImportantFilterToggle = (filterKey, value) => {
    setFilters(prev => {
      const currentValues = prev[filterKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterKey]: newValues };
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach(value => {
      if (Array.isArray(value)) {
        count += value.length;
      } else if (value && typeof value === 'object') {
        count += Object.values(value).filter(v => v !== null && v !== undefined).length;
      } else if (value) {
        count += 1;
      }
    });
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-1/3 rounded mb-4"></div>
            <div className="bg-gray-200 h-4 w-2/3 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/collections" className="btn-primary">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Metadata
        {...generateCategoryMetadata(category)}
        structuredData={generateCategoryStructuredData(category)}
        canonicalUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/collections/${slug}`}
      />
      <div className="min-h-screen bg-gray-50">

        {/* Category Header with Background Image */}
        <div className="relative bg-white overflow-hidden h-[50vh] min-h-[400px]">
          {/* Background Image */}
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
              <div className="w-full h-full bg-gradient-to-br from-primary-100 via-pink-100 to-purple-100"></div>
            )}

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20"></div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-100/20 to-pink-100/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
          </div>

          <div className="relative z-10 container-custom h-full flex flex-col justify-center">
            <div className="text-center">
              {/* Breadcrumb */}
              <nav className="flex items-center justify-center space-x-2 text-sm text-white/80 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronLeft className="w-4 h-4" />
                <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-white font-medium">{category?.name}</span>
              </nav>

              {/* Category Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {category?.name}
              </h1>

              {/* Category Description */}
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-md">
                {category?.description || `Explore our amazing collection of ${category?.name?.toLowerCase()} products`}
              </p>

              {/* Product Count and Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm md:text-base font-medium">
                    {products.length} product{products.length !== 1 ? 's' : ''} available
                  </span>
                </div>

                {filterOptions?.priceRange && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm md:text-base">
                      ₹{filterOptions.priceRange.min} - ₹{filterOptions.priceRange.max}
                    </span>
                  </div>
                )}

                {filterOptions?.brands && filterOptions.brands.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm md:text-base">
                      {filterOptions.brands.length} brand{filterOptions.brands.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Category Features/Tags */}
              {category?.customFields && category.customFields.length > 0 && (
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

        {/* Main Content */}
        <div className="container-custom py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Sidebar Filters */}
            <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-80 w-full`}>
              <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100 shadow-lg lg:sticky lg:top-8 lg:h-fit">
                {/* Filter Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Filters</h3>
                  <p className="text-sm text-gray-600">{products.length} products found</p>
                </div>

                <div className="space-y-4">
                  {/* Price Range Filter */}
                  {filterOptions?.priceRange && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <span className="w-4 h-4 text-blue-600">💰</span>
                        Price Range
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Min"
                              min={filterOptions.priceRange.min}
                              max={filterOptions.priceRange.max}
                              className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              onChange={(e) => handlePriceRangeChange(e.target.value, filters.priceRange?.max)}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              placeholder="Max"
                              min={filterOptions.priceRange.min}
                              max={filterOptions.priceRange.max}
                              className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              onChange={(e) => handlePriceRangeChange(filters.priceRange?.min, e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg py-2">
                          Range: ₹{filterOptions.priceRange.min} - ₹{filterOptions.priceRange.max}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Brand Filter */}
                  {filterOptions?.brands && filterOptions.brands.length > 0 && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <span className="w-4 h-4 text-blue-600">🏷️</span>
                        Brand
                      </h4>
                      <div className="space-y-2">
                        {filterOptions.brands.map((brand) => (
                          <label key={brand} className="flex items-center group cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.brands?.includes(brand) || false}
                              onChange={() => handleBrandToggle(brand)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating Filter */}
                  {filterOptions?.ratings && filterOptions.ratings.length > 0 && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <span className="w-4 h-4 text-blue-600">⭐</span>
                        Rating
                      </h4>
                      <div className="space-y-2">
                        {filterOptions.ratings.map((rating) => (
                          <label key={rating} className="flex items-center group cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.ratings?.includes(rating) || false}
                              onChange={() => handleRatingToggle(rating)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                              {rating}★ & above
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability Filter */}
                  {filterOptions?.availability && filterOptions.availability.length > 0 && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <span className="w-4 h-4 text-blue-600">📦</span>
                        Availability
                      </h4>
                      <div className="space-y-2">
                        {filterOptions.availability.map((availability) => (
                          <label key={availability} className="flex items-center group cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.availability?.includes(availability) || false}
                              onChange={() => handleAvailabilityToggle(availability)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{availability}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Filters (Material, Style, Color, etc.) */}
                  {filterOptions?.importantFilters && filterOptions.importantFilters.length > 0 && (
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <span className="w-4 h-4 text-blue-600">🎨</span>
                        Product Features
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
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                                  />
                                  <span className="ml-2 text-xs text-gray-600 group-hover:text-gray-800 transition-colors">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear All Button */}
                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-blue-200">
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center cursor-pointer justify-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
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

            {/* Right Content */}
            <div className="flex-1">
              {/* Sort and View Controls */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Results Count */}
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                    {getActiveFiltersCount() > 0 && (
                      <span className="text-primary-600 ml-1">
                        ({getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied)
                      </span>
                    )}
                  </div>

                  {/* Sort and View */}
                  <div className="flex items-center gap-3">
                    <select
                      className="border border-gray-200 text-gray-900 cursor-pointer rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                        className={`p-2 transition-all duration-200 cursor-pointer ${viewMode === 'grid'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 transition-all duration-200 cursor-pointer ${viewMode === 'list'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Try adjusting your filters or browse other categories to find what you're looking for.</p>
                  <Link href="/collections" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium">
                    Browse All Categories
                  </Link>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
                  : 'grid-cols-1'
                  }`}>
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-gray-500 text-lg mb-4">
                        {Array.isArray(products) ? 'No products found in this category' : 'Loading products...'}
                      </div>
                      <Link
                        href="/collections"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Browse All Categories
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        {category?.seoContent && (
          <div className="bg-white border-t">
            <div className="container-custom py-8 lg:py-12">
              <div className="max-w-4xl mx-auto">
                <div
                  className="seo-content"
                  dangerouslySetInnerHTML={{ __html: category.seoContent }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
