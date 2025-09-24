'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const getProductPrice = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const lowestPriceVariant = product.variants.reduce((lowest, variant) => {
        if (!variant.price || isNaN(variant.price)) return lowest;
        if (!lowest.price || isNaN(lowest.price)) return variant;
        return variant.price < lowest.price ? variant : lowest;
      });
      return lowestPriceVariant?.price || 0;
    }
    return product?.basePrice || 0;
  };

  const getProductMRP = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const highestMRPVariant = product.variants.reduce((highest, variant) => {
        if (!variant.mrp || isNaN(variant.mrp)) return highest;
        if (!highest.mrp || isNaN(highest.mrp)) return variant;
        return variant.mrp > highest.mrp ? variant : highest;
      });
      return highestMRPVariant?.mrp || 0;
    }
    return product?.basePrice || 0;
  };

  const getDiscountPercentage = () => {
    const price = getProductPrice();
    const mrp = getProductMRP();
    if (mrp > price && price > 0 && mrp > 0) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const getStockStatus = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const totalStock = product.variants.reduce((sum, variant) => {
        const stock = variant.stock || 0;
        return sum + (isNaN(stock) ? 0 : stock);
      }, 0);
      return totalStock > 0 ? 'In Stock' : 'Out of Stock';
    }
    return 'In Stock';
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);

    let selectedVariant = null;
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      selectedVariant = product.variants[0];
    }

    addToCart(product, selectedVariant, 1);

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const price = getProductPrice();
  const mrp = getProductMRP();
  const stockStatus = getStockStatus();
  const isOutOfStock = stockStatus === 'Out of Stock';
  const discount = getDiscountPercentage();

  // Calculate discount percentage if not provided
  const calculateDiscount = () => {
    if (product?.discount && parseFloat(product.discount) > 0) {
      return product.discount;
    }
    if (product?.mrp && product?.basePrice) {
      const mrpValue = parseFloat(product.mrp);
      const basePriceValue = parseFloat(product.basePrice);
      if (mrpValue > basePriceValue) {
        return (((mrpValue - basePriceValue) / mrpValue) * 100).toFixed(1);
      }
    }
    return null;
  };

  const calculatedDiscount = calculateDiscount();

  // Check if there are any offers
  const hasOffers = () => {
    return displayMRP || calculatedDiscount;
  };

  // Get the best available price
  const getBestPrice = () => {
    return product?.basePrice || product?.price || 0;
  };

  // Get the MRP if available
  const getMRP = () => {
    return product?.mrp || null;
  };

  const displayPrice = getBestPrice();
  const displayMRP = getMRP();

  // Get first product image
  const productImage = product.mainImages?.[0] || product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=Product+Image';
  const [hovered, setHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white overflow-hidden hover:shadow-lg transition relative flex"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* SALE Badge */}
        {hasOffers() && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            SALE
          </span>
        )}

        {/* Image - Clickable Link */}
        <Link href={`/products/${product?.slug || product?._id}`} className="block relative w-48 h-32 flex-shrink-0">
          <img
            src={product?.mainImages[0]}
            alt={product?.name}
            className="w-full h-full object-cover"
          />

          {/* Hover Buttons */}
          {hovered && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 transition z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle();
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg ${isInWishlist(product._id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isOutOfStock}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg ${isOutOfStock
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                title={isOutOfStock ? 'Out of Stock' : 'Add to cart'}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          )}
        </Link>

        {/* Product Details - Clickable Link */}
        <Link href={`/products/${product?.slug || product?._id}`} className="block p-4 hover:bg-gray-50 transition-colors flex-1">
          <h3 className="text-lg font-medium text-gray-800 line-clamp-2 hover:text-primary-600 transition-colors mb-2">
            {product?.name}
          </h3>

          {product?.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Current Price */}
            <span className="text-xl font-semibold text-gray-900">
              ₹{displayPrice}
            </span>

            {/* MRP - Always show if available */}
            {displayMRP && (
              <span className="text-sm text-gray-500 line-through">
                ₹{displayMRP}
              </span>
            )}

            {/* Discount - Always show if available or calculated */}
            {calculatedDiscount && (
              <span className="text-sm text-red-600 font-medium">
                {calculatedDiscount}% OFF
              </span>
            )}

            {/* Savings Amount - Show actual money saved */}
            {displayMRP &&
              displayPrice &&
              parseFloat(displayMRP) > parseFloat(displayPrice) && (
                <span className="text-xs text-green-600 font-medium">
                  Save ₹{(parseFloat(displayMRP) - parseFloat(displayPrice)).toFixed(2)}
                </span>
              )}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bg-white overflow-hidden hover:shadow-lg transition relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* SALE Badge - Show only when there's an actual discount */}
      {hasOffers() && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
          SALE
        </span>
      )}

      {/* Image - Clickable Link */}
      <Link href={`/products/${product?.slug || product?._id}`} className="block relative w-full h-64">
        <img
          src={product?.mainImages[0]}
          alt={product?.name}
          className="w-full h-full object-cover"
        />

        {/* Hover Buttons */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 transition z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlistToggle();
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg ${isInWishlist(product._id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-6 h-6 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={isOutOfStock}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg ${isOutOfStock
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              title={isOutOfStock ? 'Out of Stock' : 'Add to cart'}
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        )}
      </Link>

      {/* Product Details - Clickable Link */}
      <Link href={`/products/${product?.slug || product?._id}`} className="block p-3 hover:bg-gray-50 transition-colors">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary-600 transition-colors">
          {product?.name}
        </h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {/* Current Price */}
          <span className="text-lg font-semibold text-gray-900">
            ₹{displayPrice}
          </span>

          {/* MRP - Always show if available */}
          {displayMRP && (
            <span className="text-sm text-gray-500 line-through">
              ₹{displayMRP}
            </span>
          )}

          {/* Discount - Always show if available or calculated */}
          {calculatedDiscount && (
            <span className="text-sm text-red-600 font-medium">
              {calculatedDiscount}% OFF
            </span>
          )}

          {/* Savings Amount - Show actual money saved */}
          {displayMRP &&
            displayPrice &&
            parseFloat(displayMRP) > parseFloat(displayPrice) && (
              <span className="text-xs text-green-600 font-medium">
                Save ₹{(parseFloat(displayMRP) - parseFloat(displayPrice)).toFixed(2)}
              </span>
            )}
        </div>
      </Link>
    </div>
  );
}
