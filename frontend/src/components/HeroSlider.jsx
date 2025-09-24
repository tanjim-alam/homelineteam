'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { useHeroData } from '../hooks/useHeroData';
import UpdateNotification from './UpdateNotification';
import api from '../services/api';

const HeroSlider = ({ isMobile = false, className = "" }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { heroData, isLoading, isRefreshing, lastUpdated, refresh } = useHeroData();

  // Fetch hierarchical categories for proper routing
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getHierarchicalCategories();
        let categoriesData = [];
        if (data && Array.isArray(data)) {
          categoriesData = data;
        } else if (data && data.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        } else if (data && data.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        }
        setHierarchicalCategories(categoriesData);
        setCategoriesLoaded(true);
      } catch (error) {
        setCategoriesLoaded(true); // Set to true even on error to prevent infinite loading
      }
    };

    fetchCategories();
  }, []);

  // Show notification when data is refreshed
  useEffect(() => {
    if (lastUpdated && !isLoading) {
      setShowNotification(true);
    }
  }, [lastUpdated, isLoading]);

  // Filter active images with safety checks
  const activeBackgroundImages = (heroData.mobileBackgroundImages || []).filter(img => img && img.isActive);
  const activeCategories = (heroData.categories || []).filter(cat => cat && cat.isActive);

  // Function to generate correct category link
  const getCategoryLink = (category) => {
    // If hierarchical categories are not loaded yet, wait
    if (hierarchicalCategories.length === 0) {
      return `/collections/${category.slug}`;
    }

    // If category has a custom link from hero data, use it as fallback
    if (category.link && !category.link.startsWith('/collections/')) {
      return category.link;
    }

    // Try to find the category in hierarchical structure
    for (const mainCategory of hierarchicalCategories) {
      if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
        const subcategory = mainCategory.subcategories.find(sub => {
          // More flexible matching
          const slugMatch = sub.slug === category.slug;
          const idMatch = sub._id === category._id;
          const nameMatch = sub.name === category.name;
          const titleMatch = sub.title === category.title;
          const linkMatch = sub.link === category.link;

          return slugMatch || idMatch || nameMatch || titleMatch || linkMatch;
        });
        if (subcategory) {
          return `/${mainCategory.slug}/${subcategory.slug}`;
        }
      }
    }

    // Fallback to collections route
    return `/collections/${category.slug}`;
  };

  // Auto-slide background images
  useEffect(() => {
    const sliderSettings = heroData.sliderSettings || {};
    if (!sliderSettings.autoSlide || activeBackgroundImages.length <= 1) return;

  }, [activeBackgroundImages.length, heroData.sliderSettings?.autoSlide, heroData.sliderSettings?.slideInterval]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`relative ${isMobile ? 'md:hidden' : ''} ${className}`}>
        <div className={`relative ${isMobile ? 'h-[60vh]' : 'h-96'} bg-gray-200 flex items-center justify-center rounded-xl`}>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isMobile ? 'md:hidden' : ''} ${className}`}>
      {/* Refresh Button and Status */}
      {!isMobile && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
          {/* <button
            onClick={refresh}
            disabled={isRefreshing}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors disabled:opacity-50"
            title="Refresh hero data"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button> */}
          {/* {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-white/70 bg-black/20 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )} */}
        </div>
      )}

      {/* Background Image Slider */}
      <div className={`relative ${isMobile ? 'h-[55vh]' : 'h-96'} rounded-xl overflow-hidden`}>
        {/* Sliding Background Images */}
        <div className="absolute inset-0">
          {activeBackgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-${heroData.sliderSettings?.transitionDuration || 1000} ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <Image
                src={image.imageUrl}
                alt={image.altText}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Category Images at Bottom */}
        {categoriesLoaded && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center">
            <div className="flex items-center justify-center gap-2 px-2 pb-2">
              {activeCategories.map((category, index) => (
                <Link key={index} href={getCategoryLink(category)} className="w-full">
                  <img
                    src={category.imageUrl}
                    alt={category.altText}
                    className="w-full h-24 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Slider Indicators */}
        {activeBackgroundImages.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {activeBackgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Refresh Indicator */}
        {isRefreshing && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <RefreshCw className="w-3 h-3 text-white animate-spin" />
            <span className="text-xs text-white">Updating...</span>
          </div>
        )}
      </div>

      {/* Update Notification */}
      {/* <UpdateNotification 
        show={showNotification} 
        onClose={() => setShowNotification(false)}
        message="Hero section updated with latest changes!"
      /> */}
    </div>
  );
};

export default HeroSlider;
