'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { useHeroData } from '../hooks/useHeroData';
import api from '../services/api';

const HeroSlider = ({ isMobile = false, className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { heroData, isLoading } = useHeroData();

  // Fetch hierarchical categories for correct routing
  useEffect(() => {
    api.getHierarchicalCategories()
      .then(data => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data?.categories) cats = data.categories;
        else if (data?.data) cats = data.data;
        setHierarchicalCategories(cats);
      })
      .catch(() => {})
      .finally(() => setCategoriesLoaded(true));
  }, []);

  const activeImages = (heroData.mobileBackgroundImages || []).filter(img => img?.isActive);
  const activeCategories = (heroData.categories || []).filter(cat => cat?.isActive);
  const interval = heroData.sliderSettings?.slideInterval || 4000;
  const autoSlide = heroData.sliderSettings?.autoSlide !== false;

  // Fixed auto-slide (was missing the interval body before)
  useEffect(() => {
    if (!autoSlide || activeImages.length <= 1) return;
    const id = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % activeImages.length);
    }, interval);
    return () => clearInterval(id);
  }, [autoSlide, activeImages.length, interval]);

  const getCategoryLink = (category) => {
    if (category.link && !category.link.startsWith('/collections/')) return category.link;
    for (const main of hierarchicalCategories) {
      const sub = (main.subcategories || []).find(s =>
        s.slug === category.slug || s._id === category._id ||
        s.name === category.name || s.title === category.title
      );
      if (sub) return `/${main.slug}/${sub.slug}`;
    }
    return `/collections/${category.slug || ''}`;
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`${isMobile ? 'md:hidden' : ''} ${className}`}>
        <div className={`relative ${isMobile ? 'h-[52vh]' : 'h-64 lg:h-72 xl:h-80'} bg-gray-800 animate-pulse ${isMobile ? '' : 'rounded-2xl'} overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        </div>
      </div>
    );
  }

  // ── Mobile hero ─────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section
        className="md:hidden relative flex flex-col"
        aria-label="HomelineTeam — Transform Your Home with Premium Furnishings"
      >
        {/* Hero image with overlay content */}
        <div className="relative h-[52vh] min-h-[340px] overflow-hidden bg-gray-900">

          {/* Background images */}
          {activeImages.length > 0 ? (
            activeImages.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.altText || 'HomelineTeam home furnishing'}
                  fill
                  className="object-cover object-center"
                  priority={i === 0}
                  sizes="100vw"
                />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950" />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          {/* ── Overlaid content ── */}
          <div className="absolute inset-0 flex flex-col justify-between px-4 pt-10 pb-4">

            {/* Top: rating badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 rounded-full">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-white/90 text-xs font-semibold">4.8 · 50,000+ Happy Customers</span>
              </div>
            </div>

            {/* Bottom: headline + CTA + dots */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-[1.15] tracking-tight">
                  Transform Your Home with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                    Premium Furnishings
                  </span>
                </h1>
                <p className="mt-1.5 text-xs text-white/65 leading-relaxed">
                  2,000+ designs crafted for modern Indian homes.
                </p>
              </div>

              <div className="flex gap-2.5">
                <Link href="/collections" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 bg-white text-gray-900 font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg active:scale-95 transition-transform cursor-pointer">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Shop Now
                  </button>
                </Link>
                <Link href="/interior-design" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 border border-white/50 text-white font-bold text-xs px-4 py-2.5 rounded-lg backdrop-blur-sm active:scale-95 transition-transform cursor-pointer">
                    Interior Design
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

              {/* Slide dots */}
              {activeImages.length > 1 && (
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
                  {activeImages.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === currentImageIndex}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentImageIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/35'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category strip */}
        {categoriesLoaded && activeCategories.length > 0 && (
          <nav
            aria-label="Shop by category"
            className="bg-white border-t border-gray-100 shadow-md"
          >
            <div className="flex overflow-x-auto scrollbar-none">
              {activeCategories.map((cat, i) => (
                <Link
                  key={i}
                  href={getCategoryLink(cat)}
                  aria-label={`Shop ${cat.altText || cat.name || 'category'}`}
                  className="flex-shrink-0 group relative active:opacity-80 transition-opacity"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.altText || cat.name || 'Category'}
                    className="h-[72px] w-auto object-cover"
                    loading="lazy"
                  />
                  {/* Subtle hover tint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </Link>
              ))}
            </div>
          </nav>
        )}
      </section>
    );
  }

  // ── Desktop right-panel slider ──────────────────────────────────────────────
  return (
    <div className={`relative ${className}`} aria-label="Featured products slider">
      <div className="relative h-64 lg:h-72 xl:h-80 rounded-2xl overflow-hidden bg-gray-900">
        {activeImages.length > 0 ? (
          activeImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={img.altText || 'HomelineTeam featured design'}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(min-width: 1280px) 384px, 320px"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <span className="text-white/40 text-sm">No images available</span>
          </div>
        )}

        {/* Bottom gradient + category strip */}
        {categoriesLoaded && activeCategories.length > 0 && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
            <nav
              aria-label="Quick categories"
              className="absolute bottom-0 inset-x-0 flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-none"
            >
              {activeCategories.map((cat, i) => (
                <Link
                  key={i}
                  href={getCategoryLink(cat)}
                  aria-label={cat.altText || cat.name || 'Category'}
                  className="flex-shrink-0 group"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.altText || cat.name || 'Category'}
                    className="h-14 w-auto rounded-lg object-cover ring-1 ring-white/20 group-hover:ring-white/60 group-hover:scale-105 transition-all duration-200 shadow-md"
                    loading="lazy"
                  />
                </Link>
              ))}
            </nav>
          </>
        )}

        {/* Slide dots */}
        {activeImages.length > 1 && (
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
            role="tablist"
            aria-label="Image slides"
          >
            {activeImages.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === currentImageIndex}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentImageIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentImageIndex
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
