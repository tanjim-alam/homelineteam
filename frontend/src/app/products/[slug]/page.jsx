'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft, Star, Heart, ShoppingCart, Truck, Shield,
  RotateCcw, Package, Minus, Plus, MessageCircle
} from 'lucide-react';
import api from '@/services/api';
import Metadata from '@/components/Metadata';
import { generateProductMetadata, generateProductStructuredData } from '@/utils/metadata';
import { CartContext } from '@/contexts/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [category, setCategory] = useState(null);
  const [variantOptions, setVariantOptions] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState([]);
  // Wallpaper Roll Calculator (simple: W x H in ft)
  const [wallWidthFt, setWallWidthFt] = useState('');
  const [wallHeightFt, setWallHeightFt] = useState('');
  const [simpleCalc, setSimpleCalc] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await api.getProductBySlug(slug);
        setProduct(productData);

        // Fetch category to get variant field definitions
        if (productData.categoryId) {
          try {
            const categoryData = await api.getCategoryById(productData.categoryId);
            setCategory(categoryData);

            // Initialize variant options from product data
            if (productData.variantOptions) {
              setVariantOptions(productData.variantOptions);
            }

            // Initialize selected options with first variant if available
            if (productData.hasVariants && productData.variants?.length > 0) {
              const firstVariant = productData.variants[0];
              setSelectedVariant(firstVariant);

              // Initialize selected options from first variant
              if (firstVariant.fields) {
                const initialOptions = {};
                Object.keys(firstVariant.fields).forEach(key => {
                  initialOptions[key] = firstVariant.fields[key];
                });
                setSelectedOptions(initialOptions);
              }
            }

            // Check if product is in wishlist
            if (productData._id && isInWishlist) {
              setIsWishlisted(isInWishlist(productData._id));
            }
          } catch (categoryErr) {
            // Category fetch failed, continue without category data
          }
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        if (!slug) return;
        const items = await api.getRelatedProducts(slug, 8);
        setRelated(Array.isArray(items) ? items : []);
      } catch (_) {
        setRelated([]);
      }
    };
    fetchRelated();
  }, [slug]);

  // Handle option selection for any variant field
  const handleOptionSelect = (fieldSlug, value) => {
    const newSelectedOptions = { ...selectedOptions, [fieldSlug]: value };
    setSelectedOptions(newSelectedOptions);

    // Find matching variant based on selected options
    if (product?.hasVariants && product.variants) {
      const matchingVariant = product.variants.find(variant => {
        // Check if all selected options match the variant
        return Object.keys(newSelectedOptions).every(key => {
          const selectedValue = newSelectedOptions[key];
          const variantValue = variant.fields?.[key];
          return !selectedValue || variantValue === selectedValue;
        });
      });

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        setQuantity(1);
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product || !addToCart) return;

    // Use selectedVariant if available, otherwise use product base data
    const variantToAdd = selectedVariant || {
      price: product.basePrice,
      mrp: product.mrp || product.basePrice,
      stock: product.stock || 999,
      fields: {}
    };

    addToCart(product, variantToAdd, quantity);

    // Show success feedback
    const button = document.querySelector('[data-add-to-cart]');
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<ShoppingCart className="w-6 h-6" /> Added!';
      button.className = button.className.replace('bg-primary-600', 'bg-green-600');

      setTimeout(() => {
        button.innerHTML = originalText;
        button.className = button.className.replace('bg-green-600', 'bg-primary-600');
      }, 2000);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    // WhatsApp phone number (replace with your business number)
    const whatsappNumber = '919611925494'; // Replace with your actual WhatsApp number

    // Create order message
    const productName = product.name;
    const productPrice = getCurrentPrice();
    const selectedVariantText = selectedVariant ? `\n*Variant:* ${selectedVariant.name}` : '';
    const selectedOptionsText = Object.keys(selectedOptions).length > 0
      ? `\n*Options:* ${Object.entries(selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}`
      : '';
    const quantityText = quantity > 1 ? `\n*Quantity:* ${quantity}` : '';
    const totalPrice = productPrice * quantity;

    const message = `🛍️ *Order Inquiry*\n\n*Product:* ${productName}${selectedVariantText}${selectedOptionsText}${quantityText}\n*Price:* ₹${productPrice.toLocaleString()}${quantity > 1 ? `\n*Total:* ₹${totalPrice.toLocaleString()}` : ''}\n\nI'm interested in placing an order for this product. Please provide more details about availability and delivery.`;

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const getCurrentPrice = () => selectedVariant?.price || product?.basePrice || 0;
  const getCurrentMRP = () => selectedVariant?.mrp || product?.basePrice || 0;

  const getDiscountPercentage = () => {
    const price = getCurrentPrice();
    const mrp = getCurrentMRP();
    if (mrp > price && price > 0) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const isWallpaperCategory = () => {
    const n = (category?.name || '').toLowerCase();
    const s = (category?.slug || '').toLowerCase();
    return n.includes('wallpaper') || s.includes('wallpaper');
  };

  // Wallpaper Calculator helpers
  const getCoveragePerRollSqft = () => {
    // Try to read from product.dynamicFields if available, fallback to 57 sqft
    const fromDynamic = (() => {
      try {
        if (product?.dynamicFields) {
          if (product.dynamicFields.coverageSqft) return parseFloat(product.dynamicFields.coverageSqft);
          if (product.dynamicFields.rollCoverageSqft) return parseFloat(product.dynamicFields.rollCoverageSqft);
          if (product.dynamicFields.rollSizeSqft) return parseFloat(product.dynamicFields.rollSizeSqft);
        }
      } catch (_) { }
      return null;
    })();
    const value = fromDynamic && !isNaN(fromDynamic) && fromDynamic > 0 ? fromDynamic : 57;
    return value;
  };

  const calculateSimpleRolls = () => {
    const widthFt = parseFloat((wallWidthFt || '').toString());
    const heightFt = parseFloat((wallHeightFt || '').toString());
    if (isNaN(widthFt) || isNaN(heightFt) || widthFt <= 0 || heightFt <= 0) {
      setSimpleCalc(null);
      return;
    }
    const area = widthFt * heightFt; // single wall area in sqft
    const coverage = getCoveragePerRollSqft();
    const rolls = Math.max(1, Math.ceil(area / coverage));
    const pricePerRoll = getCurrentPrice() || 0;
    const estimatedCost = rolls * pricePerRoll;
    setSimpleCalc({ area, coverage, rolls, estimatedCost, pricePerRoll });
  };

  const isOutOfStock = () => selectedVariant?.stock <= 0;

  // Get available options for each variant field
  const getAvailableOptions = () => {
    if (!product?.hasVariants || !product.variants) return {};

    const options = {};

    // Get unique values for each field from variants
    product.variants.forEach(variant => {
      if (variant.fields) {
        Object.keys(variant.fields).forEach(fieldSlug => {
          if (!options[fieldSlug]) {
            options[fieldSlug] = new Set();
          }
          options[fieldSlug].add(variant.fields[fieldSlug]);
        });
      }
    });

    // Convert Sets to Arrays and sort
    Object.keys(options).forEach(fieldSlug => {
      options[fieldSlug] = Array.from(options[fieldSlug]).sort();
    });

    return options;
  };

  // Get field display name and unit from category
  const getFieldDisplayInfo = (fieldSlug) => {
    if (!category?.variantFields) return { name: fieldSlug, unit: '' };

    const fieldDef = category.variantFields.find(f => f.slug === fieldSlug);
    return {
      name: fieldDef?.name || fieldSlug,
      unit: fieldDef?.unit || ''
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Product not found</h2>
          <p className="text-gray-600 mb-6 text-base sm:text-lg">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/collections" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const currentMRP = getCurrentMRP();
  const discount = getDiscountPercentage();

  return (
    <>
      <Metadata
        {...generateProductMetadata(product)}
        structuredData={generateProductStructuredData(product)}
        canonicalUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${slug}`}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container-custom py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
              <Link href="/" className="hover:text-primary-600 whitespace-nowrap">Home</Link>
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <Link href="/collections" className="hover:text-primary-600 whitespace-nowrap">Collections</Link>
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-gray-900 font-medium whitespace-nowrap truncate max-w-[150px] sm:max-w-none">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="bg-white">
          <div className="container-custom py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">

              {/* Product Images - Desktop Only */}
              <div className="hidden lg:block space-y-4 sm:space-y-6 order-2 lg:order-1">
                <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg bg-gray-100">
                  {product.mainImages?.length > 0 ? (
                    <Image
                      src={product.mainImages[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                    </div>
                  )}
                </div>

                {product.mainImages?.length > 1 && (
                  <div className="flex gap-2 sm:gap-3 justify-center overflow-x-auto pb-2">
                    {product.mainImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${selectedImage === idx
                          ? 'border-primary-600 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                <div>
                  <h1 className="text-2xl mdtext-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                    {product.name}
                  </h1>

                  {/* Product Image - Mobile Only */}
                  <div className="lg:hidden mb-4 sm:mb-6">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                      {product.mainImages?.length > 0 ? (
                        <Image
                          src={product.mainImages[selectedImage]}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Navigation - Mobile Only */}
                    {product.mainImages?.length > 1 && (
                      <div className="flex gap-2 sm:gap-3 justify-center overflow-x-auto pb-2 mt-3">
                        {product.mainImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${selectedImage === idx
                              ? 'border-primary-600 ring-2 ring-primary-200'
                              : 'border-gray-200 hover:border-primary-300'
                              }`}
                          >
                            <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-gray-600 text-xs sm:text-sm">(128 reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{currentPrice.toFixed(2)}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-lg sm:text-xl text-gray-500 line-through">₹{currentMRP.toFixed(2)}</span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Dynamic Variant Selection */}
                {product.hasVariants && Object.keys(getAvailableOptions()).length > 0 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Options</h3>

                    {Object.keys(getAvailableOptions()).map(fieldSlug => {
                      const fieldInfo = getFieldDisplayInfo(fieldSlug);
                      const options = getAvailableOptions()[fieldSlug];
                      const selectedValue = selectedOptions[fieldSlug];

                      // Check if this is a color field (by name or slug)
                      const isColorField = fieldSlug.toLowerCase().includes('color') ||
                        fieldInfo.name.toLowerCase().includes('color') ||
                        fieldSlug.toLowerCase().includes('colour') ||
                        fieldInfo.name.toLowerCase().includes('colour');

                      return (
                        <div key={fieldSlug}>
                          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                            Select {fieldInfo.name}
                            {fieldInfo.unit && <span className="text-gray-500 ml-1">({fieldInfo.unit})</span>}
                          </h4>
                          {isColorField ? (
                            // Color variant selector with swatches
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {options.map(option => {
                                // Try to extract hex code from option (format: "Color Name (#HEXCODE)")
                                const colorMatch = option.match(/^(.+?)\s*\(#([A-Fa-f0-9]{6})\)$/);
                                const colorName = colorMatch ? colorMatch[1] : option;
                                const hexCode = colorMatch ? colorMatch[2] : null;

                                const isSelected = selectedValue === option;

                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleOptionSelect(fieldSlug, option)}
                                    className={`relative group transition-all duration-200 ${isSelected
                                      ? 'ring-primary-600 ring-offset-2'
                                      : 'hover:scale-105'
                                      }`}
                                    title={`${colorName}${hexCode ? ` - #${hexCode}` : ''}`}
                                  >
                                    {/* Color Swatch */}
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                                      {hexCode ? (
                                        <div
                                          className="w-full h-full"
                                          style={{ backgroundColor: `#${hexCode}` }}
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                          <span className="text-xs text-gray-600 text-center px-1">
                                            {colorName.length > 6 ? colorName.substring(0, 6) + '...' : colorName}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Color Name */}
                                    <div className={`mt-2 sm:mt-3 text-center text-xs sm:text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'
                                      }`}>
                                      {colorName.length > 10 ? colorName.substring(0, 10) + '...' : colorName}
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-2 h-2 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            // Regular variant selector for non-color fields
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {options.map(option => (
                                <button
                                  key={option}
                                  onClick={() => handleOptionSelect(fieldSlug, option)}
                                  className={`px-3 sm:px-4 py-2 border-2 rounded-lg text-gray-600 transition-all duration-200 text-sm sm:text-base ${selectedValue === option
                                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                                    : 'border-gray-200 hover:border-primary-300'
                                    }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Selected Variant Info */}
                    {selectedVariant && (
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                          <span className="font-medium text-gray-900 text-sm sm:text-base">Selected Configuration:</span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            Stock: {selectedVariant.stock || 0}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-3">
                          {selectedVariant.fields && Object.entries(selectedVariant.fields).map(([key, value]) => {
                            const fieldInfo = getFieldDisplayInfo(key);
                            const isColorField = key.toLowerCase().includes('color') ||
                              fieldInfo.name.toLowerCase().includes('color') ||
                              key.toLowerCase().includes('colour') ||
                              fieldInfo.name.toLowerCase().includes('colour');

                            // Try to extract hex code from value (format: "Color Name (#HEXCODE)")
                            const colorMatch = value.match(/^(.+?)\s*\(#([A-Fa-f0-9]{6})\)$/);
                            const colorName = colorMatch ? colorMatch[1] : value;
                            const hexCode = colorMatch ? colorMatch[2] : null;

                            return (
                              <div key={key} className="flex items-center justify-between">
                                <span className="font-medium">{fieldInfo.name}:</span>
                                <div className="flex items-center gap-2">
                                  {isColorField && hexCode && (
                                    <div
                                      className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: `#${hexCode}` }}
                                      title={`${colorName} (#${hexCode})`}
                                    />
                                  )}
                                  <span>
                                    {colorName} {fieldInfo.unit}
                                    {hexCode && <span className="text-gray-500 ml-1">#{hexCode}</span>}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Simple Wallpaper Roll Calculator (W x H in ft) */}
                {isWallpaperCategory() && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Wallpaper Roll Calculator</h3>
                    <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-700 mb-1">W (ft)</label>
                        <input
                          value={wallWidthFt}
                          onChange={e => setWallWidthFt(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-28 sm:w-32 px-3 py-2 border text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                          placeholder="e.g., 10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-700 mb-1">H (ft)</label>
                        <input
                          value={wallHeightFt}
                          onChange={e => setWallHeightFt(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-28 sm:w-32 px-3 py-2 border text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                          placeholder="e.g., 9"
                        />
                      </div>
                      <button
                        onClick={calculateSimpleRolls}
                        className="ml-auto sm:ml-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >Calculate</button>
                    </div>
                    {simpleCalc && (
                      <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-3">
                        <span>Required rolls: <span className="font-semibold">{simpleCalc.rolls}</span></span>
                        <span>Est. cost: <span className="font-semibold">₹{simpleCalc.estimatedCost.toLocaleString()}</span></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Quantity</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                      <span className="w-12 sm:w-16 text-center font-bold text-base sm:text-lg text-gray-600">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {selectedVariant?.stock || 999} available
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Primary Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock()}
                      data-add-to-cart
                      className={`flex-1 py-1 px-6 sm:px-8 rounded-xl sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${isOutOfStock()
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl transform hover:scale-105 cursor-pointer'
                        }`}
                    >
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                      {isOutOfStock() ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={() => {
                        if (!addToWishlist || !removeFromWishlist) return;

                        if (isWishlisted) {
                          removeFromWishlist(product._id);
                          setIsWishlisted(false);
                        } else {
                          addToWishlist(product);
                          setIsWishlisted(true);
                        }
                      }}
                      className={`p-2 sm:p-2 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-red-600 hover:shadow-lg cursor-pointer ${isWishlisted ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 hover:border-primary-300 hover:text-primary-600'
                        }`}
                    >
                      <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isWishlisted ? 'fill-current ' : ''}`} />
                    </button>
                  </div>

                  {/* WhatsApp Order Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    className="group relative w-full py-1 px-6 sm:px-8 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer"
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Button content */}
                    <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">Order via WhatsApp</span>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -top-1 -left-1 w-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:w-full transition-all duration-700 ease-out"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white border-t border-gray-100">
          <div className="container-custom py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto pb-2">
              {[
                { id: 'description', label: 'Description' },
                { id: 'custom-fields', label: 'Product Details' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-200 border-b-2 text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px] sm:min-h-[400px]">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Product Description</h3>
                  <div className="text-gray-600 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
                    {product.description ? (
                      <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    ) : (
                      <p>This premium product is designed to enhance your living space with its exceptional quality and beautiful design. Made from the finest materials, it combines functionality with aesthetic appeal to create the perfect addition to your home.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Key Features</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Premium quality materials</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Easy to maintain</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Long-lasting durability</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Modern design aesthetic</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                      <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Care Instructions</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Regular cleaning recommended</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Avoid harsh chemicals</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Store in dry place</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custom-fields' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Product Details</h3>

                  {/* Custom Fields from Product */}
                  {product.dynamicFields && Object.keys(product.dynamicFields).length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Product Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(product.dynamicFields).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                            <div className="font-medium text-gray-900 capitalize mb-1 text-sm sm:text-base">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="text-gray-600 text-sm sm:text-base">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variant Options Available */}
                  {Object.keys(getAvailableOptions()).length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Available Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(getAvailableOptions()).map(([fieldSlug, options]) => {
                          const fieldInfo = getFieldDisplayInfo(fieldSlug);
                          return (
                            <div key={fieldSlug} className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                              <div className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                {fieldInfo.name}
                                {fieldInfo.unit && <span className="text-gray-500 ml-1">({fieldInfo.unit})</span>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(options) ? options.map((option, index) => (
                                  <span key={index} className="px-2 sm:px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700">
                                    {option}
                                  </span>
                                )) : (
                                  <span className="text-gray-600 text-sm sm:text-base">{options}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Variant Details */}
                  {selectedVariant && (
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Selected Configuration Details</h4>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Variant Information</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 text-sm sm:text-base">SKU:</span>
                                <span className="font-medium text-sm sm:text-base">{selectedVariant.sku || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 text-sm sm:text-base">Stock:</span>
                                <span className="font-medium text-sm sm:text-base">{selectedVariant.stock || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 text-sm sm:text-base">Price:</span>
                                <span className="font-medium text-sm sm:text-base">₹{selectedVariant.price?.toFixed(2) || 'N/A'}</span>
                              </div>
                              {selectedVariant.mrp && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm sm:text-base">MRP:</span>
                                  <span className="font-medium text-sm sm:text-base">₹{selectedVariant.mrp.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Field Values</h5>
                            <div className="space-y-2">
                              {selectedVariant.fields && Object.entries(selectedVariant.fields).map(([key, value]) => {
                                const fieldInfo = getFieldDisplayInfo(key);
                                return (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 text-sm sm:text-base">{fieldInfo.name}:</span>
                                    <span className="font-medium text-sm sm:text-base">{value} {fieldInfo.unit}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Reviews</h3>
                  <div className="space-y-4 sm:space-y-6">
                    {[
                      { name: 'Sarah M.', rating: 5, date: '2 days ago', comment: 'Excellent quality! The product exceeded my expectations. Highly recommended.' },
                      { name: 'John D.', rating: 5, date: '1 week ago', comment: 'Beautiful design and great value for money. Very satisfied with the purchase.' },
                      { name: 'Emily R.', rating: 4, date: '2 weeks ago', comment: 'Good product, fast delivery. Would buy again from this brand.' }
                    ].map((review, index) => (
                      <div key={index} className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-semibold text-sm sm:text-base">{review.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{review.name}</div>
                              <div className="text-xs sm:text-sm text-gray-500">{review.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping & Returns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Information</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                          <span className="text-gray-600 text-sm sm:text-base">Free shipping on orders above ₹500</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                          <span className="text-gray-600 text-sm sm:text-base">Standard delivery: 2-3 business days</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Track your order in real-time</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Return Policy</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                          <span className="text-gray-600 text-sm sm:text-base">30-day return window</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                          <span className="text-gray-600 text-sm sm:text-base">Money-back guarantee</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">Easy return process</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Related Products */}
      {related.length > 0 && (
        <div className="bg-white border-t border-gray-100">
          <div className="container-custom py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Related Products</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <div key={p._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="relative aspect-square bg-gray-50">
                      {p.mainImages?.[0] ? (
                        <Image src={p.mainImages[0]} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                      <div className="text-primary-600 font-bold mt-1">₹{(p.basePrice || 0).toFixed(2)}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}