'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowLeft,
  Truck, Shield, CreditCard, Lock
} from 'lucide-react';
import Metadata from '@/components/Metadata';
import { generateCartMetadata } from '@/utils/metadata';

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal
  } = useCart();


  const getTotalDiscount = () => {
    return cartItems.reduce((sum, item) => {
      const mrp = item.mrp || 0;
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + ((mrp - price) * quantity);
    }, 0);
  };

  const getTotal = () => {
    return getCartTotal();
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Metadata {...generateCartMetadata()} />
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="container-custom py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <Link href="/" className="hover:text-primary-600">Home</Link>
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-gray-900 font-medium">Cart</span>
              </nav>
            </div>
          </div>

          {/* Empty Cart */}
          <div className="container-custom py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                Looks like you haven't added any products to your cart yet. Start shopping to fill it up!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/collections"
                  className="btn-primary px-6 sm:px-8 py-3 text-base sm:text-lg"
                >
                  Browse Collections
                </Link>
                <Link
                  href="/"
                  className="btn-secondary px-6 sm:px-8 py-3 text-base sm:text-lg"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Metadata {...generateCartMetadata()} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container-custom py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-primary-600">Home</Link>
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-gray-900 font-medium">Cart</span>
            </nav>
          </div>
        </div>

        <div className="container-custom py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 mx-auto sm:mx-0">
                          {item.product?.mainImages?.[0] && typeof item.product.mainImages[0] === 'string' && item.product.mainImages[0].trim() !== '' ? (
                            <Image
                              src={item.product.mainImages[0]}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                                {item.name}
                              </h3>

                              {/* Variant Details */}
                              {item.variant && Object.keys(item.variant).length > 0 && (
                                <div className="space-y-1 mb-3">
                                  {Object.entries(item.variant).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-xs sm:text-sm">
                                      <span className="text-gray-500 capitalize">{key}:</span>
                                      <span className="text-gray-700 font-medium">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Price */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <span className="text-lg sm:text-xl font-bold text-gray-900">₹{(item.price || 0).toFixed(2)}</span>
                                {(item.mrp || 0) > (item.price || 0) && (
                                  <span className="text-base sm:text-lg text-gray-500 line-through">₹{(item.mrp || 0).toFixed(2)}</span>
                                )}
                                {(item.mrp || 0) > (item.price || 0) && (
                                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                                    -{Math.round((((item.mrp || 0) - (item.price || 0)) / (item.mrp || 1)) * 100)}%
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-2 self-end sm:self-start"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-4">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit mx-auto sm:mx-0">
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                              </button>
                              <span className="w-10 sm:w-12 text-center font-medium text-gray-900 text-sm sm:text-base">
                                {item.quantity || 0}
                              </span>
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                              </button>
                            </div>

                            <div className="text-center sm:text-right">
                              <div className="text-base sm:text-lg font-bold text-gray-900">
                                ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                              </div>
                              {(item.mrp || 0) > (item.price || 0) && (
                                <div className="text-xs sm:text-sm text-gray-500">
                                  You save ₹{(((item.mrp || 0) - (item.price || 0)) * (item.quantity || 0)).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                {/* Price Breakdown */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                    <span>₹{getCartTotal().toFixed(2)}</span>
                  </div>

                  {getTotalDiscount() > 0 && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span>Total Discount</span>
                      <span>-₹{getTotalDiscount().toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 sm:pt-3">
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{getTotal().toFixed(2)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Including all taxes</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full btn-primary py-3 sm:py-4 text-base sm:text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  Proceed to Checkout
                </Link>

                {/* Trust Indicators */}
                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Free shipping on orders above ₹500</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
