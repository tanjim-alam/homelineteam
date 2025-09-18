'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home, Calculator, Palette, Ruler,
  ArrowRight, CheckCircle, Star,
  Users, Award, Clock, Shield, Package, ChefHat
} from 'lucide-react';
import Metadata from '@/components/Metadata';
import api from '@/services/api';
import Image from 'next/image';

export default function OneBHKPackagePage() {
  const [activeTab, setActiveTab] = useState('quote');
  const [showDesignSession, setShowDesignSession] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', city: '', homeType: '' });
  const [submitting, setSubmitting] = useState(false);
  const [packageConfig, setPackageConfig] = useState({
    kitchenType: '',
    wardrobeType: ''
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await api.request('/api/1bhk-packages');
        setPackages(Array.isArray(response) ? response : []);
      } catch (e) {
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleLeadSubmit = async () => {
    if (!leadForm.name?.trim() || !leadForm.phone?.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    try {
      setSubmitting(true);
      console.log('Sending 1BHK package configuration:', packageConfig);
      console.log('Selected product:', selectedProduct);

      // Prepare product details if a product was selected
      const productDetails = selectedProduct ? {
        name: selectedProduct.name,
        price: selectedProduct.basePrice || selectedProduct.price || 0,
        image: selectedProduct.mainImages?.[0] || selectedProduct.image || '',
        category: '1 BHK Package',
        description: selectedProduct.description || '1 BHK interior design package',
        kitchenLayout: selectedProduct.kitchenLayout || 'Not specified',
        wardrobeType: selectedProduct.wardrobeType || 'Not specified'
      } : null;

      const response = await api.createLead({
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        city: leadForm.city || '',
        homeType: leadForm.homeType || '',
        sourcePage: '/collections/1-bhk-package',
        message: '1 BHK Package design session request',
        productDetails: productDetails,
        meta: {
          packageConfig,
          selectedProduct: selectedProduct ? {
            id: selectedProduct._id,
            name: selectedProduct.name,
            basePrice: selectedProduct.basePrice || selectedProduct.price,
            kitchenLayout: selectedProduct.kitchenLayout,
            wardrobeType: selectedProduct.wardrobeType,
            image: selectedProduct.mainImages?.[0] || selectedProduct.image
          } : null
        }
      });

      if (response.success) {
        alert('Thank you! Your 1 BHK design session request has been submitted. Our team will contact you within 24 hours.');
        setShowDesignSession(false);
        setLeadForm({ name: '', phone: '', city: '', homeType: '' });
        setSelectedProduct(null);
      } else {
        alert('Failed to submit your request. Please try again or contact us directly.');
      }
    } catch (e) {
      console.error('Lead submission error:', e);
      alert('Failed to submit your request. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter packages based on configuration
  const filteredPackages = packages.filter(pkg => {
    // Map static filter values to package data
    const kitchenLayoutMap = {
      'L Shape': 'l-shape',
      'Parallel Shape': 'parallel',
      'Straight Shape': 'straight'
    };

    const wardrobeTypeMap = {
      '2 Door': '2-door',
      '3 Door': '3-door',
      '4 Door': '4-door'
    };

    const kitchenMatch = !packageConfig.kitchenType ||
      pkg.kitchenLayout === kitchenLayoutMap[packageConfig.kitchenType];

    const wardrobeMatch = !packageConfig.wardrobeType ||
      pkg.wardrobeType === wardrobeTypeMap[packageConfig.wardrobeType];

    return kitchenMatch && wardrobeMatch;
  });


  return (
    <>
      <Metadata
        title="1 BHK Complete Interior Package - HomeLine"
        description="Complete interior design solution for 1 BHK apartments with all essential furniture and fixtures. Get instant quotes and 3D visualizations."
        keywords="1 bhk interior design, complete home package, 1 bedroom package, small apartment design, budget interior design"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        {/* <div className="relative text-white overflow-hidden min-h-[600px] flex items-center">
          <div className="absolute inset-0">
            <Image 
              src="/interior-design-img.jpg" 
              alt="1 BHK Package Hero Background" 
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/50 via-teal-700/50 to-green-800/80"></div>
          </div>
          
          <div className="container-custom py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Complete 1 BHK Interior 
                <span className="block text-yellow-300">Design Package</span>
              </h1>
              <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Get instant quotes, explore complete home designs, and work with our expert designers to create your perfect 1 BHK space.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold px-8 py-4 text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Get Your Free 1 BHK Quote
                </Link>
                <Link 
                  href="/contact"
                  className="btn-secondary border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg font-semibold"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div> */}

        {/* Product Configuration Tool with Fixed Sidebar */}
        <div className="py-16 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">1 BHK Package</h2>
              <p className="text-lg text-gray-600">Configure your perfect 1 BHK package</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Fixed Sidebar Filter */}
              <div className="lg:w-80 lg:sticky lg:top-8 lg:h-fit">
                <div className="bg-gradient-to-b from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Filters</h3>
                    <p className="text-sm text-gray-600">{filteredPackages.length} packages found</p>
                  </div>

                  <div className="space-y-4">
                    {/* Kitchen Configuration */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <ChefHat className="w-4 h-4 text-purple-600" />
                        Kitchen Type
                      </h4>
                      <div className="space-y-1">
                        {['L Shape', 'Parallel Shape', 'Straight Shape'].map((type) => (
                          <button
                            key={type}
                            className={`w-full p-2 rounded-md border text-left text-gray-700 transition-all duration-200 cursor-pointer ${packageConfig.kitchenType === type
                              ? 'border-purple-600 bg-purple-100 text-purple-900'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                              }`}
                            onClick={() => setPackageConfig({ ...packageConfig, kitchenType: type })}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{type}</span>
                              {packageConfig.kitchenType === type && (
                                <CheckCircle className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wardrobe Configuration */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <Home className="w-4 h-4 text-purple-600" />
                        Wardrobe Type
                      </h4>
                      <div className="grid grid-cols-2 gap-1">
                        {['2 Door', '3 Door', '4 Door'].map((type) => (
                          <button
                            key={type}
                            className={`w-full p-1.5 rounded-md border text-left text-gray-700 transition-all duration-200 cursor-pointer ${packageConfig.wardrobeType === type
                              ? 'border-purple-600 bg-purple-100 text-purple-900'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                              }`}
                            onClick={() => setPackageConfig({ ...packageConfig, wardrobeType: type })}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{type}</span>
                              {packageConfig.wardrobeType === type && (
                                <CheckCircle className="w-3 h-3 text-purple-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-purple-200">
                    <button
                      onClick={() => setPackageConfig({ kitchenType: '', wardrobeType: '' })}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowDesignSession(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-2 rounded-md text-sm font-semibold shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Listings */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="text-gray-600">Loading 1 BHK packages...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load packages</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPackages.map((pkg, index) => (
                      <div key={pkg._id || index} className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 ${selectedProduct?._id === pkg._id
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:shadow-xl'
                        }`}>
                        <div className="h-48 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url("${pkg.mainImages?.[0] || '/placeholder-kitchen.jpg'}")` }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <p className="text-sm font-medium line-clamp-2">{pkg.name}</p>
                          </div>
                          {/* Package Type Badge */}
                          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            1 BHK Package
                          </div>
                          {selectedProduct?._id === pkg._id && (
                            <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Selected
                            </div>
                          )}
                        </div>
                        <div className="p-4">


                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">1 Wardrobe</span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-600">1 Kitchen</span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">*Excluding applicable taxes</span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-gray-900">₹ {pkg.basePrice.toLocaleString()}</span>
                            {pkg.mrp && pkg.mrp > pkg.basePrice && (
                              <span className="text-sm text-gray-500 line-through">₹ {pkg.mrp.toLocaleString()}</span>
                            )}
                          </div>

                          <div className="text-xs text-gray-600 mb-3">
                            Delivery in {pkg.packageMetadata?.deliveryTime || '15-20 days'}*
                          </div>

                          <button
                            onClick={() => {
                              setSelectedProduct(pkg);
                              setShowDesignSession(true);
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 text-sm cursor-pointer"
                          >
                            Book Consultation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
                    <p className="text-gray-600 mb-4">
                      {packages.length === 0
                        ? 'No 1BHK packages available. Please add some packages from the admin panel.'
                        : 'Try adjusting your filters to see more options'
                      }
                    </p>
                    <button
                      onClick={() => setPackageConfig({ kitchenType: '', wardrobeType: '' })}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 sm:py-20 bg-gray-50">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose HomeLine 1 BHK Package?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We combine technology with expertise to deliver exceptional complete home solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  icon: Calculator,
                  title: "Instant Quotes",
                  description: "Get accurate cost estimates in minutes with our advanced calculator"
                },
                {
                  icon: Palette,
                  title: "Complete Design",
                  description: "Work with certified interior designers with 10+ years experience"
                },
                {
                  icon: Ruler,
                  title: "Precise Measurements",
                  description: "3D visualization and accurate space planning for perfect fit"
                },
                {
                  icon: Shield,
                  title: "Quality Assurance",
                  description: "Premium materials and craftsmanship with 2-year warranty"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-white hover:bg-green-50 transition-colors duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Design Session Modal */}
        {showDesignSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book Free 1 BHK Design Session</h2>
                  <button
                    onClick={() => setShowDesignSession(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Home Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Home Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: '1bhk', name: '1 BHK', description: 'Perfect for small families' },
                        { id: '2bhk', name: '2 BHK', description: 'Ideal for growing families' },
                        { id: '3bhk', name: '3 BHK', description: 'Spacious family homes' },
                        { id: '4bhk', name: '4 BHK', description: 'Luxury family living' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setLeadForm({ ...leadForm, homeType: type.name })}
                          className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${leadForm.homeType === type.name ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                        >
                          <div className="font-semibold text-gray-900 text-sm">{type.name}</div>
                          <div className="text-xs text-gray-600">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select your city</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="chennai">Chennai</option>
                        <option value="pune">Pune</option>
                        <option value="kolkata">Kolkata</option>
                        <option value="ahmedabad">Ahmedabad</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleLeadSubmit}
                    disabled={submitting}
                    className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 ${submitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {submitting ? 'Submitting...' : 'Book Free 1 BHK Design Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-600 hover:to-primary-700 text-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "1500+", label: "1 BHK Projects" },
                { number: "10+", label: "Years Experience" },
                { number: "98%", label: "Customer Satisfaction" },
                { number: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-green-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 sm:py-20 bg-gray-900 text-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your 1 BHK?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get in touch with our design experts for a personalized consultation and detailed project planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary bg-green-600 hover:bg-green-700 px-8 py-4 text-lg font-semibold"
              >
                Schedule Consultation
              </Link>
              <Link
                href="tel:+91987000000"
                className="btn-secondary border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold"
              >
                Call Now: +91 98700 0000
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}