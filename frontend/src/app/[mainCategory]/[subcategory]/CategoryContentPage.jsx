'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft, Filter, Grid, List, ShoppingCart,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import api from '@/services/api';

export default function CategoryContent({
  initialCategory,
  initialMainCategory,
  initialProducts,
  initialFilterOptions,
  mainCategorySlug,
  subcategorySlug,
}) {
  const [category] = useState(initialCategory);
  const [mainCategoryData] = useState(initialMainCategory);
  const [products, setProducts] = useState(initialProducts || []);
  const [filterOptions] = useState(initialFilterOptions);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  console.log("subcategorySlug:", subcategorySlug);
  console.log("mainCategorySlug:", mainCategorySlug);
  console.log("Initial category data:", category);
  console.log("Initial main category data:", mainCategoryData);
  console.log("Initial products:", products);
  console.log("Initial filter options:", filterOptions);

  // ── Re-fetch products when sort or filters change ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setIsFetching(true);
      try {
        const res = await api.getSubcategoryProducts(subcategorySlug, mainCategorySlug, {
          sort: sortBy,
          ...filters,
        });

        if (cancelled) return;

        let arr = [];
        if (Array.isArray(res)) arr = res;
        else if (res?.products) arr = res.products;
        else if (res?.data) arr = res.data;

        setProducts(arr);
      } catch (_) {
        // silently keep current products
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [sortBy, filters, mainCategorySlug, subcategorySlug]);

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handlePriceRangeChange = (min, max) =>
    setFilters(p => ({ ...p, priceRange: { min, max } }));

  const handleBrandToggle = (brand) =>
    setFilters(p => {
      const cur = p.brands || [];
      return { ...p, brands: cur.includes(brand) ? cur.filter(b => b !== brand) : [...cur, brand] };
    });

  const handleRatingToggle = (rating) =>
    setFilters(p => {
      const cur = p.ratings || [];
      return { ...p, ratings: cur.includes(rating) ? cur.filter(r => r !== rating) : [...cur, rating] };
    });

  const handleAvailabilityToggle = (val) =>
    setFilters(p => {
      const cur = p.availability || [];
      return { ...p, availability: cur.includes(val) ? cur.filter(a => a !== val) : [...cur, val] };
    });

  const handleImportantFilterToggle = (key, val) =>
    setFilters(p => {
      const cur = p[key] || [];
      return { ...p, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] };
    });

  const clearAllFilters = () => setFilters({});

  const activeFiltersCount = Object.values(filters).reduce((acc, v) => {
    if (Array.isArray(v)) return acc + v.length;
    if (v && typeof v === 'object') return acc + Object.values(v).filter(Boolean).length;
    return v ? acc + 1 : acc;
  }, 0);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100 shadow-lg lg:sticky lg:top-8 lg:h-fit">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Filters</h2>
        <p className="text-sm text-gray-600">{products.length} products found</p>
      </div>

      <div className="space-y-4">

        {/* Price Range */}
        {filterOptions?.priceRange && (
          <FilterCard title="Price Range">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min={filterOptions.priceRange.min}
                  max={filterOptions.priceRange.max}
                  className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={e => handlePriceRangeChange(e.target.value, filters.priceRange?.max)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min={filterOptions.priceRange.min}
                  max={filterOptions.priceRange.max}
                  className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={e => handlePriceRangeChange(filters.priceRange?.min, e.target.value)}
                />
              </div>
              <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg py-2">
                Range: ₹{filterOptions.priceRange.min} – ₹{filterOptions.priceRange.max}
              </div>
            </div>
          </FilterCard>
        )}

        {/* Brands */}
        {filterOptions?.brands?.length > 0 && (
          <FilterCard title="Brand">
            <CheckboxList
              items={filterOptions.brands}
              checked={filters.brands || []}
              onToggle={handleBrandToggle}
            />
          </FilterCard>
        )}

        {/* Ratings */}
        {filterOptions?.ratings?.length > 0 && (
          <FilterCard title="Rating">
            {filterOptions.ratings.map(rating => (
              <label key={rating} className="flex items-center gap-3 group cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={filters.ratings?.includes(rating) || false}
                  onChange={() => handleRatingToggle(rating)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{rating}★ & above</span>
              </label>
            ))}
          </FilterCard>
        )}

        {/* Availability */}
        {filterOptions?.availability?.length > 0 && (
          <FilterCard title="Availability">
            <CheckboxList
              items={filterOptions.availability}
              checked={filters.availability || []}
              onToggle={handleAvailabilityToggle}
            />
          </FilterCard>
        )}

        {/* Important Filters */}
        {filterOptions?.importantFilters?.length > 0 && (
          <FilterCard title="Product Features">
            <div className="space-y-4">
              {filterOptions.importantFilters.map(filter => (
                <div key={filter.key} className="border-l-2 border-blue-200 pl-3">
                  <h5 className="text-xs font-semibold text-gray-800 mb-2">
                    {filter.name}
                    {filter.unit && <span className="text-gray-500 ml-1">({filter.unit})</span>}
                  </h5>
                  <CheckboxList
                    items={filter.options}
                    checked={filters[filter.key] || []}
                    onToggle={val => handleImportantFilterToggle(filter.key, val)}
                    small
                  />
                </div>
              ))}
            </div>
          </FilterCard>
        )}

        {/* Clear all */}
        <div className="pt-3 border-t border-blue-200">
          <button
            onClick={clearAllFilters}
            className="flex items-center justify-center gap-1 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Category Header ──────────────────────────────────────────────────── */}
      <div className="relative bg-white overflow-hidden h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          {category?.image ? (
            <Image src={category.image} alt={category.name || ''} fill className="object-cover" priority sizes="100vw" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 via-pink-100 to-purple-100" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20" />
        </div>

        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100/20 rounded-full mix-blend-overlay blur-3xl opacity-60" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-100/20 rounded-full mix-blend-overlay blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 container-custom h-full flex flex-col justify-center">
          <div className="text-center">

            {/* Breadcrumb — visible to users; SEO breadcrumb is in the server component */}
            <nav aria-label="breadcrumb" className="flex items-center justify-center space-x-2 text-sm text-white/80 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronLeft className="w-4 h-4" />
              <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
              <ChevronLeft className="w-4 h-4" />
              <Link href={`/collections/${mainCategorySlug}`} className="hover:text-white transition-colors capitalize">
                {mainCategoryData?.name || mainCategorySlug?.replace(/-/g, ' ')}
              </Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-white font-medium">{category?.name}</span>
            </nav>

            {/* h1 is also in the server sr-only div, but rendering here visually */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {category?.name}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-md">
              {category?.description || `Explore our ${category?.name?.toLowerCase()} collection`}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/90">
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
            </div>

            {category?.customFields?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {category.customFields.slice(0, 4).map((field, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                    {field.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter toggle ─────────────────────────────────────────────── */}
      <div className="lg:hidden bg-white border-b sticky top-20 z-20">
        <div className="container-custom py-3">
          <button
            onClick={() => setShowFilters(p => !p)}
            className="flex items-center justify-center gap-2 text-gray-700 hover:text-primary-600 w-full py-2 px-4 bg-gray-50 rounded-lg border transition-all hover:bg-gray-100 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="container-custom py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-80 w-full`}>
            <Sidebar />
          </div>

          {/* Products area */}
          <div className="flex-1">

            {/* Sort + view controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {isFetching ? (
                    <span className="text-gray-400">Updating...</span>
                  ) : (
                    <>
                      Showing <span className="font-semibold text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                      {activeFiltersCount > 0 && (
                        <span className="text-primary-600 ml-1">({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied)</span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="border border-gray-200 text-gray-900 cursor-pointer rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    {[['grid', Grid], ['list', List]].map(([mode, Icon]) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`p-2 transition-all cursor-pointer ${viewMode === mode ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div className={`relative transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {products.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or browse other categories.
                  </p>
                  <Link href="/collections" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all font-medium">
                    Browse All Categories
                  </Link>
                </div>
              ) : (
                <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small reusable sub-components ─────────────────────────────────────────────

function FilterCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
        <span>{icon}</span> {title}
      </h4>
      {children}
    </div>
  );
}

function CheckboxList({ items, checked, onToggle, small = false }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <label key={item} className="flex items-center group cursor-pointer">
          <input
            type="checkbox"
            checked={checked.includes(item)}
            onChange={() => onToggle(item)}
            className={`${small ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600 border-gray-300 rounded focus:ring-blue-500`}
          />
          <span className={`ml-${small ? 2 : 3} ${small ? 'text-xs' : 'text-sm'} text-gray-700 group-hover:text-gray-900 transition-colors`}>
            {item}
          </span>
        </label>
      ))}
    </div>
  );
}