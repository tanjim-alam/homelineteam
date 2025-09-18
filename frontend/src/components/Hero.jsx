'use client';

import { ShoppingBag, Star, ArrowRight, CheckCircle, Sparkles, TrendingUp, Zap, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import MobileHero from './MobileHero';
import HeroSlider from './HeroSlider';
import { useHeroData } from '../hooks/useHeroData';

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { heroData, isLoading } = useHeroData();

  // Get active desktop background images from API data
  const backgroundImages = (heroData.desktopBackgroundImages || []).filter(img => img && img.isActive);

  // Auto-slide background images
  useEffect(() => {
    if (backgroundImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <>
        <MobileHero />
        <section className="relative bg-gray-200 hidden md:flex min-h-screen items-center justify-center">
          <div className="text-gray-600 text-lg">Loading...</div>
        </section>
      </>
    );
  }

  // Ensure we have at least one background image
  const safeBackgroundImages = backgroundImages.length > 0 ? backgroundImages : [
    { imageUrl: '/hero-bg-1.jpg', altText: 'Default Hero Background', isActive: true }
  ];

  return (
    <>
      {/* Mobile Hero Section - Only visible on mobile devices */}
      <MobileHero />
      
      {/* Desktop Hero Section - Hidden on mobile devices */}
      <section className="relative bg-white hidden md:block">
        {/* Main Hero Banner with Sliding Background */}
        <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Sliding Background Images */}
        <div className="absolute inset-0">
          {safeBackgroundImages.length > 0 ? (
            safeBackgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark overlay */}
                <Image
                  src={image.imageUrl}
                  alt={image.altText || `Hero background ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))
          ) : (
            // Fallback when no background images are available
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
              <div className="absolute inset-0 bg-black/40 z-10" />
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 container-custom py-4 px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8 text-white text-center lg:text-left w-full lg:w-1/2">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 sm:px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="text-xs sm:text-sm font-medium text-white">4.8/5 Rating</span>
                </div>
                <span className="text-xs text-white/70">•</span>
                <span className="text-xs sm:text-sm text-white/90">50,000+ Happy Customers</span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white">
                  Transform Your Home with
                  <span className="block text-yellow-300">Premium Furnishings</span>
                </h1>
                
                {/* <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl">
                  Discover 2000+ designs, 1200+ colors, and customizable options for curtains, wallpapers, cushions, and more. Made thoughtfully for Indian homes.
                </p> */}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/collections">
                  <button className="bg-white text-gray-900 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 group flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto">
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                <Link href="/collections/curtains">
                  <button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 group flex items-center justify-center gap-2 backdrop-blur-sm w-full sm:w-auto">
                    <span>View Curtains</span>
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-3 sm:gap-4 pt-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Slider */}
            <div className="relative w-full lg:w-1/3 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm sm:max-w-md">
                <HeroSlider isMobile={false} className="shadow-xl rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Background Image Navigation Dots */}
        {backgroundImages.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 z-30">
          <div className="w-4 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-1 sm:mt-2 animate-bounce-gentle" />
          </div>
        </div>
      </div>
      </section>

      
    </>
  );
};

export default Hero;
