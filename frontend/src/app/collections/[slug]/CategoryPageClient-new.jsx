'use client';

import ProductCard from '@/components/ProductCard';
import api from '@/services/api';
import {
  ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Filter, Grid, IndianRupee, List, Package,
  ShoppingBag, ShoppingCart, SlidersHorizontal, Star, Tag, X,
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
  const [category]     = useState(initialCategory);
  const [products, setProducts] = useState(initialProducts);
  const [filterOptions] = useState(initialFilterOptions);
  const [subcategories] = useState(initialSubcategories);
  const [viewMode, setViewMode]   = useState('grid');
  const [sortBy, setSortBy]       = useState('newest');
  const [filters, setFilters]     = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isMainCategory) return;
    const fetchProducts = async () => {
      try {
        const data = await api.getCategoryProducts(slug, { sort: sortBy, ...filters });
        if (Array.isArray(data))       setProducts(data);
        else if (data?.products)       setProducts(data.products);
        else if (data?.data)           setProducts(data.data);
      } catch { /* silent */ }
    };
    fetchProducts();
  }, [sortBy, filters, slug, isMainCategory]);

  /* ── filter helpers ──────────────────────────────────────────────────────── */
  const handlePriceRangeChange = (min, max) =>
    setFilters(p => ({ ...p, priceRange: { min, max } }));

  const toggle = (key, value) =>
    setFilters(p => {
      const cur = p[key] || [];
      return { ...p, [key]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });

  const clearAllFilters = () => setFilters({});

  const activeCount = () => {
    let n = 0;
    Object.values(filters).forEach(v => {
      if (Array.isArray(v)) n += v.length;
      else if (v && typeof v === 'object') n += Object.values(v).filter(Boolean).length;
      else if (v) n += 1;
    });
    return n;
  };

  /* ── Category header (hero) ──────────────────────────────────────────────── */
  const CategoryHeader = () => (
    <div className="relative overflow-hidden h-[30vh] min-h-[160px] sm:h-[40vh] sm:min-h-[120px]">
      <div className="absolute inset-0">
        {category?.image ? (
          <Image src={category.image} alt={category.name || ''} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 container-custom h-full flex flex-col justify-end pb-8 sm:pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/90">{category?.name}</span>
        </nav>

        <h1 className="text-2xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2 drop-shadow-lg leading-tight">
          {category?.name}
        </h1>

        {category?.description && (
          <p className="text-sm sm:text-base text-white/80 max-w-2xl line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Stats pill */}
        <div className="mt-4 flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
            {isMainCategory
              ? `${subcategories.length} categor${subcategories.length !== 1 ? 'ies' : 'y'}`
              : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </div>
  );

  /* ── Accordion filter item ───────────────────────────────────────────────── */
  const AccordionFilter = ({ label, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-gray-200">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between py-4 text-left group"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-gray-800 group-hover:text-gray-600 transition-colors">
            {label}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="pb-4 space-y-2.5">
            {children}
          </div>
        )}
      </div>
    );
  };

  /* ── Filter sidebar ──────────────────────────────────────────────────────── */
  const Sidebar = () => (
    <div className="bg-white lg:sticky lg:top-4 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Filter</span>
        {activeCount() > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-gray-500 hover:text-sky-600 underline underline-offset-2 transition-colors">
            Clear all ({activeCount()})
          </button>
        )}
      </div>

      {/* Price Range */}
      {filterOptions?.priceRange && (
        <AccordionFilter label="Price" defaultOpen>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={String(filterOptions.priceRange.min)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-500"
              onChange={e => handlePriceRangeChange(e.target.value, filters.priceRange?.max)}
            />
            <span className="flex items-center text-gray-400 text-sm flex-shrink-0">–</span>
            <input
              type="number"
              placeholder={String(filterOptions.priceRange.max)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-500"
              onChange={e => handlePriceRangeChange(filters.priceRange?.min, e.target.value)}
            />
          </div>
        </AccordionFilter>
      )}

      {/* Dynamic product features (size, material, style, color, etc.) */}
      {filterOptions?.importantFilters?.length > 0 && (
        filterOptions.importantFilters.map(f => (
          <AccordionFilter key={f.key} label={f.name + (f.unit ? ` (${f.unit})` : '')} defaultOpen={f.options?.length <= 6}>
            <div className="space-y-2.5">
              {f.options.map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters[f.key]?.includes(option) || false}
                    onChange={() => toggle(f.key, option)}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-none">{option}</span>
                </label>
              ))}
            </div>
          </AccordionFilter>
        ))
      )}

      {/* Brand */}
      {filterOptions?.brands?.length > 0 && (
        <AccordionFilter label="Brand">
          <div className="space-y-2.5">
            {filterOptions.brands.map(brand => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand) || false}
                  onChange={() => toggle('brands', brand)}
                  className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-none">{brand}</span>
              </label>
            ))}
          </div>
        </AccordionFilter>
      )}

      {/* Rating */}
      {filterOptions?.ratings?.length > 0 && (
        <AccordionFilter label="Rating">
          <div className="space-y-2.5">
            {filterOptions.ratings.map(rating => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.ratings?.includes(rating) || false}
                  onChange={() => toggle('ratings', rating)}
                  className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-none flex items-center gap-1">
                  {rating} <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> & above
                </span>
              </label>
            ))}
          </div>
        </AccordionFilter>
      )}

      {/* Availability */}
      {filterOptions?.availability?.length > 0 && (
        <AccordionFilter label="Availability">
          <div className="space-y-2.5">
            {filterOptions.availability.map(item => (
              <label key={item} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.availability?.includes(item) || false}
                  onChange={() => toggle('availability', item)}
                  className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-none">{item}</span>
              </label>
            ))}
          </div>
        </AccordionFilter>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     MAIN CATEGORY VIEW — subcategory grid
  ═══════════════════════════════════════════════════════════════════════════ */
  if (isMainCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CategoryHeader />

        <div className="container-custom py-10">
          {subcategories.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No subcategories found</h2>
              <Link href="/collections" className="text-sm text-sky-600 hover:text-sky-700 font-semibold">
                Back to Collections
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5 max-w-5xl mx-auto">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  {subcategories.length} Collection{subcategories.length !== 1 ? 's' : ''}
                </h2>
                <Link href="/collections" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> All
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 max-w-5xl mx-auto">
                {subcategories.map(sub => (
                  <Link key={sub._id} href={`/collections/${sub.slug}`} className="group block">
                    <article className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100 aspect-square">
                      {/* Image */}
                      {sub.image ? (
                        <Image
                          src={sub.image}
                          alt={sub.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {/* Permanent bottom gradient + name */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="text-white font-bold text-sm sm:text-base leading-snug drop-shadow-md line-clamp-2">
                          {sub.name}
                        </h3>
                        {sub.description && (
                          <p className="text-white/60 text-xs mt-0.5 line-clamp-1 hidden sm:block">
                            {sub.description}
                          </p>
                        )}
                      </div>

                      {/* "Browse" pill — slides up on hover */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                        <span className="flex items-center gap-1 bg-white text-sky-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          Browse <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {category?.seoContent && (
          <div className="bg-white border-t">
            <div className="container-custom py-8 lg:py-12 max-w-4xl mx-auto">
              <div className="seo-content" dangerouslySetInnerHTML={{ __html: category.seoContent }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     LEAF CATEGORY VIEW — products + filters
  ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryHeader />

      {/* Mobile filter toggle */}
      <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm">
        <div className="container-custom py-3">
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border text-sm font-semibold transition-colors ${
              showFilters
                ? 'bg-sky-50 border-sky-200 text-sky-600'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeCount() > 0 && (
              <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeCount()}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="container-custom py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-7">

          {/* Sidebar */}
          <div className={`lg:block lg:w-64 xl:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden'}`}>
            <Sidebar />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Sort + view controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                {activeCount() > 0 && (
                  <span className="text-sky-600 ml-1">· {activeCount()} filter{activeCount() !== 1 ? 's' : ''}</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="name-asc">Name: A → Z</option>
                  <option value="name-desc">Name: Z → A</option>
                </select>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  {[['grid', Grid], ['list', List]].map(([mode, Icon]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 cursor-pointer transition-colors ${
                        viewMode === mode ? 'bg-sky-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <ShoppingCart className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or browse other categories.</p>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl hover:bg-sky-700 transition-colors font-semibold text-sm"
                >
                  Browse All Categories
                </Link>
              </div>
            ) : (
              <div className={`grid gap-3 sm:gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {category?.seoContent && (
        <div className="bg-white border-t">
          <div className="container-custom py-8 lg:py-12 max-w-4xl mx-auto">
            <div className="seo-content" dangerouslySetInnerHTML={{ __html: category.seoContent }} />
          </div>
        </div>
      )}
    </div>
  );
}
