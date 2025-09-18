'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calculator, Ruler, Palette, 
  Home, CheckCircle, Star, Clock, Shield 
} from 'lucide-react';
import Metadata from '@/components/Metadata';

export default function KitchenCalculatorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kitchenData, setKitchenData] = useState({
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    layout: '',
    purpose: '',
    materials: {
      cabinets: '',
      countertop: '',
      backsplash: '',
      flooring: ''
    },
    appliances: [],
    features: [],
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      city: ''
    }
  });

  const steps = [
    { id: 1, title: 'Dimensions', description: 'Enter kitchen size' },
    { id: 2, title: 'Layout', description: 'Choose layout type' },
    { id: 3, title: 'Purpose', description: 'Select project purpose' },
    { id: 4, title: 'Materials', description: 'Select materials' },
    { id: 5, title: 'Appliances', description: 'Choose appliances' },
    { id: 6, title: 'Contact', description: 'Share details' }
  ];

  const layouts = [
    { 
      id: 'straight', 
      name: 'Straight Line', 
      icon: '📏',
      description: 'Perfect for small spaces',
      efficiency: '85%'
    },
    { 
      id: 'l-shape', 
      name: 'L-Shape', 
      icon: '📐',
      description: 'Great for corner spaces',
      efficiency: '90%'
    },
    { 
      id: 'u-shape', 
      name: 'U-Shape', 
      icon: '🔄',
      description: 'Maximum storage capacity',
      efficiency: '95%'
    },
    { 
      id: 'island', 
      name: 'Island', 
      icon: '🏝️',
      description: 'Modern and spacious',
      efficiency: '88%'
    }
  ];

  const materials = {
    cabinets: [
      { id: 'laminate', name: 'Laminate', quality: 'Good', durability: '5-7 years' },
      { id: 'acrylic', name: 'Acrylic', quality: 'Better', durability: '8-10 years' },
      { id: 'wood', name: 'Solid Wood', quality: 'Best', durability: '15+ years' },
      { id: 'pvc', name: 'PVC', quality: 'Good', durability: '6-8 years' }
    ],
    countertop: [
      { id: 'granite', name: 'Granite', quality: 'Good', durability: '20+ years' },
      { id: 'quartz', name: 'Quartz', quality: 'Better', durability: '25+ years' },
      { id: 'marble', name: 'Marble', quality: 'Best', durability: '30+ years' },
      { id: 'ceramic', name: 'Ceramic', quality: 'Basic', durability: '10-15 years' }
    ],
    backsplash: [
      { id: 'tiles', name: 'Ceramic Tiles', quality: 'Good', durability: '10+ years' },
      { id: 'glass', name: 'Glass', quality: 'Better', durability: '15+ years' },
      { id: 'stone', name: 'Natural Stone', quality: 'Best', durability: '20+ years' },
      { id: 'paint', name: 'Paint', quality: 'Basic', durability: '3-5 years' }
    ],
    flooring: [
      { id: 'tiles', name: 'Ceramic Tiles', quality: 'Good', durability: '15+ years' },
      { id: 'vitrified', name: 'Vitrified Tiles', quality: 'Better', durability: '20+ years' },
      { id: 'wood', name: 'Wooden', quality: 'Best', durability: '25+ years' },
      { id: 'marble', name: 'Marble', quality: 'Better', durability: '30+ years' }
    ]
  };

  const appliances = [
    { id: 'hob', name: 'Gas Hob', category: 'Cooking', essential: true },
    { id: 'hood', name: 'Chimney', category: 'Ventilation', essential: true },
    { id: 'oven', name: 'Built-in Oven', category: 'Cooking', essential: false },
    { id: 'microwave', name: 'Microwave', category: 'Cooking', essential: false },
    { id: 'refrigerator', name: 'Refrigerator', category: 'Storage', essential: true },
    { id: 'dishwasher', name: 'Dishwasher', category: 'Cleaning', essential: false },
    { id: 'water', name: 'Water Purifier', category: 'Utility', essential: false }
  ];

  const features = [
    { id: 'soft-close', name: 'Soft Close Hinges', category: 'Hardware' },
    { id: 'pull-out', name: 'Pull-out Drawers', category: 'Storage' },
    { id: 'corner', name: 'Corner Solutions', category: 'Storage' },
    { id: 'lighting', name: 'LED Lighting', category: 'Lighting' },
    { id: 'organizer', name: 'Drawer Organizers', category: 'Storage' },
    { id: 'pantry', name: 'Pantry System', category: 'Storage' }
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getKitchenSummary = () => {
    const area = parseFloat(kitchenData.dimensions.length) * parseFloat(kitchenData.dimensions.width) || 0;
    
    const layoutMap = {
      'straight': 'Straight Line Layout',
      'l-shape': 'L-Shape Layout',
      'u-shape': 'U-Shape Layout',
      'island': 'Island Layout'
    };
    
    const purposeMap = {
      'new-kitchen': 'New Kitchen Setup',
      'kitchen-renovation': 'Kitchen Renovation',
      'modular-upgrade': 'Modular Upgrade',
      'appliance-upgrade': 'Appliance Upgrade'
    };
    
    return {
      area: area > 0 ? `${area} sq ft` : 'Not specified',
      layout: layoutMap[kitchenData.layout] || 'Not selected',
      purpose: purposeMap[kitchenData.purpose] || 'Not selected',
      appliances: kitchenData.appliances.length,
      features: kitchenData.features.length,
      materials: Object.values(kitchenData.materials).filter(m => m).length
    };
  };

  return (
    <>
      <Metadata 
        title="Modular Kitchen Cost Calculator - HomeLine"
        description="Calculate the cost of your dream modular kitchen with our advanced calculator. Get instant estimates for materials, appliances, and features."
        keywords="modular kitchen calculator, kitchen cost estimator, kitchen design, kitchen materials"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container-custom py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/interior-design" className="text-gray-500 hover:text-primary-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Kitchen Cost Calculator</h1>
                <p className="text-sm text-gray-600">Design your dream kitchen and get instant pricing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Calculator */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            currentStep >= step.id 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                          </div>
                          <div className="text-xs text-center mt-2 hidden sm:block">
                            <div className="font-medium">{step.title}</div>
                            <div className="text-gray-500">{step.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                                             <div 
                         className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                         style={{ width: `${(currentStep / 6) * 100}%` }}
                       ></div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="mb-8">
                    {currentStep === 1 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Kitchen Dimensions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Length (ft)</label>
                            <input
                              type="number"
                              value={kitchenData.dimensions.length}
                              onChange={(e) => setKitchenData({
                                ...kitchenData,
                                dimensions: {...kitchenData.dimensions, length: e.target.value}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="10"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Width (ft)</label>
                            <input
                              type="number"
                              value={kitchenData.dimensions.width}
                              onChange={(e) => setKitchenData({
                                ...kitchenData,
                                dimensions: {...kitchenData.dimensions, width: e.target.value}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="8"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Height (ft)</label>
                            <input
                              type="number"
                              value={kitchenData.dimensions.height}
                              onChange={(e) => setKitchenData({
                                ...kitchenData,
                                dimensions: {...kitchenData.dimensions, height: e.target.value}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="9"
                            />
                          </div>
                        </div>
                        {kitchenData.dimensions.length && kitchenData.dimensions.width && (
                          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                            <div className="text-sm text-primary-700">
                              <strong>Kitchen Area:</strong> {parseFloat(kitchenData.dimensions.length) * parseFloat(kitchenData.dimensions.width)} sq ft
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Kitchen Layout</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {layouts.map((layout) => (
                            <button
                              key={layout.id}
                              onClick={() => setKitchenData({...kitchenData, layout: layout.id})}
                              className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                                kitchenData.layout === layout.id
                                  ? 'border-primary-600 bg-primary-50'
                                  : 'border-gray-200 hover:border-primary-300'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{layout.icon}</div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-1">{layout.name}</div>
                                  <div className="text-sm text-gray-600 mb-2">{layout.description}</div>
                                  <div className="text-xs text-primary-600 font-medium">
                                    Efficiency: {layout.efficiency}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                                         {currentStep === 3 && (
                       <div>
                         <h3 className="text-xl font-semibold text-gray-900 mb-6">Kitchen Project Purpose</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {[
                             { id: 'new-kitchen', name: 'New Kitchen Setup', description: 'Building a new kitchen from scratch' },
                             { id: 'kitchen-renovation', name: 'Kitchen Renovation', description: 'Updating existing kitchen' },
                             { id: 'modular-upgrade', name: 'Modular Upgrade', description: 'Adding modular elements' },
                             { id: 'appliance-upgrade', name: 'Appliance Upgrade', description: 'Focusing on new appliances' }
                           ].map((purpose) => (
                             <button
                               key={purpose.id}
                               onClick={() => setKitchenData({...kitchenData, purpose: purpose.id})}
                               className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                                 kitchenData.purpose === purpose.id
                                   ? 'border-primary-600 bg-primary-50'
                                   : 'border-gray-200 hover:border-primary-300'
                               }`}
                             >
                               <div className="font-semibold text-gray-900 mb-2">{purpose.name}</div>
                               <div className="text-sm text-gray-600">{purpose.description}</div>
                             </button>
                           ))}
                         </div>
                       </div>
                     )}

                     {currentStep === 4 && (
                       <div>
                         <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Materials & Finishes</h3>
                        <div className="space-y-6">
                          {Object.entries(materials).map(([category, options]) => (
                            <div key={category}>
                              <label className="block text-lg font-medium text-gray-700 mb-4 capitalize">
                                {category.replace(/([A-Z])/g, ' $1')}
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {options.map((option) => (
                                                                     <button
                                     key={option.id}
                                     onClick={() => setKitchenData({
                                       ...kitchenData,
                                       materials: {...kitchenData.materials, [category]: option.id}
                                     })}
                                     className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                       kitchenData.materials[category] === option.id
                                         ? 'border-primary-600 bg-primary-50'
                                         : 'border-gray-200 hover:border-primary-300'
                                     }`}
                                   >
                                     <div className="font-semibold text-gray-900 mb-2">{option.name}</div>
                                     <div className="text-sm text-gray-600 mb-1">Quality: {option.quality}</div>
                                     <div className="text-xs text-gray-500">Durability: {option.durability}</div>
                                   </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                                         {currentStep === 5 && (
                       <div>
                         <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Appliances & Features</h3>
                        
                        <div className="mb-8">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Essential Appliances</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {appliances.filter(a => a.essential).map((appliance) => (
                              <button
                                key={appliance.id}
                                onClick={() => {
                                  const newAppliances = kitchenData.appliances.includes(appliance.id)
                                    ? kitchenData.appliances.filter(a => a !== appliance.id)
                                    : [...kitchenData.appliances, appliance.id];
                                  setKitchenData({...kitchenData, appliances: newAppliances});
                                }}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                  kitchenData.appliances.includes(appliance.id)
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="font-semibold text-gray-900 mb-2">{appliance.name}</div>
                                <div className="text-sm text-gray-600">{appliance.category}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-8">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Optional Appliances</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {appliances.filter(a => !a.essential).map((appliance) => (
                              <button
                                key={appliance.id}
                                onClick={() => {
                                  const newAppliances = kitchenData.appliances.includes(appliance.id)
                                    ? kitchenData.appliances.filter(a => a !== appliance.id)
                                    : [...kitchenData.appliances, appliance.id];
                                  setKitchenData({...kitchenData, appliances: newAppliances});
                                }}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                  kitchenData.appliances.includes(appliance.id)
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="font-semibold text-gray-900 mb-2">{appliance.name}</div>
                                <div className="text-sm text-gray-600">{appliance.category}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Features</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {features.map((feature) => (
                              <button
                                key={feature.id}
                                onClick={() => {
                                  const newFeatures = kitchenData.features.includes(feature.id)
                                    ? kitchenData.features.filter(f => f !== feature.id)
                                    : [...kitchenData.features, feature.id];
                                  setKitchenData({...kitchenData, features: newFeatures});
                                }}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                                  kitchenData.features.includes(feature.id)
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                                                 <div className="font-semibold text-gray-900 mb-2">{feature.name}</div>
                                 <div className="text-sm text-gray-600">{feature.category}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                                         {currentStep === 6 && (
                       <div>
                         <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                              <input
                                type="text"
                                value={kitchenData.contactInfo.name}
                                onChange={(e) => setKitchenData({
                                  ...kitchenData,
                                  contactInfo: {...kitchenData.contactInfo, name: e.target.value}
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter your name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                              <input
                                type="tel"
                                value={kitchenData.contactInfo.phone}
                                onChange={(e) => setKitchenData({
                                  ...kitchenData,
                                  contactInfo: {...kitchenData.contactInfo, phone: e.target.value}
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="+91 98765 43210"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                              <input
                                type="email"
                                value={kitchenData.contactInfo.email}
                                onChange={(e) => setKitchenData({
                                  ...kitchenData,
                                  contactInfo: {...kitchenData.contactInfo, email: e.target.value}
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="your@email.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                              <input
                                type="text"
                                value={kitchenData.contactInfo.city}
                                onChange={(e) => setKitchenData({
                                  ...kitchenData,
                                  contactInfo: {...kitchenData.contactInfo, city: e.target.value}
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Mumbai"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrev}
                      disabled={currentStep === 1}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                                         {currentStep < 6 ? (
                       <button
                         onClick={handleNext}
                         className="btn-primary px-6 py-3"
                       >
                         Next Step
                       </button>
                     ) : (
                       <div className="space-y-3">
                         <button
                           onClick={() => {
                             alert('Free design session booked! Our team will contact you within 24 hours to schedule your kitchen consultation.');
                           }}
                           className="w-full bg-yellow-400 hover:bg-yellow-500 text-primary-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                         >
                           BOOK FREE DESIGN SESSION
                         </button>
                         <button
                           onClick={() => {
                             alert('Kitchen quote request submitted! Our team will contact you within 24 hours.');
                           }}
                           className="w-full btn-primary px-6 py-3 flex items-center justify-center gap-2"
                         >
                           Get Detailed Quote
                           <CheckCircle className="w-4 h-4" />
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              </div>

                             {/* Project Summary Sidebar */}
               <div className="lg:col-span-1">
                 <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                   <h3 className="text-xl font-semibold text-gray-900 mb-6">Kitchen Design Summary</h3>
                   
                   {currentStep >= 1 && (
                     <div className="space-y-4 mb-6">
                       {(() => {
                         const summary = getKitchenSummary();
                         return (
                           <>
                             <div className="flex justify-between">
                               <span className="text-gray-600">Kitchen Area</span>
                               <span className="font-medium">{summary.area}</span>
                             </div>
                             
                             <div className="flex justify-between">
                               <span className="text-gray-600">Layout</span>
                               <span className="font-medium">{summary.layout}</span>
                             </div>
                             
                             <div className="flex justify-between">
                               <span className="text-gray-600">Project Purpose</span>
                               <span className="font-medium">{summary.purpose}</span>
                             </div>
                             
                             <div className="flex justify-between">
                               <span className="text-gray-600">Selected Appliances</span>
                               <span className="font-medium">{summary.appliances} items</span>
                             </div>
                             
                             <div className="flex justify-between">
                               <span className="text-gray-600">Additional Features</span>
                               <span className="font-medium">{summary.features} features</span>
                             </div>
                             
                             <div className="flex justify-between">
                               <span className="text-gray-600">Materials Selected</span>
                               <span className="font-medium">{summary.materials} categories</span>
                             </div>
                           </>
                         );
                       })()}
                     </div>
                   )}

                   <div className="border-t border-gray-200 pt-4 mb-6">
                     <div className="text-center">
                       <div className="text-lg font-bold text-gray-900 mb-2">Ready for Quote?</div>
                       <p className="text-sm text-gray-500">
                         Our design team will provide a detailed quote after consultation
                       </p>
                     </div>
                   </div>

                   <div className="space-y-3 mb-6">
                     <button className="w-full btn-primary py-3">
                       Get 3D Design
                     </button>
                     <button className="w-full btn-secondary py-3">
                       Schedule Site Visit
                     </button>
                   </div>

                   <div className="p-4 bg-primary-50 rounded-lg">
                     <div className="flex items-center gap-2 text-primary-700 font-medium mb-2">
                       <Star className="w-4 h-4" />
                       Free Design Consultation
                     </div>
                     <p className="text-sm text-primary-600">
                       Get a personalized 3D design and detailed quote from our expert designers.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
