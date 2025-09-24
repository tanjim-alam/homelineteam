'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import ProductNavbar from './ProductNavbar';
import api from '@/services/api';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  Phone,
  User
} from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const { getCartCount, getWishlistCount } = useCart();
  const { user, isAuthenticated, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories for mobile menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getHierarchicalCategories();

        let categoriesData = [];
        if (data && Array.isArray(data)) {
          categoriesData = data;
        } else if (data && data.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        } else if (data && data.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data && data.success && data.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        }

        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setMainCategories(categoriesData);

          // Create subcategories lookup
          const subcategoriesMap = {};
          categoriesData.forEach(mainCategory => {
            if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
              subcategoriesMap[mainCategory._id] = mainCategory.subcategories;
            }
          });
          setSubcategories(subcategoriesMap);
        } else {
          // Fallback to main categories only
          const mainCategoriesData = await api.getMainCategories();
          if (Array.isArray(mainCategoriesData)) {
            setMainCategories(mainCategoriesData);
          } else if (mainCategoriesData && Array.isArray(mainCategoriesData.data)) {
            setMainCategories(mainCategoriesData.data);
          }
        }
      } catch (error) {
        try {
          const mainCategoriesData = await api.getMainCategories();
          if (Array.isArray(mainCategoriesData)) {
            setMainCategories(mainCategoriesData);
          } else if (mainCategoriesData && Array.isArray(mainCategoriesData.data)) {
            setMainCategories(mainCategoriesData.data);
          }
        } catch (fallbackError) {
          // Silent error handling
        }
      } finally {
        setCategoriesLoading(false);
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
    setExpandedCategory(null);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <>
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
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-primary-600">
              <Image src="/logo.jpeg" alt="HomeLine" width={150} height={100} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="/collections" className="text-gray-700 hover:text-primary-600 transition-colors">
                All Products
              </Link>
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

              {/* User Authentication */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 border border-gray-300 rounded-lg hover:border-primary-300"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}

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
              <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={handleNavLinkClick}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto mobile-menu-scroll">
                  {/* Navigation Links */}
                  <div className="flex flex-col py-6">
                    <Link
                      href="/"
                      onClick={handleNavLinkClick}
                      className="px-6 py-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Home
                    </Link>

                    <Link
                      href="/collections"
                      onClick={handleNavLinkClick}
                      className="px-6 py-4 text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors font-medium"
                    >
                      All Products
                    </Link>

                    {/* Categories Section */}
                    <div className="px-6">
                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Product Categories
                      </div>
                      {categoriesLoading ? (
                        <div className="text-gray-500 text-sm">Loading categories...</div>
                      ) : mainCategories.length > 0 ? (
                        <div className="space-y-2">
                          {mainCategories.map((mainCategory) => (
                            <div key={mainCategory._id || mainCategory.slug} className="border-b border-gray-100 last:border-b-0">
                              {/* Main Category */}
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/collections/${mainCategory.slug}`}
                                  onClick={handleNavLinkClick}
                                  className="block py-3 text-gray-800 hover:text-primary-600 transition-colors font-medium flex-1"
                                >
                                  {mainCategory.name}
                                </Link>

                                {/* Expand/Collapse Button for Subcategories */}
                                {subcategories[mainCategory._id] && subcategories[mainCategory._id].length > 0 && (
                                  <button
                                    onClick={() => toggleCategory(mainCategory._id)}
                                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                                  >
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform duration-200 ${expandedCategory === mainCategory._id ? 'rotate-180' : ''
                                        }`}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Subcategories */}
                              {subcategories[mainCategory._id] &&
                                subcategories[mainCategory._id].length > 0 &&
                                expandedCategory === mainCategory._id && (
                                  <div className="pl-4 pb-2 space-y-1">
                                    {subcategories[mainCategory._id].map((subcategory) => (
                                      <Link
                                        key={subcategory._id || subcategory.slug}
                                        href={`/${mainCategory.slug}/${subcategory.slug}`}
                                        onClick={handleNavLinkClick}
                                        className="block py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors hover:bg-gray-50 rounded-lg px-2"
                                      >
                                        {subcategory.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No categories available</div>
                      )}
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
                </div>

                {/* Fixed Footer Sections */}
                <div className="flex-shrink-0">
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
            </div>
          )}
        </div>

        {/* Second Navbar for Product Categories */}
        <ProductNavbar />
      </nav>
    </>
  );
}
