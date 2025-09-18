'use client';

import { useState } from 'react';
import { Calculator, Home, Ruler, Palette, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import api from '@/services/api';

const InteriorDesignCalculator = () => {
  const [formData, setFormData] = useState({
    homeType: '',
    rooms: [],
    area: '',
    budget: '',
    style: '',
    timeline: '',
    name: '',
    phone: '',
    email: '',
    city: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const homeTypes = [
    { id: '1bhk', name: '1 BHK', basePrice: 150000, description: 'Perfect for small families' },
    { id: '2bhk', name: '2 BHK', basePrice: 250000, description: 'Ideal for growing families' },
    { id: '3bhk', name: '3 BHK', basePrice: 400000, description: 'Spacious family homes' },
    { id: '4bhk', name: '4 BHK', basePrice: 600000, description: 'Luxury family living' }
  ];

  const rooms = [
    { id: 'living', name: 'Living Room', multiplier: 1.0 },
    { id: 'bedroom', name: 'Bedroom', multiplier: 0.8 },
    { id: 'kitchen', name: 'Kitchen', multiplier: 1.2 },
    { id: 'bathroom', name: 'Bathroom', multiplier: 0.6 },
    { id: 'dining', name: 'Dining Room', multiplier: 0.7 },
    { id: 'study', name: 'Study Room', multiplier: 0.5 }
  ];

  const styles = [
    { id: 'modern', name: 'Modern', multiplier: 1.0 },
    { id: 'contemporary', name: 'Contemporary', multiplier: 1.1 },
    { id: 'traditional', name: 'Traditional', multiplier: 0.9 },
    { id: 'minimalist', name: 'Minimalist', multiplier: 0.8 },
    { id: 'luxury', name: 'Luxury', multiplier: 1.5 }
  ];

  const timelines = [
    { id: 'urgent', name: 'Within 1 month', multiplier: 1.2 },
    { id: 'normal', name: '1-3 months', multiplier: 1.0 },
    { id: 'flexible', name: '3-6 months', multiplier: 0.9 }
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Surat',
    'Lucknow',
    'Kanpur',
    'Nagpur',
    'Indore',
    'Thane',
    'Bhopal',
    'Visakhapatnam',
    'Pimpri-Chinchwad',
    'Patna',
    'Vadodara'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoomToggle = (roomId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.includes(roomId)
        ? prev.rooms.filter(id => id !== roomId)
        : [...prev.rooms, roomId]
    }));
  };

  const calculateCost = () => {
    if (!formData.homeType || formData.rooms.length === 0) return;

    const homeType = homeTypes.find(h => h.id === formData.homeType);
    const style = styles.find(s => s.id === formData.style);
    const timeline = timelines.find(t => t.id === formData.timeline);

    let baseCost = homeType.basePrice;

    // Apply room multipliers
    const roomMultiplier = formData.rooms.reduce((total, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room ? room.multiplier : 0);
    }, 0);

    // Apply style multiplier
    const styleMultiplier = style ? style.multiplier : 1.0;

    // Apply timeline multiplier
    const timelineMultiplier = timeline ? timeline.multiplier : 1.0;

    // Apply area multiplier (if provided)
    const areaMultiplier = formData.area ? Math.max(0.5, Math.min(2.0, formData.area / 1000)) : 1.0;

    const totalCost = Math.round(baseCost * roomMultiplier * styleMultiplier * timelineMultiplier * areaMultiplier);

    setEstimatedCost({
      baseCost,
      roomMultiplier,
      styleMultiplier,
      timelineMultiplier,
      areaMultiplier,
      totalCost,
      breakdown: {
        design: Math.round(totalCost * 0.3),
        materials: Math.round(totalCost * 0.4),
        labor: Math.round(totalCost * 0.2),
        miscellaneous: Math.round(totalCost * 0.1)
      }
    });
  };

  const submitLead = async () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Fetch sample products for interior design
      const sampleProducts = await api.getProducts({ limit: 3, featured: true });
      const productDetails = sampleProducts && sampleProducts.length > 0 ? {
        name: sampleProducts[0].name,
        price: sampleProducts[0].basePrice || sampleProducts[0].mrp || 0,
        image: sampleProducts[0].mainImages?.[0] || '',
        category: sampleProducts[0].categoryId || 'Interior Design',
        description: sampleProducts[0].description || 'Premium interior design product'
      } : null;

      await api.createLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city,
        homeType: formData.homeType,
        sourcePage: 'Interior Design Calculator',
        message: 'Interior design calculator estimate request',
        productDetails: productDetails,
        meta: {
          calculatorData: {
            homeType: formData.homeType,
            rooms: formData.rooms,
            area: formData.area,
            budget: formData.budget,
            style: formData.style,
            timeline: formData.timeline,
            estimatedCost: estimatedCost
          },
          page: 'interior-design-calculator'
        }
      });

      alert('Thank you! Your design estimate request has been submitted. Our team will contact you within 24 hours.');
    } catch (error) {
      alert('Failed to submit your request. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateCost();
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetCalculator = () => {
    setFormData({
      homeType: '',
      rooms: [],
      area: '',
      budget: '',
      style: '',
      timeline: '',
      name: '',
      phone: '',
      email: '',
      city: ''
    });
    setCurrentStep(1);
    setEstimatedCost(null);
    setShowResults(false);
  };

  if (showResults && estimatedCost) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Your Design Estimate</h3>
          <p className="text-gray-600">Here's your personalized interior design cost estimate</p>
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              ₹{estimatedCost.totalCost.toLocaleString()}
            </div>
            <div className="text-gray-600">Estimated Total Cost</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Design & Planning</span>
                <span className="font-medium text-gray-700">₹{estimatedCost.breakdown.design.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Materials</span>
                <span className="font-medium text-gray-700">₹{estimatedCost.breakdown.materials.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor</span>
                <span className="font-medium text-gray-700">₹{estimatedCost.breakdown.labor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miscellaneous</span>
                <span className="font-medium text-gray-700">₹{estimatedCost.breakdown.miscellaneous.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Project Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Home Type</span>
                <span className="font-medium text-gray-700">{homeTypes.find(h => h.id === formData.homeType)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rooms</span>
                <span className="font-medium text-gray-700">{formData.rooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Style</span>
                <span className="font-medium text-gray-700">{styles.find(s => s.id === formData.style)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timeline</span>
                <span className="font-medium text-gray-700">{timelines.find(t => t.id === formData.timeline)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">City</span>
                <span className="font-medium text-gray-700">{formData.city || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            This is an estimated cost. Final pricing may vary based on specific requirements and material choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetCalculator}
              className="bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Calculate Again
            </button>
            <button
              onClick={submitLead}
              disabled={submitting}
              className={`bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {submitting ? 'Submitting...' : 'Get Detailed Quote'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Interior Design Cost Calculator</h3>
        <p className="text-gray-600">Get an instant estimate for your interior design project</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Step {currentStep} of 4</span>
          <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Home Type */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">What type of home are you designing?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleInputChange('homeType', type.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.homeType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <div className="font-semibold text-gray-900">{type.name}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
                <div className="text-sm font-medium text-primary-600 mt-1">
                  Starting from ₹{type.basePrice.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Rooms */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Which rooms do you want to design?</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomToggle(room.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${formData.rooms.includes(room.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <div className="font-semibold text-gray-900">{room.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Style & Details */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Tell us more about your project</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Style</label>
              <select
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a style</option>
                {styles.map((style) => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Area (sq ft)</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="Enter total area"
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select timeline</option>
                {timelines.map((timeline) => (
                  <option key={timeline.id} value={timeline.id}>{timeline.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Contact Information */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Get your personalized estimate</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full p-3 border text-gray-700 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select your city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Previous
        </button>

        <button
          onClick={nextStep}
          disabled={
            (currentStep === 1 && !formData.homeType) ||
            (currentStep === 2 && formData.rooms.length === 0) ||
            (currentStep === 3 && (!formData.style || !formData.timeline)) ||
            (currentStep === 4 && (!formData.name || !formData.phone || !formData.email || !formData.city))
          }
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {currentStep === 4 ? 'Calculate Estimate' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InteriorDesignCalculator;
