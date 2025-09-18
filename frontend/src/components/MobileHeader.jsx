'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContext';
import { Menu, Search, ShoppingCart } from 'lucide-react';

export default function MobileHeader() {
  const { cartItems } = useContext(CartContext);

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
          HomeLine
        </Link>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/search" 
            className="p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:scale-110"
          >
            <Search className="w-5 h-5" />
          </Link>
          
          <Link 
            href="/cart" 
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:scale-110"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                {cartItems.length > 99 ? '99+' : cartItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
