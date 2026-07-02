'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X, Minus, Plus, Trash2, ShoppingBag,
  ArrowRight, ShoppingCart, CheckCircle, Tag,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartDrawer() {
  const {
    cartItems,
    drawerOpen,
    closeDrawer,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    getCartCount,
    lastAdded,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const total = getCartTotal();
  const count = getCartCount();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-gray-900">Your Cart</h2>
            {count > 0 && (
              <span className="bg-primary-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Added toast banner */}
        <div
          className={`mx-4 transition-all duration-300 overflow-hidden ${
            lastAdded ? 'max-h-14 mt-3 opacity-100' : 'max-h-0 mt-0 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2.5 rounded-xl">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              <strong className="font-bold">{lastAdded}</strong> added to cart!
            </span>
          </div>
        </div>

        {/* Empty state */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Your cart is empty</p>
              <p className="text-sm text-gray-500">Add some products to get started</p>
            </div>
            <button
              onClick={closeDrawer}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2.5">
              {cartItems.map(item => {
                const image = item.product?.mainImages?.[0] || item.image;
                const discount = item.mrp > item.price
                  ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                  : 0;
                const lineTotal = item.price * item.quantity;

                return (
                  <div key={item.id} className="flex gap-3 bg-gray-50 hover:bg-gray-100/60 rounded-2xl p-3 transition-colors">
                    {/* Image */}
                    <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                      {image ? (
                        <Image src={image} alt={item.name} fill className="object-cover" sizes="60px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-0 left-0 bg-primary-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-br-lg leading-none">
                          {discount}%
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                        {item.name}
                      </p>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 text-gray-600" />
                          </button>
                        </div>
                        {/* Price */}
                        <span className="text-sm font-extrabold text-gray-900">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="self-start mt-0.5 text-gray-300 hover:text-sky-500 transition-colors cursor-pointer flex-shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 pt-4 pb-5 space-y-3">
              {/* Totals */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {count} item{count !== 1 ? 's' : ''}
                </span>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-gray-900">
                    ₹{total.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-gray-400">Incl. all taxes · Free delivery</p>
                </div>
              </div>

              {/* Actions */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
