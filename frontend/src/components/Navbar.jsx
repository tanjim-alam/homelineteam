'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import api from '@/services/api';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Phone
} from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const { getCartCount, getWishlistCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories for dynamic navigation
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
          // Fallback to default categories
          setCategories([
            { slug: 'curtains', name: 'Curtains' },
            { slug: 'table-runners', name: 'Table Runners' },
            { slug: 'cushions', name: 'Cushions' },
            { slug: 'bedding', name: 'Bedding' }
          ]);
        }
      } catch (error) {
        // Fallback to default categories
        setCategories([
          { slug: 'curtains', name: 'Curtains' },
          { slug: 'table-runners', name: 'Table Runners' },
          { slug: 'cushions', name: 'Cushions' },
          { slug: 'bedding', name: 'Bedding' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsCollectionsOpen(false);
  };

  const toggleCollections = () => {
    setIsCollectionsOpen(!isCollectionsOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="container-custom">
        {/* Top Bar */}
        {/* <div className="hidden lg:flex items-center justify-between py-2 text-sm text-gray-600 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+91 98765 43210</span>
            </div>
            <span>Free Shipping on Orders Above ₹500</span>
          </div>
          <div className="flex items-center gap-4">
            <span>30-Day Return Policy</span>
            <span>Secure Checkout</span>
          </div>
        </div> */}

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            <Image src="/logo.jpeg" alt="HomeLine" width={150} height={100} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-700 hover:text-primary-600 transition-colors">
                Collections
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/collections" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                  All Collections
                </Link>
                {!loading && categories.map((category) => (
                  <Link
                    key={category._id || category.slug}
                    href={`/collections/${category.slug}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/interior-design" className="text-gray-700 hover:text-primary-600 transition-colors">
              Interior Design
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 px-4 py-2 pl-10 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 relative">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {getWishlistCount()}
              </span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {getCartCount()}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleNavLinkClick}
            ></div>

            {/* Mobile Menu Panel - Slides in from right */}
            <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={handleNavLinkClick}
                  className="p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col py-6">
                <Link
                  href="/"
                  onClick={handleNavLinkClick}
                  className="px-6 py-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Home
                </Link>

                {/* Collections Dropdown */}
                <div className="px-6">
                  <button
                    onClick={toggleCollections}
                    className="flex items-center justify-between w-full py-4 text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    <span>Collections</span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-200 ${isCollectionsOpen ? 'rotate-90' : ''
                        }`}
                    />
                  </button>

                  {/* Collections Dropdown Content */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollectionsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="pl-4 pb-2 space-y-1">
                      <Link
                        href="/collections"
                        onClick={handleNavLinkClick}
                        className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        All Collections
                      </Link>
                      {!loading && categories.map((category) => (
                        <Link
                          key={category._id || category.slug}
                          href={`/collections/${category.slug}`}
                          onClick={handleNavLinkClick}
                          className="block py-2 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href="/interior-design"
                  onClick={handleNavLinkClick}
                  className="px-6 py-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Interior Design
                </Link>


                <Link
                  href="/about"
                  onClick={handleNavLinkClick}
                  className="px-6 py-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  onClick={handleNavLinkClick}
                  className="px-6 py-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  Contact
                </Link>
              </div>


              {/* Mobile Cart & Wishlist */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <Link
                    href="/wishlist"
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-2 p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors rounded-lg flex-1"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Wishlist</span>
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getWishlistCount()}
                    </span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={handleNavLinkClick}
                    className="flex items-center gap-2 p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors rounded-lg flex-1"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">Cart</span>
                    <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
