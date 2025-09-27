'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden pb-14 md:pb-0">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-pink-500 to-primary-600"></div>
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-primary-500/10 to-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container-custom py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                  HomeLineTeam
                </div>
                <p className="text-gray-300 leading-relaxed max-w-md text-sm sm:text-base">
                  Transform your home with thoughtfully made products for Indian homes. From modern wallpapers
                  to colorful cushions, contemporary curtains to ultra-chic upholstery.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110" />
                </a>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                  <span>hello@homeline.com</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                  <span>+91 98700 0000</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 text-gray-300 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 mt-1" />
                  <span>Bangalore, Karnataka, India</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Quick Links</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link href="/collections" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    All Collections
                  </Link>
                </li>
                <li>
                  <Link href="/collections/curtains" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Curtains
                  </Link>
                </li>
                <li>
                  <Link href="/collections/blinds" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Blinds
                  </Link>
                </li>
                <li>
                  <Link href="/collections/wallpaper" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Wallpaper
                  </Link>
                </li>
                <li>
                  <Link href="/collections/cushion-covers" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Cushion Covers
                  </Link>
                </li>
                <li>
                  <Link href="/interior-design" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Interior Design
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10">
          <div className="container-custom py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
                Stay Updated with HomeLine
              </h3>
              <p className="text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                Subscribe to our newsletter for exclusive offers, new product launches, and interior design tips.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm text-sm sm:text-base"
                />
                <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base">
                  Subscribe
                </button>
              </div>

              <p className="text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10">
          <div className="container-custom py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
                © {currentYear} HomeLine. All rights reserved. Made with{' '}
                <Link href="https://www.mndigitalagency.com" className="hover:text-white transition-colors duration-300">MN Digital Agency</Link> in India.
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <Link href="/privacy-policy" className="hover:text-white transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors duration-300">
                  Terms of Service
                </Link>
                <Link href="/sitemap" className="hover:text-white transition-colors duration-300">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 lg:bottom-8 right-4 sm:right-6 lg:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </button>
    </footer>
  );
};

export default Footer;
