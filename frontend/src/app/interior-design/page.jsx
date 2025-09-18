'use client';

import Link from 'next/link';
import { ArrowRight, Home, ChefHat, Package, Users, Star, CheckCircle, Sparkles, Palette, Ruler, Clock, Phone } from 'lucide-react';
import Metadata from '@/components/Metadata';
import Image from 'next/image';
import ModernCard from '@/components/ModernCard';
import InteriorDesignCalculator from '@/components/InteriorDesignCalculator';
import QuickQuoteEstimator from '@/components/QuickQuoteEstimator';

export default function InteriorDesignPage() {
  return (
    <>
      <Metadata 
        title="Interior Design Services - HomeLine"
        description="Transform your space with our professional interior design services. Explore our specialized design solutions for kitchens, wardrobes, and complete home packages."
        keywords="interior design, home design, modular kitchen, wardrobe design, 1bhk package, 2bhk package"
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background with Modern Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700"></div>
          <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full"></div>
        </div>
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 container-custom py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-white">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Premium Interior Design Services</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Transform Your Space with
                    <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Modern Design
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    Create stunning interiors with our expert design team. From concept to completion, 
                    we bring your vision to life with premium materials and innovative solutions.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-8 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Palette className="w-5 h-5" />
                      Start Your Project
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link 
                      href="tel:+91987000000"
                      className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <Phone className="w-5 h-5" />
                      Call Now
                    </Link>
                  </div>
                </div>
                
                {/* Right Content - Image */}
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image 
                      src="/interior-design-img.jpg" 
                      alt="Modern Interior Design" 
                      width={600}
                      height={400}
                      className="w-full h-[400px] object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">500+</div>
                        <div className="text-sm text-gray-600">Projects Completed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">4.9</div>
                        <div className="text-sm text-gray-600">Client Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Services Section */}
        <div className="py-20 bg-gray-50">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Ruler className="w-4 h-4" />
                <span>Our Services</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Design Solutions for
                <span className="block bg-gradient-to-r text-gradient bg-clip-text text-transparent">
                  Every Space
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                From modular kitchens to complete home packages, we offer comprehensive interior design solutions 
                tailored to your lifestyle and budget.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ModernCard
                icon={ChefHat}
                title="Modular Kitchen"
                description="Modern kitchen designs with premium finishes, smart storage solutions, and contemporary layouts."
                features={["Custom Design", "Premium Materials", "Smart Storage"]}
                href="/collections/kitchen"
                buttonText="Explore Kitchens"
                gradientFrom="from-orange-500"
                gradientTo="to-red-500"
                hoverBorderColor="orange-200"
              />

              <ModernCard
                icon={Home}
                title="Wardrobe Solutions"
                description="Custom wardrobe designs that maximize storage space while enhancing your bedroom aesthetics."
                features={["Space Optimization", "Custom Fittings", "Modern Designs"]}
                href="/collections/wardrobes"
                buttonText="View Wardrobes"
                gradientFrom="from-blue-500"
                gradientTo="to-purple-500"
                hoverBorderColor="blue-200"
              />

              <ModernCard
                icon={Package}
                title="1 BHK Package"
                description="Complete interior design solution for 1 BHK apartments with all essential furniture and fixtures."
                features={["Complete Setup", "Budget Friendly", "Quick Delivery"]}
                href="/collections/1-bhk-package"
                buttonText="View Package"
                gradientFrom="from-green-500"
                gradientTo="to-teal-500"
                hoverBorderColor="green-200"
              />

              <ModernCard
                icon={Users}
                title="2 BHK Package"
                description="Comprehensive interior design package for 2 BHK homes with premium furniture and modern designs."
                features={["Premium Quality", "Full Home Design", "Expert Consultation"]}
                href="/collections/2bhk-package"
                buttonText="View Package"
                gradientFrom="from-purple-500"
                gradientTo="to-pink-500"
                hoverBorderColor="purple-200"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>Why Choose Us</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                What Makes Us
                <span className="block text-gradient bg-clip-text text-transparent">
                  Different
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Turnaround</h3>
                <p className="text-gray-600 leading-relaxed">
                  Fast project completion without compromising on quality. Most projects delivered within 30-45 days.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  We use only the finest materials and work with trusted suppliers to ensure lasting quality.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Team</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our experienced designers and craftsmen bring years of expertise to every project.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interior Design Calculator Section */}
        <div className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <InteriorDesignCalculator />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Transform Your Space?
              </h2>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Get in touch with our design experts for a personalized consultation and detailed project planning. 
                Let's create something beautiful together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-8 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Palette className="w-5 h-5" />
                  Schedule Consultation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="tel:+91987000000"
                  className="inline-flex items-center gap-3 border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  Call Now: +91 98700 0000
                </Link>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                    <div className="text-gray-400">Projects Completed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">4.9/5</div>
                    <div className="text-gray-400">Client Rating</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">5 Years</div>
                    <div className="text-gray-400">Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Quote Estimator - Only on Interior Design Page */}
      <QuickQuoteEstimator />
    </>
  );
}

