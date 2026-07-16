'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Phone, Mail, User, CheckCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'

export default function LeadModal() {
  const [open, setOpen]           = useState(false)
  const [form, setForm]           = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors]       = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    const handler = () => {
      setOpen(true)
      setSubmitted(false)
      setServerError('')
      setForm({ name: '', phone: '', email: '' })
      setErrors({})
    }
    window.addEventListener('openLeadModal', handler)
    return () => window.removeEventListener('openLeadModal', handler)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, close])

  const validate = () => {
    const e = {}
    if (!form.name.trim())                        e.name  = 'Please enter your name'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setServerError('')

    try {
      const res = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       form.name.trim(),
          phone:      form.phone.trim(),
          sourcePage: 'Curtains Landing Page',
          message:    form.email ? `Email: ${form.email.trim()}` : '',
          meta: { requestType: 'landing-page-curtains' },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#0d1f3b] px-6 py-5">
          <button
            onClick={close}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Free Consultation</p>
          <h2 className="text-white text-xl font-extrabold leading-tight">
            Book a Free Quote<br />in 2 Minutes
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/30 transition
                      ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={e => { setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') })); setErrors(er => ({ ...er, phone: '' })) }}
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/30 transition
                      ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/30 transition"
                  />
                </div>
              </div>

              {serverError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{serverError}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1a3c6e] hover:bg-[#0d1f3b]
                  text-white font-bold py-3.5 rounded-xl shadow-md transition-all
                  disabled:opacity-70 disabled:cursor-not-allowed mt-1 text-sm tracking-wide"
              >
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Book Free Consultation'
                }
              </button>

              <p className="text-center text-gray-400 text-[11px]">
                Our team will call you within 30 minutes.
              </p>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-gray-900 font-extrabold text-lg mb-1">Booking Confirmed!</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Thank you, <span className="font-semibold text-gray-700">{form.name}</span>!
                  We've received your request and will call you at <span className="font-semibold text-gray-700">+91 {form.phone}</span> within 30 minutes.
                </p>
              </div>
              <a
                href={`tel:+91${form.phone}`}
                className="flex items-center gap-2 bg-[#0d1f3b] text-white font-bold px-6 py-3 rounded-xl text-sm transition hover:bg-[#1a3c6e]"
              >
                <Phone className="w-4 h-4" />
                Call Us Now
              </a>
              <button onClick={close} className="text-gray-400 text-xs hover:text-gray-600 underline">
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
