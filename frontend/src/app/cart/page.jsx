'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowLeft,
  Truck, Shield, Lock, CreditCard, ChevronRight,
  Tag, ShoppingCart,
} from 'lucide-react';
import Metadata from '@/components/Metadata';
import { generateCartMetadata } from '@/utils/metadata';

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <>
      <Metadata {...generateCartMetadata()} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom py-3 px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Cart</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
            Looks like you haven&apos;t added anything yet. Start shopping to fill it up!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/collections"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm"
            >
              Browse Collections
            </Link>
            <Link
              href="/"
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main cart page ──────────────────────────────────────────────── */
export default function CartPage() {
  const { cartItems, removeFromCart, updateCartItemQuantity, getCartTotal } = useCart();

  if (cartItems.length === 0) return <EmptyCart />;

  const subtotal = getCartTotal();
  const totalDiscount = cartItems.reduce((sum, item) => {
    return sum + (Math.max(0, (item.mrp || 0) - (item.price || 0)) * (item.quantity || 0));
  }, 0);
  const total = subtotal;

  return (
    <>
      <Metadata {...generateCartMetadata()} />
      <div className="min-h-screen bg-gray-50">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom py-3 px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Cart</span>
          </div>
        </div>

        <div className="container-custom py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Shopping Cart</h1>
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: cart items ── */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map(item => {
                const image = item.product?.mainImages?.[0] || item.image;
                const hasDiscount = (item.mrp || 0) > (item.price || 0);
                const discountPct = hasDiscount
                  ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                  : 0;
                const lineTotal = (item.price || 0) * (item.quantity || 0);
                const lineSaving = hasDiscount ? (item.mrp - item.price) * item.quantity : 0;

                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4">

                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      {image ? (
                        <Image src={image} alt={item.name} fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      {discountPct > 0 && (
                        <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg leading-none">
                          {discountPct}%
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-sky-500 transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant */}
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                          <Tag className="w-3 h-3" />
                          {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}

                      {/* Price row */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{(item.price || 0).toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{(item.mrp || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            Save ₹{(item.mrp - item.price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Bottom: qty + line total */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Qty control */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-9 text-center text-sm font-bold text-gray-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>

                        {/* Line total */}
                        <div className="text-right">
                          <p className="text-base font-extrabold text-gray-900">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </p>
                          {lineSaving > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              You save ₹{lineSaving.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Continue shopping */}
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors mt-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>

            {/* ── Right: order summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:sticky lg:top-24">
                <h2 className="text-base font-extrabold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>−₹{totalDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-extrabold text-gray-900 text-base">Total</span>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">Incl. all taxes</p>
                    </div>
                  </div>
                </div>

                {/* Savings badge */}
                {totalDiscount > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium text-center">
                    You&apos;re saving ₹{totalDiscount.toLocaleString('en-IN')} on this order!
                  </div>
                )}

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
                >
                  <CreditCard className="w-4 h-4" /> Proceed to Checkout
                </Link>

                {/* Trust badges */}
                <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                  {[
                    { icon: Truck,   color: 'text-green-500',   text: 'Free delivery on orders above ₹500' },
                    { icon: Shield,  color: 'text-blue-500',    text: '30-day hassle-free returns' },
                    { icon: Lock,    color: 'text-primary-500', text: '100% secure checkout' },
                  ].map(({ icon: Icon, color, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-xs text-gray-500">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
