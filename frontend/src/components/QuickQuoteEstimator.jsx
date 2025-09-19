'use client';

import { useState } from 'react';
import api from '@/services/api';
import { Calculator, Home, ArrowRight, CheckCircle } from 'lucide-react';
import { useSubmission } from '@/contexts/SubmissionContext';

export default function QuickQuoteEstimator({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isSubmitting, startSubmission, endSubmission } = useSubmission();
  const formId = 'quick-quote-estimator';
  const [formData, setFormData] = useState({
    homeType: '',
    contactInfo: {
      name: '',
      phone: ''
    }
  });

  const homeTypes = [
    { id: '1bhk', name: '1 BHK', description: 'Perfect for small families' },
    { id: '2bhk', name: '2 BHK', description: 'Ideal for growing families' },
    { id: '3bhk', name: '3 BHK', description: 'Spacious family homes' },
    { id: '4bhk', name: '4 BHK', description: 'Luxury family living' }
  ];

  const rooms = [
    { id: 'living', name: 'Living Room', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'bathroom', name: 'Bathroom', icon: '🚿' }
  ];

  const getProjectType = () => {
    const homeType = homeTypes.find(h => h.id === formData.homeType);
    return homeType ? `${homeType.name} Interior Design` : 'Interior Design Project';
  };

  const handleSubmit = () => {
    // Handle form submission
    alert('Quote request submitted! Our team will contact you within 24 hours.');
    setIsOpen(false);
    setFormData({
      homeType: '',
      rooms: [],
      purpose: '',
      timeline: '',
      contactInfo: { name: '', phone: '' }
    });
  };

  const handleBookSession = async () => {
    // Prevent multiple submissions
    const submissionId = startSubmission(formId);
    if (!submissionId) {
      return;
    }

    try {
      const payload = {
        name: formData.contactInfo?.name || '',
        phone: formData.contactInfo?.phone || '',
        city: formData.city || '',
        homeType: formData.homeType || '',
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        message: 'QuickQuoteEstimator design session request',
        meta: {
          ...formData,
          requestId: `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };
      const response = await api.createLead(payload);

      if (response.success) {
        alert('Design session request submitted! Our team will contact you shortly.');
        setIsOpen(false);
        setFormData({
          homeType: '',
          rooms: [],
          purpose: '',
          timeline: '',
          contactInfo: { name: '', phone: '' }
        });
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      alert(`Failed to submit request: ${err.message || 'Please try again.'}`);
    } finally {
      endSubmission(formId);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 lg:bottom-8 right-4 sm:right-6 lg:right-8 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group ${className}`}
        aria-label="Get Quick Quote"
      >
        <Calculator className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Quote</h3>
                    <p className="text-sm text-gray-600">Get instant estimate</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Home Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Home Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {homeTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, homeType: type.id })}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${formData.homeType === type.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="font-semibold text-gray-900 text-sm">{type.name}</div>
                        <div className="text-xs text-gray-600">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rooms to Design</label>
                  <div className="grid grid-cols-2 gap-3">
                    {rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => {
                          const newRooms = formData.rooms.includes(room.id)
                            ? formData.rooms.filter(r => r !== room.id)
                            : [...formData.rooms, room.id];
                          setFormData({ ...formData, rooms: newRooms });
                        }}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${formData.rooms.includes(room.id)
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="text-lg mb-1">{room.icon}</div>
                        <div className="text-xs font-medium text-gray-900">{room.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Project Purpose</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'new-home', name: 'New Home', description: 'Moving in' },
                      { id: 'renovation', name: 'Renovation', description: 'Updating space' },
                      { id: 'room-makeover', name: 'Room Makeover', description: 'Redesigning' },
                      { id: 'commercial', name: 'Commercial', description: 'Business space' }
                    ].map((purpose) => (
                      <button
                        key={purpose.id}
                        onClick={() => setFormData({ ...formData, purpose: purpose.id })}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${formData.purpose === purpose.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="text-sm font-medium text-gray-900">{purpose.name}</div>
                        <div className="text-xs text-gray-600">{purpose.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Project Timeline</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['ASAP', '1-2 months', '3-6 months', '6+ months'].map((timeline) => (
                      <button
                        key={timeline}
                        onClick={() => setFormData({ ...formData, timeline })}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${formData.timeline === timeline
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="text-sm font-medium text-gray-900">{timeline}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.contactInfo.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, name: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, phone: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Project Summary */}
                {formData.homeType && (
                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="text-center">
                      <div className="text-sm text-primary-600 font-medium mb-1">Project Type</div>
                      <div className="text-lg font-bold text-primary-700">{getProjectType()}</div>
                      <div className="text-xs text-primary-600 mt-1">Our team will provide a detailed quote after consultation</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 mt-6">
                {/*                 <button
                  onClick={handleBookSession}
                  disabled={!formData.homeType || !formData.contactInfo.name || !formData.contactInfo.phone || isSubmitting(formId)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-primary-900 font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  BOOK FREE DESIGN SESSION
                </button> */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookSession}
                    disabled={!formData.homeType || !formData.contactInfo.name || !formData.contactInfo.phone || isSubmitting(formId)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting(formId) ? 'Submitting...' : 'Get Quote'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
