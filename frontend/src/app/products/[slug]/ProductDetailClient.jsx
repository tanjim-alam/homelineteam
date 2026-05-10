'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight, Star, Heart, ShoppingCart, Truck, Shield,
  RotateCcw, Package, Minus, Plus, MessageCircle
} from 'lucide-react';
import api from '@/services/api';
import { CartContext } from '@/contexts/CartContext';

export default function ProductDetailClient({ slug }) {
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
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState([]);
  const [cartAdded, setCartAdded] = useState(false);

  const getCustomSizeFields = () => {
    if (!product?.customSize?.enabled) return [];
    const unit = product.customSize.sizeUnit || '';
    return [
      {
        slug: 'width',
        name: 'WIDTH',
        type: 'number',
        unit,
        required: true,
        basePrice: product.customSize.widthBasePrice || 0,
        min: product.customSize.minWidth,
        max: product.customSize.maxWidth
      },
      {
        slug: 'height',
        name: 'HEIGHT',
        type: 'number',
        unit,
        required: true,
        basePrice: product.customSize.heightBasePrice || 0,
        min: product.customSize.minHeight,
        max: product.customSize.maxHeight
      }
    ];
  };

  const [wallWidthFt, setWallWidthFt] = useState('');
  const [wallHeightFt, setWallHeightFt] = useState('');
  const [simpleCalc, setSimpleCalc] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await api.getProductBySlug(slug);
        setProduct(productData);

        const baseCustomFieldValues = {};
        if (productData.customSize?.enabled) {
          baseCustomFieldValues.width = '';
          baseCustomFieldValues.height = '';
        }
        setCustomFieldValues(baseCustomFieldValues);

        if (productData.categoryId) {
          try {
            const categoryData = await api.getCategoryById(productData.categoryId);
            setCategory(categoryData);

            setCustomFieldValues(baseCustomFieldValues);

            if (productData.variantOptions) {
              setVariantOptions(productData.variantOptions);
            }

            if (productData.hasVariants && productData.variants?.length > 0) {
              const firstVariant = productData.variants[0];
              setSelectedVariant(firstVariant);

              if (firstVariant.fields) {
                const initialOptions = {};
                Object.keys(firstVariant.fields).forEach(key => {
                  initialOptions[key] = firstVariant.fields[key];
                });
                setSelectedOptions(initialOptions);
              }
            }

            if (productData._id && isInWishlist) {
              setIsWishlisted(isInWishlist(productData._id));
            }
          } catch {
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
      } catch {
        setRelated([]);
      }
    };
    fetchRelated();
  }, [slug]);

  const handleOptionSelect = (fieldSlug, value) => {
    const newSelectedOptions = { ...selectedOptions, [fieldSlug]: value };
    setSelectedOptions(newSelectedOptions);

    if (product?.hasVariants && product.variants) {
      const matchingVariant = product.variants.find(variant =>
        Object.keys(newSelectedOptions).every(key => {
          const selectedValue = newSelectedOptions[key];
          const variantValue = variant.fields?.[key];
          return !selectedValue || variantValue === selectedValue;
        })
      );

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        setQuantity(1);
      }
    }
  };

  const getCustomFieldValues = () => {
    if (getCustomSizeFields().length === 0) return null;
    return Object.entries(customFieldValues || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const getCustomOrderPrice = () => {
    const hasFields = getCustomSizeFields().length;
    if (!hasFields) return null;

    const customFields = getCustomFieldValues();
    if (!customFields || Object.keys(customFields).length === 0) return null;

    let price = product?.basePrice || 0;
    const allFields = getCustomSizeFields();

    allFields.forEach(field => {
      const value = customFields[field.slug];
      if (value === undefined || value === null || value === '') return;

      const fieldBase = Number(field.basePrice || 0);
      if (field.type === 'number') {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          price += fieldBase * numericValue;
        }
      } else if (fieldBase > 0) {
        price += fieldBase;
      }
    });

    return price;
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product || !addToCart) return;

    const customFields = getCustomFieldValues();
    const customPrice = getCustomOrderPrice();
    const isCustomOrder = customFields && Object.keys(customFields).length > 0 && customPrice !== null;

    const variantToAdd = isCustomOrder ? {
      price: customPrice,
      mrp: product.mrp || customPrice,
      stock: selectedVariant?.stock || product.stock || 999,
      fields: customFields
    } : selectedVariant || {
      price: product.basePrice,
      mrp: product.mrp || product.basePrice,
      stock: product.stock || 999,
      fields: {}
    };

    addToCart(product, variantToAdd, quantity);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    const whatsappNumber = '919611925494';
    const productName = product.name;
    const productPrice = getCurrentPrice();
    const selectedVariantText = selectedVariant ? `\n*Variant:* ${selectedVariant.name}` : '';

    const customFields = getCustomFieldValues();
    const selectedOptionsText = customFields && Object.keys(customFields).length > 0
      ? `\n*Custom Options:* ${Object.entries(customFields).map(([key, value]) => `${key}: ${value}`).join(', ')}`
      : Object.keys(selectedOptions).length > 0
        ? `\n*Options:* ${Object.entries(selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ')}`
        : '';
    const quantityText = quantity > 1 ? `\n*Quantity:* ${quantity}` : '';
    const totalPrice = productPrice * quantity;

    const message = `🛍️ *Order Inquiry*\n\n*Product:* ${productName}${selectedVariantText}${selectedOptionsText}${quantityText}\n*Price:* ₹${productPrice.toLocaleString()}${quantity > 1 ? `\n*Total:* ₹${totalPrice.toLocaleString()}` : ''}\n\nI'm interested in placing an order for this product. Please provide more details about availability and delivery.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getCurrentPrice = () => {
    const customPrice = getCustomOrderPrice();
    if (customPrice !== null) return customPrice;
    return selectedVariant?.price || product?.basePrice || 0;
  };

  const getCurrentMRP = () => {
    const customPrice = getCustomOrderPrice();
    if (customPrice !== null) return product?.mrp || customPrice;
    return selectedVariant?.mrp || product?.basePrice || 0;
  };

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

  const getCoveragePerRollSqft = () => {
    const fromDynamic = (() => {
      try {
        if (product?.dynamicFields) {
          if (product.dynamicFields.coverageSqft) return parseFloat(product.dynamicFields.coverageSqft);
          if (product.dynamicFields.rollCoverageSqft) return parseFloat(product.dynamicFields.rollCoverageSqft);
          if (product.dynamicFields.rollSizeSqft) return parseFloat(product.dynamicFields.rollSizeSqft);
        }
      } catch { }
      return null;
    })();
    return fromDynamic && !isNaN(fromDynamic) && fromDynamic > 0 ? fromDynamic : 57;
  };

  const calculateSimpleRolls = () => {
    const widthFt = parseFloat((wallWidthFt || '').toString());
    const heightFt = parseFloat((wallHeightFt || '').toString());
    if (isNaN(widthFt) || isNaN(heightFt) || widthFt <= 0 || heightFt <= 0) {
      setSimpleCalc(null);
      return;
    }
    const area = widthFt * heightFt;
    const coverage = getCoveragePerRollSqft();
    const rolls = Math.max(1, Math.ceil(area / coverage));
    const pricePerRoll = getCurrentPrice() || 0;
    const estimatedCost = rolls * pricePerRoll;
    setSimpleCalc({ area, coverage, rolls, estimatedCost, pricePerRoll });
  };

  const isOutOfStock = () => selectedVariant?.stock <= 0;

  const getAvailableOptions = () => {
    if (!product?.hasVariants || !product.variants) return {};

    const options = {};
    product.variants.forEach(variant => {
      if (variant.fields) {
        Object.keys(variant.fields).forEach(fieldSlug => {
          if (!options[fieldSlug]) options[fieldSlug] = new Set();
          options[fieldSlug].add(variant.fields[fieldSlug]);
        });
      }
    });

    Object.keys(options).forEach(fieldSlug => {
      options[fieldSlug] = Array.from(options[fieldSlug]).sort();
    });

    return options;
  };

  const getFieldDisplayInfo = (fieldSlug) => {
    const fieldDef = category?.variantFields?.find(f => f.slug === fieldSlug);
    return {
      name: fieldDef?.name || fieldSlug,
      unit: fieldDef?.unit || ''
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Product not found</h1>
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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
            <Link href="/" className="hover:text-primary-600 whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <Link href="/collections" className="hover:text-primary-600 whitespace-nowrap">Collections</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <span className="text-gray-900 font-medium whitespace-nowrap truncate max-w-[150px] sm:max-w-none" aria-current="page">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="bg-white">
        <div className="container-custom py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">

            {/* Product Images — Desktop */}
            <div className="hidden lg:block space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg bg-gray-100">
                {product.mainImages?.length > 0 ? (
                  <Image
                    src={product.mainImages[selectedImage]}
                    alt={`${product.name} — HomelineTeam`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
                      aria-label={`View image ${idx + 1}`}
                      aria-pressed={selectedImage === idx}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${selectedImage === idx
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                        }`}
                    >
                      <Image src={img} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Product Image — Mobile */}
                <div className="lg:hidden mb-4 sm:mb-6">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                    {product.mainImages?.length > 0 ? (
                      <Image
                        src={product.mainImages[selectedImage]}
                        alt={`${product.name} — HomelineTeam`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        priority
                        sizes="100vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {product.mainImages?.length > 1 && (
                    <div className="flex gap-2 sm:gap-3 justify-center overflow-x-auto pb-2 mt-3">
                      {product.mainImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          aria-label={`View image ${idx + 1}`}
                          aria-pressed={selectedImage === idx}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${selectedImage === idx
                            ? 'border-primary-600 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-primary-300'
                            }`}
                        >
                          <Image src={img} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4 sm:mb-6" aria-label="Product rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} aria-hidden="true" />
                  ))}
                  <span className="text-gray-600 text-xs sm:text-sm">4.0 out of 5</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{currentPrice.toFixed(2)}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-lg sm:text-xl text-gray-500 line-through">₹{currentMRP.toFixed(2)}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                        -{discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Variant Selection */}
              {product.hasVariants && Object.keys(getAvailableOptions()).length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Select Options</h2>

                  {Object.keys(getAvailableOptions()).map(fieldSlug => {
                    const fieldInfo = getFieldDisplayInfo(fieldSlug);
                    const options = getAvailableOptions()[fieldSlug];
                    const selectedValue = selectedOptions[fieldSlug];

                    const isColorField = fieldSlug.toLowerCase().includes('color') ||
                      fieldInfo.name.toLowerCase().includes('color') ||
                      fieldSlug.toLowerCase().includes('colour') ||
                      fieldInfo.name.toLowerCase().includes('colour');

                    return (
                      <div key={fieldSlug}>
                        <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                          Select {fieldInfo.name}
                          {fieldInfo.unit && <span className="text-gray-500 ml-1">({fieldInfo.unit})</span>}
                        </h3>
                        {isColorField ? (
                          <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label={`Select ${fieldInfo.name}`}>
                            {options.map(option => {
                              const colorMatch = option.match(/^(.+?)\s*\(#([A-Fa-f0-9]{6})\)$/);
                              const colorName = colorMatch ? colorMatch[1] : option;
                              const hexCode = colorMatch ? colorMatch[2] : null;
                              const isSelected = selectedValue === option;

                              return (
                                <button
                                  key={option}
                                  onClick={() => handleOptionSelect(fieldSlug, option)}
                                  aria-pressed={isSelected}
                                  aria-label={`${colorName}${hexCode ? ` (#${hexCode})` : ''}`}
                                  className={`relative group transition-all duration-200 ${isSelected ? 'ring-primary-600 ring-offset-2' : 'hover:scale-105'}`}
                                >
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                                    {hexCode ? (
                                      <div className="w-full h-full" style={{ backgroundColor: `#${hexCode}` }} />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                        <span className="text-xs text-gray-600 text-center px-1">
                                          {colorName.length > 6 ? colorName.substring(0, 6) + '…' : colorName}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className={`mt-2 sm:mt-3 text-center text-xs sm:text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                                    {colorName.length > 10 ? colorName.substring(0, 10) + '…' : colorName}
                                  </div>
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                                      <svg className="w-2 h-2 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label={`Select ${fieldInfo.name}`}>
                            {options.map(option => (
                              <button
                                key={option}
                                onClick={() => handleOptionSelect(fieldSlug, option)}
                                aria-pressed={selectedValue === option}
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

                  {selectedVariant && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Selected Configuration:</span>
                        <span className="text-xs sm:text-sm text-gray-600">Stock: {selectedVariant.stock || 0}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-3">
                        {selectedVariant.fields && Object.entries(selectedVariant.fields).map(([key, value]) => {
                          const fieldInfo = getFieldDisplayInfo(key);
                          const isColorField = key.toLowerCase().includes('color') ||
                            fieldInfo.name.toLowerCase().includes('color') ||
                            key.toLowerCase().includes('colour') ||
                            fieldInfo.name.toLowerCase().includes('colour');

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
                                    aria-label={`${colorName} color`}
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

              {getCustomSizeFields().length > 0 && (
                <div className="space-y-4 sm:space-y-5 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Custom Configuration</h3>
                      <p className="text-sm text-gray-500">Enter custom values for this product. Price updates automatically.</p>
                    </div>
                    {getCustomOrderPrice() !== null && (
                      <div className="text-sm text-gray-600">
                        Custom price: <strong>₹{getCustomOrderPrice().toFixed(2)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getCustomSizeFields().map(field => {
                      const value = customFieldValues[field.slug] ?? '';
                      const commonProps = {
                        value,
                        onChange: (e) => setCustomFieldValues({ ...customFieldValues, [field.slug]: e.target.value }),
                        className: "w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-transparent text-gray-800 transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                      };

                      return (
                        <div key={field.slug} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor={`field-${field.slug}`} className="text-sm font-medium text-gray-900">{field.name}</label>
                            {field.unit && <span className="text-xs text-gray-500">{field.unit}</span>}
                          </div>

                          {field.type === 'dropdown' ? (
                            <div className="flex flex-wrap gap-2" role="group" aria-label={field.name}>
                              {(product.variantOptions?.[field.slug] || field.options || []).map(option => (
                                <button
                                  type="button"
                                  key={option}
                                  onClick={() => setCustomFieldValues({ ...customFieldValues, [field.slug]: option })}
                                  aria-pressed={value === option}
                                  className={`px-3 py-2 rounded-lg border text-sm ${value === option ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'}`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input
                              id={`field-${field.slug}`}
                              type={field.type === 'number' ? 'number' : 'text'}
                              placeholder={field.placeholder || (field.unit ? `Enter ${field.name} (${field.unit})` : `Enter ${field.name}`)}
                              min={field.type === 'number' ? (field.min !== undefined ? field.min : 0) : undefined}
                              max={field.type === 'number' ? field.max : undefined}
                              {...commonProps}
                            />
                          )}

                          {(field.min !== undefined || field.max !== undefined) && (
                            <p className="text-xs text-gray-500">
                              {field.min !== undefined ? `Min: ${field.min}` : ''}
                              {field.min !== undefined && field.max !== undefined ? ' · ' : ''}
                              {field.max !== undefined ? `Max: ${field.max}` : ''}
                            </p>
                          )}

                          {field.required && !value && (
                            <p className="text-xs text-red-600">This field is required for custom configuration.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Wallpaper Roll Calculator */}
              {isWallpaperCategory() && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Wallpaper Roll Calculator</h3>
                  <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                    <div>
                      <label htmlFor="wall-width" className="block text-xs sm:text-sm text-gray-700 mb-1">Width (ft)</label>
                      <input
                        id="wall-width"
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
                      <label htmlFor="wall-height" className="block text-xs sm:text-sm text-gray-700 mb-1">Height (ft)</label>
                      <input
                        id="wall-height"
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
                    >
                      Calculate
                    </button>
                  </div>
                  {simpleCalc && (
                    <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-3">
                      <span>Rolls needed: <strong>{simpleCalc.rolls}</strong></span>
                      <span>Est. cost: <strong>₹{simpleCalc.estimatedCost.toLocaleString()}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Quantity</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit" role="group" aria-label="Quantity selector">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" aria-hidden="true" />
                    </button>
                    <span className="w-12 sm:w-16 text-center font-bold text-base sm:text-lg text-gray-600" aria-live="polite">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {selectedVariant?.stock || 999} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock()}
                    aria-label={isOutOfStock() ? 'Out of stock' : cartAdded ? 'Added to cart' : 'Add to cart'}
                    className={`flex-1 py-3 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${isOutOfStock()
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : cartAdded
                        ? 'bg-green-600 text-white cursor-pointer'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl transform hover:scale-105 cursor-pointer'
                      }`}
                  >
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                    {isOutOfStock() ? 'Out of Stock' : cartAdded ? 'Added to Cart!' : 'Add to Cart'}
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
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={isWishlisted}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${isWishlisted ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500'}`}
                  >
                    <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
                  </button>
                </div>

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleWhatsAppOrder}
                  aria-label="Order via WhatsApp"
                  className="group relative w-full py-3 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className="font-semibold">Order via WhatsApp</span>
                  </div>
                  <div className="absolute inset-0 -top-1 -left-1 w-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:w-full transition-all duration-700 ease-out" aria-hidden="true" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                {[
                  { icon: Truck, label: 'Free Shipping' },
                  { icon: RotateCcw, label: '30-Day Returns' },
                  { icon: Shield, label: 'Secure Payment' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white border-t border-gray-100">
        <div className="container-custom py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto pb-px" role="tablist" aria-label="Product information tabs">
            {[
              { id: 'description', label: 'Description' },
              { id: 'custom-fields', label: 'Product Details' },
              { id: 'shipping', label: 'Shipping & Returns' }
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
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

          <div className="min-h-[300px] sm:min-h-[400px]">
            {activeTab === 'description' && (
              <div id="tabpanel-description" role="tabpanel">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Product Description</h2>
                <div className="text-gray-600 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>This premium product is designed to enhance your living space with its exceptional quality and beautiful design. Made from the finest materials, it combines functionality with aesthetic appeal to create the perfect addition to your home.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Key Features</h3>
                    <ul className="space-y-2">
                      {['Premium quality materials', 'Easy to maintain', 'Long-lasting durability', 'Modern design aesthetic'].map(feat => (
                        <li key={feat} className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Care Instructions</h3>
                    <ul className="space-y-2">
                      {['Regular cleaning recommended', 'Avoid harsh chemicals', 'Store in dry place'].map(instr => (
                        <li key={instr} className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-600 text-sm sm:text-base">{instr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'custom-fields' && (
              <div id="tabpanel-custom-fields" role="tabpanel">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Product Details</h2>

                {product.dynamicFields && Object.keys(product.dynamicFields).length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Product Information</h3>
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

                {Object.keys(getAvailableOptions()).length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Available Options</h3>
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

                {selectedVariant && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Selected Configuration</h3>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Variant Information</h4>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-gray-600 text-sm sm:text-base">SKU:</dt>
                              <dd className="font-medium text-sm sm:text-base">{selectedVariant.sku || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600 text-sm sm:text-base">Stock:</dt>
                              <dd className="font-medium text-sm sm:text-base">{selectedVariant.stock || 0}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600 text-sm sm:text-base">Price:</dt>
                              <dd className="font-medium text-sm sm:text-base">₹{selectedVariant.price?.toFixed(2) || 'N/A'}</dd>
                            </div>
                            {selectedVariant.mrp && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600 text-sm sm:text-base">MRP:</dt>
                                <dd className="font-medium text-sm sm:text-base">₹{selectedVariant.mrp.toFixed(2)}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Field Values</h4>
                          <dl className="space-y-2">
                            {selectedVariant.fields && Object.entries(selectedVariant.fields).map(([key, value]) => {
                              const fieldInfo = getFieldDisplayInfo(key);
                              return (
                                <div key={key} className="flex justify-between">
                                  <dt className="text-gray-600 text-sm sm:text-base">{fieldInfo.name}:</dt>
                                  <dd className="font-medium text-sm sm:text-base">{value} {fieldInfo.unit}</dd>
                                </div>
                              );
                            })}
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div id="tabpanel-shipping" role="tabpanel">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping & Returns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Information</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-center gap-2 sm:gap-3">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600 text-sm sm:text-base">Free shipping on orders above ₹500</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600 text-sm sm:text-base">Standard delivery: 2–3 business days</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-gray-600 text-sm sm:text-base">Track your order in real-time</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Return Policy</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-center gap-2 sm:gap-3">
                        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600 text-sm sm:text-base">30-day return window</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                        <span className="text-gray-600 text-sm sm:text-base">Money-back guarantee</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-gray-600 text-sm sm:text-base">Easy return process</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-white border-t border-gray-100">
          <div className="container-custom py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <h2 id="related-heading" className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Related Products</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <article key={p._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="relative aspect-square bg-gray-50">
                      {p.mainImages?.[0] ? (
                        <Image src={p.mainImages[0]} alt={`${p.name} — HomelineTeam`} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                      <p className="text-primary-600 font-bold mt-1">₹{(p.basePrice || 0).toFixed(2)}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
