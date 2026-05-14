'use client';

import { useState } from 'react';
import api from '@/services/api';
import { Calculator, Home, CheckCircle, X, Send } from 'lucide-react';
import { useSubmission } from '@/contexts/SubmissionContext';

const INITIAL_FORM = {
  homeType: '',
  rooms: [],
  purpose: '',
  timeline: '',
  city: '',
  contactInfo: { name: '', phone: '' },
};

const homeTypes = [
  { id: '1bhk', name: '1 BHK', description: 'Small families' },
  { id: '2bhk', name: '2 BHK', description: 'Growing families' },
  { id: '3bhk', name: '3 BHK', description: 'Spacious homes' },
  { id: '4bhk', name: '4 BHK+', description: 'Luxury living' },
];

const rooms = [
  { id: 'living',   name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom',  name: 'Bedroom',     icon: '🛏️' },
  { id: 'kitchen',  name: 'Kitchen',     icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom',    icon: '🚿' },
  { id: 'dining',   name: 'Dining',      icon: '🪑' },
  { id: 'balcony',  name: 'Balcony',     icon: '🌿' },
];

const purposes = [
  { id: 'new-home',      name: 'New Home',      description: 'Moving in' },
  { id: 'renovation',    name: 'Renovation',    description: 'Updating space' },
  { id: 'room-makeover', name: 'Room Makeover', description: 'Redesigning' },
  { id: 'commercial',    name: 'Commercial',    description: 'Business space' },
];

const timelines = ['ASAP', '1–2 months', '3–6 months', '6+ months'];

export default function QuickQuoteEstimator({ className = '' }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [formData, setFormData]   = useState(INITIAL_FORM);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const { isSubmitting, startSubmission, endSubmission } = useSubmission();
  const formId = 'quick-quote-estimator';

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const setContact = (key, value) =>
    setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, [key]: value } }));
  const toggleRoom = (id) =>
    set('rooms', formData.rooms.includes(id)
      ? formData.rooms.filter(r => r !== id)
      : [...formData.rooms, id]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => { setFormData(INITIAL_FORM); setError(''); setSuccess(false); }, 300);
  };

  const handleSubmit = async () => {
    if (!formData.contactInfo.name.trim() || !formData.contactInfo.phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }
    if (!formData.homeType) {
      setError('Please select your home type.');
      return;
    }
    setError('');

    const submissionId = startSubmission(formId);
    if (!submissionId) return;

    try {
      const payload = {
        name:       formData.contactInfo.name.trim(),
        phone:      formData.contactInfo.phone.trim(),
        city:       formData.city.trim(),
        homeType:   formData.homeType,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
        message:    `Quick Quote — ${formData.homeType.toUpperCase()}${formData.rooms.length ? ', Rooms: ' + formData.rooms.join(', ') : ''}${formData.purpose ? ', Purpose: ' + formData.purpose : ''}${formData.timeline ? ', Timeline: ' + formData.timeline : ''}`,
        meta: {
          rooms:     formData.rooms,
          purpose:   formData.purpose,
          timeline:  formData.timeline,
          requestId: `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      };
      await api.createLead(payload);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      endSubmission(formId);
    }
  };

  const submitting = isSubmitting(formId);
  const canSubmit  = formData.homeType && formData.contactInfo.name.trim() && formData.contactInfo.phone.trim();

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 lg:bottom-8 right-4 sm:right-6 lg:right-8 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group ${className}`}
        aria-label="Get Quick Quote"
      >
        <Calculator className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Backdrop + modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-5 flex-shrink-0 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-base leading-tight">Get a Free Quote</h3>
                  <p className="text-white/70 text-xs mt-0.5">We'll call you within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">

              {success ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-extrabold text-gray-900 mb-2">Quote Request Sent!</h4>
                  <p className="text-gray-500 text-sm mb-6">
                    Our design expert will call you within 24 hours to discuss your project.
                  </p>
                  <button
                    onClick={handleClose}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-2.5 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Home Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Home Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {homeTypes.map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => set('homeType', type.id)}
                          className={`p-2.5 rounded-xl border-2 text-center transition-all duration-200 ${
                            formData.homeType === type.id
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-red-300 text-gray-700'
                          }`}
                        >
                          <div className="font-bold text-sm">{type.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rooms */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Rooms to Design
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {rooms.map(room => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => toggleRoom(room.id)}
                          className={`p-2.5 rounded-xl border-2 text-center transition-all duration-200 ${
                            formData.rooms.includes(room.id)
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className="text-xl mb-0.5">{room.icon}</div>
                          <div className="text-[11px] font-semibold text-gray-800">{room.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Project Purpose
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {purposes.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => set('purpose', p.id)}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all duration-200 ${
                            formData.purpose === p.id
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                          <div className="text-[11px] text-gray-500">{p.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Project Timeline
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timelines.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set('timeline', t)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold text-center transition-all duration-200 ${
                            formData.timeline === t
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-red-300 text-gray-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Your Details <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.contactInfo.name}
                        onChange={e => setContact('name', e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={e => setContact('phone', e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="City (e.g. Bangalore, Mumbai)"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Summary pill */}
                  {formData.homeType && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
                      <p className="text-[11px] text-red-400 font-medium uppercase tracking-wider mb-0.5">Your Project</p>
                      <p className="text-red-700 font-bold text-sm">
                        {homeTypes.find(h => h.id === formData.homeType)?.name} Interior Design
                        {formData.rooms.length > 0 && ` · ${formData.rooms.length} room${formData.rooms.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <p className="text-red-600 text-xs font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer actions */}
            {!success && (
              <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-colors"
                >
                  {submitting
                    ? 'Submitting…'
                    : <><Send className="w-3.5 h-3.5" /> Get Free Quote</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
