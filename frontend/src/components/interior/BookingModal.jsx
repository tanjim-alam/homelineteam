'use client';

import { useState } from 'react';
import { CheckCircle, X, ArrowRight, User, Phone, MapPin, FileText } from 'lucide-react';
import api from '@/services/api';

const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
  'Coimbatore', 'Kochi', 'Chandigarh', 'Visakhapatnam', 'Mysore',
];

const INITIAL = { name: '', phone: '', city: '', address: '' };

const inputCls = 'w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all';
const iconCls  = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none';

export default function BookingModal({ isOpen, onClose, product, sourcePage }) {
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
      await api.createLead({
        name:       form.name.trim(),
        phone:      form.phone.trim(),
        city:       form.city,
        sourcePage: sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        message:    `BOOKING — ${product?.name}${form.address ? `. Address: ${form.address}` : ''}`,
        meta: {
          productName: product?.name,
          address:     form.address.trim(),
          requestType: 'product-booking',
        },
        productDetails: {
          name:        product?.name,
          price:       product?.basePrice,
          image:       product?.mainImages?.[0] || '',
          category:    product?.category || '',
          description: product?.description || '',
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary-500 to-primary-600" />

        {/* Header */}
        <div className="px-5 pt-3 pb-2.5 flex items-start justify-between border-b border-gray-200">
          <div>
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-0.5">Quick Booking</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug pr-2">Book This Product</h2>
            {product?.name && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.name}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-3 space-y-3">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Our team will call you within 24 hours to confirm your order.
              </p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-700 text-white font-bold px-8 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-primary-600">*</span>
                </label>
                <div className="relative">
                  <User className={iconCls} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number <span className="text-primary-600">*</span>
                </label>
                <div className="relative">
                  <Phone className={iconCls} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="Your phone number"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className={iconCls} />
                  <select
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className={`${inputCls} appearance-none cursor-pointer`}
                  >
                    <option value="">Select your city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Address (optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Address <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                  <textarea
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="Your delivery address"
                    rows={1}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sky-600 text-sm font-medium bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !form.name.trim() || !form.phone.trim()}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {loading ? 'Booking…' : <>Book Now <ArrowRight className="w-4 h-4" /></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
