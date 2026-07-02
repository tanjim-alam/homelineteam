'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { useUserLocation } from '@/contexts/LocationContext';
import {
  Menu, X, Heart, ShoppingCart,
  ChevronRight, ChevronDown, User, Home,
  Layers, Phone, Info, Palette, MapPin, Loader2,
} from 'lucide-react';
import SearchBox from './SearchBox';

function LocationPill({ className = '' }) {
  const { location, status, detectLocation } = useUserLocation();
  const locating = status === 'locating';
  return (
    <button
      type="button"
      onClick={detectLocation}
      disabled={locating}
      title={location ? `${location.city}${location.state ? ', ' + location.state : ''}` : 'Detect my location'}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-sky-300 hover:text-sky-600 transition-colors disabled:opacity-60 ${className}`}
    >
      {locating ? <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" /> : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="truncate max-w-[130px]">
        {locating ? 'Locating…' : location?.city ? `Deliver to ${location.city}` : 'Detect location'}
      </span>
    </button>
  );
}

export default function Navbar({ categories = [] }) {
  const router = useRouter();
  const { getCartCount, getWishlistCount } = useCart();
  const { user, isAuthenticated, logout } = useUser();
  const [isMobileMenuOpen,  setIsMobileMenuOpen]  = useState(false);
  const [expandedCategory,  setExpandedCategory]  = useState(null);

  const closeMenu = () => { setIsMobileMenuOpen(false); setExpandedCategory(null); }

  const toggleCategory = (id) =>
    setExpandedCategory(prev => prev === id ? null : id);

  const cartCount     = getCartCount();
  const wishlistCount = getWishlistCount();

  return (
    <>
      {/* ═══════════ TOP NAV BAR ════════════════════════════════════ */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center justify-between py-3">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.jpeg" alt="HomeLine" width={140} height={48} priority />
            </Link>

            {/* Desktop centre links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/collections"    className="text-gray-700 hover:text-sky-600 transition-colors font-medium">All Products</Link>
              <Link href="/interior-design" className="text-gray-700 hover:text-sky-600 transition-colors font-medium">Interior Design</Link>
              <Link href="/about"           className="text-gray-700 hover:text-sky-600 transition-colors font-medium">About</Link>
              <Link href="/contact"         className="text-gray-700 hover:text-sky-600 transition-colors font-medium">Contact</Link>
            </div>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-3">
              <LocationPill />
              <SearchBox placeholder="Search products…" size="sm" className="w-60" />

              {isAuthenticated ? (
                <Link href="/profile" className="p-2 text-gray-600 hover:text-sky-600 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-sky-400 hover:text-sky-600 transition-all">
                  <User className="w-4 h-4" />Sign In
                </Link>
              )}

              <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile right actions */}
            <div className="flex lg:hidden items-center gap-1">
              <Link href="/cart" className="relative p-2 text-gray-600">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-sky-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-700 hover:text-sky-600 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ═══════════ MOBILE MENU ════════════════════════════════════ */}
      {/* Always mounted so the slide-out animation works */}
      <div
        className={`lg:hidden fixed inset-0 z-[999] transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Panel — slides in from right */}
        <div
          className={`absolute top-0 right-0 h-full w-[320px] max-w-[92vw] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >

          {/* ── Panel header ───────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 bg-sky-600 flex-shrink-0">
            <Image src="/logo.jpeg" alt="HomeLine" width={110} height={38}
              className="brightness-0 invert" />
            <button
              onClick={closeMenu}
              className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Search ─────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 space-y-2.5">
            <SearchBox
              placeholder="Search products…"
              size="sm"
              onSearch={(q) => { router.push(`/search?q=${encodeURIComponent(q)}`); closeMenu(); }}
            />
            <LocationPill className="w-full justify-center" />
          </div>

          {/* ── Scrollable body ─────────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Main links */}
            <div className="py-2">
              {[
                { href: '/',                icon: Home,    label: 'Home' },
                { href: '/collections',      icon: Layers,  label: 'All Products' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-5 py-3.5 text-gray-800 font-medium text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="border-t border-gray-100">
                <div className="px-5 pt-4 pb-2">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                    Shop by Category
                  </p>
                </div>

                {categories.map((cat) => {
                  const subs   = cat.subcategories || [];
                  const isOpen = expandedCategory === cat._id;
                  return (
                    <div key={cat._id || cat.slug} className="border-b border-gray-50 last:border-0">
                      <div className="flex items-center">
                        <Link
                          href={`/collections/${cat.slug}`}
                          onClick={closeMenu}
                          className="flex-1 px-5 py-3.5 text-sm font-semibold text-gray-800 hover:text-sky-600 transition-colors"
                        >
                          {cat.name}
                        </Link>
                        {subs.length > 0 && (
                          <button
                            onClick={() => toggleCategory(cat._id)}
                            className="p-4 text-gray-400 hover:text-sky-600 transition-colors"
                            aria-label={`Expand ${cat.name}`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Subcategory list */}
                      {isOpen && subs.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-100">
                          {subs.map((sub) => (
                            <Link
                              key={sub._id || sub.slug}
                              href={`/${cat.slug}/${sub.slug}`}
                              onClick={closeMenu}
                              className="flex items-center gap-2 pl-9 pr-5 py-3 text-sm text-gray-600 hover:text-sky-600 hover:bg-sky-50 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Other links */}
            <div className="border-t border-gray-100 py-2">
              {[
                { href: '/interior-design', icon: Palette, label: 'Interior Design' },
                { href: '/about',           icon: Info,    label: 'About Us' },
                { href: '/contact',         icon: Phone,   label: 'Contact' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-5 py-3.5 text-gray-700 text-sm font-medium hover:bg-sky-50 hover:text-sky-600 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  {label}
                </Link>
              ))}
            </div>

          </div>

          {/* ── Fixed footer ─────────────────────────────── */}
          <div className="border-t border-gray-100 px-4 py-4 flex-shrink-0 space-y-2.5">

            {/* Cart + Wishlist */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/wishlist"
                onClick={closeMenu}
                className="relative flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-sky-400 hover:text-sky-600 transition-all"
              >
                <Heart className="w-4 h-4" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-sky-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                onClick={closeMenu}
                className="relative flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-sky-400 hover:text-sky-600 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-sky-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors"
              >
                <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-sky-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'My Account'}</p>
                  <p className="text-xs text-gray-500">View profile</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm"
              >
                <User className="w-4 h-4" />
                Sign In / Register
              </Link>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
