'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Home, Palette, Users, Award, Clock, CheckCircle } from 'lucide-react';

const InteriorDesignSection = () => {
  const services = [
    {
      icon: Home,
      title: 'Complete Home Design',
      description: 'Transform your entire home with our comprehensive interior design services',
      features: ['Space Planning', 'Color Consultation', 'Furniture Selection', 'Lighting Design'],
      gradient: 'from-blue-500 to-cyan-500',
      hoverBorder: 'blue-500',
      href: '/interior-design'
    },
    {
      icon: Palette,
      title: 'Kitchen Design',
      description: 'Create your dream kitchen with modern layouts and premium finishes',
      features: ['Layout Design', 'Cabinet Selection', 'Countertop Options', 'Appliance Integration'],
      gradient: 'from-orange-500 to-red-500',
      hoverBorder: 'orange-500',
      href: '/collections/kitchen'
    },
    {
      icon: Users,
      title: '1 BHK Package',
      description: 'Complete home packages designed for different family sizes and budgets',
      features: ['1 BHK Packages', 'Custom Solutions'],
      gradient: 'from-green-500 to-emerald-500',
      hoverBorder: 'green-500',
      href: '/collections/1-bhk-package'
    }
  ];

  const stats = [
    { number: '500+', label: 'Homes Transformed' },
    { number: '4.9/5', label: 'Customer Rating' },
    { number: '24/7', label: 'Design Support' },
    { number: '100%', label: 'Satisfaction Guarantee' }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Professional Interior Design
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Transform Your Space with
            <span className="bg-gradient-to-r text-gradient"> Expert Design</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our experienced interior designers create beautiful, functional spaces that reflect your personality and lifestyle. 
            From concept to completion, we bring your vision to life.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-${service.hoverBorder}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="relative p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <div className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={service.href}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${service.gradient} text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                >
                  <span>Explore Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our <span className="bg-gradient-to-r text-gradient">Design Services?</span></h3>
            <p className="text-lg text-gray-600">Trusted by thousands of satisfied customers across India</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-600 hover:to-primary-700 rounded-3xl p-8 lg:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Design Process</h3>
            <p className="text-xl text-blue-100">Simple, transparent, and results-driven</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Consultation</h4>
              <p className="text-blue-100">Free initial consultation to understand your needs and vision</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Design & Planning</h4>
              <p className="text-blue-100">Custom design concepts and detailed planning for your space</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Implementation</h4>
              <p className="text-blue-100">Professional execution with quality materials and craftsmanship</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Home?</h3>
            <p className="text-lg text-gray-600 mb-8">
              Book a free consultation with our expert designers and get started on your dream home today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/interior-design"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Start Your Design Journey
              </Link>
              <Link
                href="/contact"
                className="bg-gray-100 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Contact Our Designers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteriorDesignSection;
