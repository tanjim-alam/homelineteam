'use client';

import { useState } from 'react';
import { CheckCircle, X, ArrowRight, User, Phone, MapPin } from 'lucide-react';
import api from '@/services/api';

const HOME_TYPES = [
  { id: '1bhk', name: '1 BHK', description: 'Perfect for small families' },
  { id: '2bhk', name: '2 BHK', description: 'Ideal for growing families' },
  { id: '3bhk', name: '3 BHK', description: 'Spacious family homes' },
  { id: '4bhk', name: '4 BHK+', description: 'Luxury family living' },
];

const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Coimbatore', 'Kochi', 'Chandigarh', 'Visakhapatnam', 'Mysore',
];

const INITIAL = { homeType: '', name: '', phone: '', city: '' };

export default function InquiryModal({ isOpen, onClose, productName, sourcePage, title }) {
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSuccess(false); setForm(INITIAL); setError(''); }, 300);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const homeLabel = form.homeType ? `${form.homeType.toUpperCase()} — ` : '';
      await api.createLead({
        name:       form.name.trim(),
        phone:      form.phone.trim(),
        city:       form.city,
        homeType:   form.homeType,
        sourcePage: sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        message:    `${homeLabel}Interested in: ${productName}`,
        meta:       { productName, homeType: form.homeType, requestType: 'design-inquiry' },
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = title || 'Book Free Design Session';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600 flex-shrink-0" />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between flex-shrink-0 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-0.5">Design Consultation</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug pr-2">{modalTitle}</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3.5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">You're all set!</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Our design expert will call you within 24 hours to discuss your project.
              </p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-700 text-white font-bold px-8 py-2 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Home type */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select Home Size</p>
                <div className="grid grid-cols-4 gap-2">
                  {HOME_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set('homeType', t.id)}
                      className={`relative py-2.5 px-1 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                        form.homeType === t.id
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                      }`}
                    >
                      {form.homeType === t.id && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5.5L4 8l4.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                      <div className="text-sm font-black text-gray-900">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="Your phone number"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                  <select
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none transition-all cursor-pointer"
                  >
                    <option value="">Select your city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-primary-600 text-xs font-medium bg-primary-50 border border-primary-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !form.name.trim() || !form.phone.trim()}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-200 cursor-pointer"
              >
                {loading ? 'Sending…' : <>{modalTitle} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
