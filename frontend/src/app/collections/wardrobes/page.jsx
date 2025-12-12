'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home, Calculator, Palette, Ruler,
  ArrowRight, CheckCircle, Star,
  Users, Award, Clock, Shield, Shirt
} from 'lucide-react';
import Metadata from '@/components/Metadata';
import Image from 'next/image';
import api from '@/services/api';
import { useSubmission } from '@/contexts/SubmissionContext';

export default function WardrobesPage() {
  const [activeTab, setActiveTab] = useState('quote');
  const [showDesignSession, setShowDesignSession] = useState(false);
  const [wardrobeConfig, setWardrobeConfig] = useState({
    type: '',
    doors: ''
  });
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    city: '',
    homeType: ''
  });
  const { isSubmitting, startSubmission, endSubmission } = useSubmission();
  const formId = 'wardrobes-page';
  const [wardrobeProducts, setWardrobeProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchWardrobes();
  }, []);

  const fetchWardrobes = async () => {
    try {
      setLoading(true);
      const res = await api.request('/wardrobe-products');
      setWardrobeProducts(Array.isArray(res) ? res : []);
    } catch (e) {
      setError('Failed to load wardrobes');
      setWardrobeProducts(allWardrobes);
    } finally { setLoading(false); }
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name || !leadForm.phone || !leadForm.homeType) {
      alert('Please fill in all required fields');
      return;
    }

    // Prevent multiple submissions
    const submissionId = startSubmission(formId);
    if (!submissionId) {
      return;
    }

    try {

      // Prepare product details if a product was selected
      const productDetails = selectedProduct ? {
        name: selectedProduct.name,
        price: selectedProduct.basePrice || selectedProduct.price || 0,
        image: selectedProduct.mainImages?.[0] || selectedProduct.image || '',
        category: 'Wardrobe',
        description: selectedProduct.description || 'Wardrobe design product',
        type: selectedProduct.type || 'Not specified',
        doors: selectedProduct.doors || 'Not specified'
      } : null;

      const response = await api.createLead({
        name: leadForm.name,
        phone: leadForm.phone,
        city: leadForm.city,
        homeType: leadForm.homeType,
        sourcePage: 'Wardrobes Page',
        message: 'Interested in wardrobe design',
        productDetails: productDetails,
        meta: {
          wardrobeConfig,
          selectedProduct: selectedProduct ? {
            id: selectedProduct._id,
            name: selectedProduct.name,
            basePrice: selectedProduct.basePrice || selectedProduct.price,
            type: selectedProduct.type,
            doors: selectedProduct.doors,
            image: selectedProduct.mainImages?.[0] || selectedProduct.image
          } : null,
          page: 'wardrobes'
        }
      });

      if (response.success) {
        alert('Thank you! Your wardrobe design session request has been submitted. Our team will contact you within 24 hours.');
        setShowDesignSession(false);
        setLeadForm({ name: '', phone: '', city: '', homeType: '' });
        setSelectedProduct(null);
      } else {
        alert('Failed to submit your request. Please try again or contact us directly.');
      }
    } catch (error) {
      alert('Failed to submit your request. Please try again or contact us directly.');
    } finally {
      endSubmission(formId);
    }
  };

  // Filter wardrobes based on configuration
  const filteredWardrobes = wardrobeProducts.filter(wardrobe => {
    const typeMatch = !wardrobeConfig.type || wardrobe.defaultOpening?.toLowerCase() === wardrobeConfig.type.toLowerCase() || wardrobe.defaultType?.toLowerCase().includes(wardrobeConfig.type.toLowerCase()) || wardrobe.type === wardrobeConfig.type;
    const doorsMatch = !wardrobeConfig.doors || wardrobe.defaultType?.toLowerCase().includes(wardrobeConfig.doors.split(' ')[0].toLowerCase()) || wardrobe.doors === wardrobeConfig.doors;
    return typeMatch && doorsMatch;
  });


  return (
    <>
      <Metadata
        title="Custom Wardrobe Solutions - HomeLine"
        description="Explore our complete range of custom wardrobe designs that maximize storage and enhance your bedroom aesthetics. Get instant quotes and 3D visualizations."
        keywords="wardrobe design, custom wardrobe, bedroom storage, wardrobe solutions, modular wardrobe, wardrobe calculator"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Product Configuration Tool with Fixed Sidebar */}
        <div className="py-16 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Wardrobes ({filteredWardrobes?.length})</h2>
              <p className="text-lg text-gray-600">Find your perfect wardrobe solution</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Fixed Sidebar Filter */}
              <div className="lg:w-80 lg:sticky lg:top-8 lg:h-fit">
                <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Filters</h3>
                    <p className="text-xs text-gray-600">{filteredWardrobes.length} wardrobes found</p>
                  </div>

                  <div className="space-y-4">
                    {/* Wardrobe Type Configuration */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <Shirt className="w-3 h-3 text-blue-600" />
                        Wardrobe Type
                      </h4>
                      <div className="space-y-1">
                        {['Sliding', 'Swinging'].map((type) => (
                          <button
                            key={type}
                            className={`w-full p-2 rounded-md border text-left text-gray-700 transition-all duration-200 ${wardrobeConfig.type === type
                              ? 'border-blue-600 bg-blue-100 text-blue-900'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            onClick={() => setWardrobeConfig({ ...wardrobeConfig, type: type })}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">{type}</span>
                              {wardrobeConfig.type === type && (
                                <CheckCircle className="w-3 h-3 text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Door Configuration */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
                        <Home className="w-3 h-3 text-blue-600" />
                        Number of Doors
                      </h4>
                      <div className="grid grid-cols-2 gap-1">
                        {['2 Door', '3 Door', '4 Door', '5 Door'].map((doors) => (
                          <button
                            key={doors}
                            className={`w-full p-1.5 rounded-md border text-left text-gray-700 transition-all duration-200 ${wardrobeConfig.doors === doors
                              ? 'border-blue-600 bg-blue-100 text-blue-900'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            onClick={() => setWardrobeConfig({ ...wardrobeConfig, doors: doors })}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">{doors}</span>
                              {wardrobeConfig.doors === doors && (
                                <CheckCircle className="w-2 h-2 text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-blue-200">
                    <button
                      onClick={() => setWardrobeConfig({ type: '', doors: '' })}
                      className="flex items-center cursor-pointer justify-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowDesignSession(true)}
                      className="bg-gradient-to-r from-blue-600 cursor-pointer to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-md text-xs font-semibold shadow-lg transition-all duration-200"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Listings */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-gray-600">Loading wardrobes...</div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Shirt className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load wardrobes</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={fetchWardrobes} className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">Try Again</button>
                  </div>
                ) : filteredWardrobes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredWardrobes.map((wardrobe, index) => (
                      <div key={index} className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 ${selectedProduct?._id === wardrobe._id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:shadow-xl'
                        }`}>
                        <div className="h-48 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url("${wardrobe.mainImages?.[0] || wardrobe.image}")` }}>
                          {selectedProduct?._id === wardrobe._id && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Selected
                            </div>
                          )}
                          <div className="h-full bg-opacity-20 flex items-end">
                            <div className="p-3 text-white">
                              <p className="text-sm font-medium line-clamp-2">{wardrobe.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          {wardrobe.defaultType && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-600">Type: {wardrobe.defaultType}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-500">*Excluding applicable taxes</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-gray-900">₹ {(wardrobe.basePrice || wardrobe.price).toLocaleString()}</span>
                            {(wardrobe.mrp || wardrobe.originalPrice) && (
                              <span className="text-sm text-gray-500 line-through">₹ {(wardrobe.mrp || wardrobe.originalPrice).toLocaleString()}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mb-3">Delivery in 15 days*</div>
                          <button
                            onClick={() => {
                              setSelectedProduct(wardrobe);
                              setShowDesignSession(true);
                            }}
                            className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 text-sm"
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
                      <Shirt className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No wardrobes found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters to see more options</p>
                    <button
                      onClick={() => setWardrobeConfig({ type: '', doors: '' })}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
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
                Why Choose HomeLine Wardrobe Design?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We combine technology with expertise to deliver exceptional wardrobe storage solutions
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
                  title: "Design Expertise",
                  description: "Work with certified wardrobe designers with 10+ years experience"
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
                <div key={index} className="text-center p-6 rounded-2xl bg-white hover:bg-blue-50 transition-colors duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-600 hover:to-primary-700 text-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "2500+", label: "Wardrobe Projects" },
                { number: "10+", label: "Years Experience" },
                { number: "98%", label: "Customer Satisfaction" },
                { number: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 sm:py-20 bg-gray-900 text-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Storage?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get in touch with our wardrobe design experts for a personalized consultation and detailed project planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold"
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

        {/* Design Session Modal */}
        {showDesignSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book Free Wardrobe Design Session</h2>
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
                          className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${leadForm.homeType === type.name ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
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
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    disabled={isSubmitting(formId)}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 ${isSubmitting(formId) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isSubmitting(formId) ? 'Submitting...' : 'Book Free Wardrobe Design Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}