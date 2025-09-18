'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContext';
import { Home, Search, Grid3X3, ShoppingCart } from 'lucide-react';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { cartItems } = useContext(CartContext);

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      active: pathname === '/search'
    },
    {
      name: 'Categories',
      href: '/collections',
      icon: Grid3X3,
      active: pathname.startsWith('/collections')
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      active: pathname === '/cart',
      badge: cartItems.length > 0 ? cartItems.length : null
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-lg backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 px-1 transition-all duration-300 ${
                item.active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    item.active ? 'scale-110' : 'scale-100'
                  }`} 
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                item.active ? 'scale-105' : 'scale-100'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
