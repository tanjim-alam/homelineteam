'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Grid, List, Star, ShoppingCart, Heart, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import api from '@/services/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const results = await api.searchProducts(searchQuery, {
        sort: sortBy,
        ...filters
      });
      
      setProducts(results);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (searchTerm) {
      performSearch(searchTerm);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[filterType] = value;
    } else {
      delete newFilters[filterType];
    }
    setFilters(newFilters);
    
    if (searchTerm) {
      performSearch(searchTerm);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('relevance');
    if (searchTerm) {
      performSearch(searchTerm);
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || sortBy !== 'relevance';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Search Products
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for products, categories, or keywords..."
                  className="w-full pl-12 pr-4 py-4 text-gray-700 text-lg border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:outline-none transition-colors duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition-colors duration-200 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Search Suggestions */}
            {!query && (
              <div className="mt-6">
                <p className="text-gray-600 mb-3">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['curtains', 'blinds', 'kitchen', 'bedroom', 'living room'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchTerm(term);
                        performSearch(term);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-600 transition-colors duration-200 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      {query && (
        <>
          {/* Filters Bar */}
          <div className="bg-white border-b">
            <div className="container-custom py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-primary-600"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Sort and View */}
                <div className="flex items-center gap-4">
                  <select 
                    className="border text-gray-700 cursor-pointer border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      className={`p-2 cursor-pointer ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 cursor-pointer ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border-b">
              <div className="container-custom py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select 
                      className="w-full border text-gray-700 border-gray-300 rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      value={filters.priceRange || ''}
                    >
                      <option value="">Any Price</option>
                      <option value="0-100">Under ₹100</option>
                      <option value="100-500">₹100 - ₹500</option>
                      <option value="500-1000">₹500 - ₹1000</option>
                      <option value="1000+">Above ₹1000</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      className="w-full border text-gray-700 border-gray-300 rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      value={filters.category || ''}
                    >
                      <option value="">All Categories</option>
                      <option value="kitchen-dining">Kitchen & Dining</option>
                      <option value="living-room">Living Room</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="bathroom">Bathroom</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select 
                      className="w-full border text-gray-700 border-gray-300 rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      value={filters.availability || ''}
                    >
                      <option value="">All Items</option>
                      <option value="in-stock">In Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                    <select 
                      className="w-full border text-gray-700 border-gray-300 rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      value={filters.rating || ''}
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="container-custom py-8">
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Search Results for "{query}"
                  </h2>
                  <p className="text-gray-600">
                    {loading ? 'Searching...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
                  </p>
                </div>
                
                {hasActiveFilters && (
                  <div className="text-sm text-gray-500">
                    Filters applied: {Object.keys(filters).length} active
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                    <div className="bg-gray-200 h-6 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3 mb-2"></div>
                    <div className="bg-gray-200 h-6 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <X className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search failed</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => performSearch(query)}
                  className="btn-primary cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['curtains', 'blinds', 'kitchen', 'bedroom'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchTerm(term);
                        performSearch(term);
                      }}
                      className="px-4 py-2 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 transition-colors duration-200 cursor-pointer"
                    >
                      Try "{term}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && products.length > 0 && (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
