'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Grid, List, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import SearchBox from '@/components/SearchBox';
import api from '@/services/api';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Normalise whatever shape the API returns into a plain array */
function normaliseProducts(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;
  if (data.success && Array.isArray(data.data)) return data.data;
  return [];
}

// ─── inner component (needs useSearchParams, so must be inside Suspense) ─────

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query — the source of truth for "what was last searched"
  const urlQuery = searchParams.get('q') || '';

  // Local input value — what the user is currently typing
  const [inputValue, setInputValue] = useState(urlQuery);

  // Products + UI state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // track if any search ran
  const [activeQuery, setActiveQuery] = useState('');    // what was actually searched

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // ── Core search function ────────────────────────────────────────────────────
  // Takes explicit sortBy/filters params to avoid stale closure bugs
  const runSearch = useCallback(async (q, sort = 'relevance', activeFilters = {}) => {
    const trimmed = q?.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setActiveQuery(trimmed);

    try {
      const raw = await api.searchProducts(trimmed, {
        sort,
        ...activeFilters,
      });
      setProducts(normaliseProducts(raw));
    } catch (err) {
      setError(err?.message || 'Search failed. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Run search when URL query changes (navigation / Navbar search) ──────────
  useEffect(() => {
    if (urlQuery) {
      setInputValue(urlQuery);
      runSearch(urlQuery, sortBy, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // ── Submit from the in-page search bar ─────────────────────────────────────
  // Update URL so the address bar reflects the search and back button works
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // If same as URL query just re-run without navigation
    if (trimmed === urlQuery) {
      runSearch(trimmed, sortBy, filters);
    } else {
      // Push to URL → triggers the useEffect above
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // ── Sort change ─────────────────────────────────────────────────────────────
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (hasSearched && activeQuery) {
      runSearch(activeQuery, newSort, filters); // pass newSort directly — no stale closure
    }
  };

  // ── Filter change ───────────────────────────────────────────────────────────
  const handleFilterChange = (type, value) => {
    const updated = { ...filters };
    if (value) updated[type] = value;
    else delete updated[type];
    setFilters(updated);
    if (hasSearched && activeQuery) {
      runSearch(activeQuery, sortBy, updated); // pass updated directly
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('relevance');
    if (hasSearched && activeQuery) {
      runSearch(activeQuery, 'relevance', {});
    }
  };

  // ── Quick-search chips ──────────────────────────────────────────────────────
  const handleChipClick = (term) => {
    setInputValue(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || sortBy !== 'relevance';
  const showResults = hasSearched || !!urlQuery;

  const POPULAR = ['curtains', 'blinds', 'wallpaper', 'cushions', 'table runner'];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Search Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b shadow-sm">
        <div className="container-custom py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              {activeQuery
                ? <>Results for <span className="text-primary-600">"{activeQuery}"</span></>
                : 'Search Products'}
            </h1>

            {/* Search bar with suggestions */}
            <SearchBox
              size="lg"
              placeholder="Search for curtains, wallpapers, cushions…"
              defaultValue={inputValue}
              onSearch={(q) => {
                setInputValue(q)
                if (q === urlQuery) runSearch(q, sortBy, filters)
                else router.push(`/search?q=${encodeURIComponent(q)}`)
              }}
            />

            {/* Popular search chips — always visible */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500 self-center">Popular:</span>
              {POPULAR.map((term) => (
                <button
                  key={term}
                  onClick={() => handleChipClick(term)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors duration-200 cursor-pointer
                    ${activeQuery === term
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-600'
                    }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters / Sort bar — only when there has been a search ─────────── */}
      {showResults && (
        <div className="bg-white border-b sticky top-[64px] z-20 shadow-sm">
          <div className="container-custom py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

              {/* Left: filter toggle + clear */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(p => !p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer
                    ${showFilters
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                    }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {Object.keys(filters).length + (sortBy !== 'relevance' ? 1 : 0)}
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </button>
                )}
              </div>

              {/* Right: sort + view mode */}
              <div className="flex items-center gap-3">
                {!loading && (
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {products.length} result{products.length !== 1 ? 's' : ''}
                  </span>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  {[['grid', Grid], ['list', List]].map(([mode, Icon]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 cursor-pointer transition-colors ${
                        viewMode === mode ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded filter panel ─────────────────────────────────────────── */}
      {showResults && showFilters && (
        <div className="bg-white border-b">
          <div className="container-custom py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                {
                  label: 'Price Range', key: 'priceRange',
                  options: [
                    { label: 'Any Price', value: '' },
                    { label: 'Under ₹100', value: '0-100' },
                    { label: '₹100 – ₹500', value: '100-500' },
                    { label: '₹500 – ₹1000', value: '500-1000' },
                    { label: 'Above ₹1000', value: '1000+' },
                  ]
                },
                {
                  label: 'Category', key: 'category',
                  options: [
                    { label: 'All Categories', value: '' },
                    { label: 'Kitchen & Dining', value: 'kitchen-dining' },
                    { label: 'Living Room', value: 'living-room' },
                    { label: 'Bedroom', value: 'bedroom' },
                    { label: 'Bathroom', value: 'bathroom' },
                  ]
                },
                {
                  label: 'Availability', key: 'availability',
                  options: [
                    { label: 'All', value: '' },
                    { label: 'In Stock', value: 'in-stock' },
                    { label: 'Out of Stock', value: 'out-of-stock' },
                  ]
                },
                {
                  label: 'Min Rating', key: 'rating',
                  options: [
                    { label: 'Any Rating', value: '' },
                    { label: '4+ Stars', value: '4' },
                    { label: '3+ Stars', value: '3' },
                    { label: '2+ Stars', value: '2' },
                  ]
                },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    {label}
                  </label>
                  <select
                    value={filters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    {options.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Results area ──────────────────────────────────────────────────── */}
      <div className="container-custom py-8">

        {/* Loading skeleton */}
        {loading && (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-square mb-3" />
                <div className="bg-gray-200 h-5 rounded mb-2" />
                <div className="bg-gray-200 h-4 rounded w-2/3 mb-2" />
                <div className="bg-gray-200 h-5 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => runSearch(activeQuery, sortBy, filters)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors cursor-pointer font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && hasSearched && products.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results for "{activeQuery}"
            </h3>
            <p className="text-gray-500 mb-6">
              Try different keywords, or browse popular categories below.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {POPULAR.map((term) => (
                <button
                  key={term}
                  onClick={() => handleChipClick(term)}
                  className="px-4 py-2 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 transition-colors cursor-pointer text-sm font-medium"
                >
                  Try "{term}"
                </button>
              ))}
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Empty state before first search */}
        {!loading && !error && !hasSearched && (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Type something above and press Search</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && products.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {products.length} product{products.length !== 1 ? 's' : ''} found for "{activeQuery}"
            </p>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Outer page — wraps inner component in Suspense (required for useSearchParams)
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading search…</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}