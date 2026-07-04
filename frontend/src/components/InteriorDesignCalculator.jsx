'use client';

import { useState, useMemo } from 'react';
import {
  Calculator, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Send, RotateCcw, IndianRupee,
} from 'lucide-react';
import api from '@/services/api';
import { useSubmission } from '@/contexts/SubmissionContext';

// ── Data ────────────────────────────────────────────────────────────────────

const HOME_TYPES = [
  { id: '1bhk', name: '1 BHK', description: 'Small & cozy',   basePrice: 150000, area: '400–650 sq ft' },
  { id: '2bhk', name: '2 BHK', description: 'Growing family', basePrice: 250000, area: '650–1000 sq ft' },
  { id: '3bhk', name: '3 BHK', description: 'Spacious home',  basePrice: 400000, area: '1000–1500 sq ft' },
  { id: '4bhk', name: '4 BHK+', description: 'Luxury living', basePrice: 600000, area: '1500+ sq ft' },
];

const ROOMS = [
  { id: 'living',   name: 'Living Room',  icon: '🛋️', multiplier: 1.0 },
  { id: 'bedroom',  name: 'Bedroom',      icon: '🛏️', multiplier: 0.8 },
  { id: 'kitchen',  name: 'Kitchen',      icon: '🍳', multiplier: 1.2 },
  { id: 'bathroom', name: 'Bathroom',     icon: '🚿', multiplier: 0.6 },
  { id: 'dining',   name: 'Dining Room',  icon: '🪑', multiplier: 0.7 },
  { id: 'study',    name: 'Study Room',   icon: '📚', multiplier: 0.5 },
];

const STYLES = [
  { id: 'minimalist',   name: 'Minimalist',   emoji: '⬜', desc: 'Clean & simple',    multiplier: 0.8  },
  { id: 'modern',       name: 'Modern',        emoji: '⬛', desc: 'Sleek & smart',     multiplier: 1.0  },
  { id: 'contemporary', name: 'Contemporary',  emoji: '🔷', desc: 'Trendy & refined',  multiplier: 1.1  },
  { id: 'traditional',  name: 'Traditional',   emoji: '🏛️', desc: 'Classic elegance',  multiplier: 0.9  },
  { id: 'luxury',       name: 'Luxury',        emoji: '👑', desc: 'Premium & opulent', multiplier: 1.5  },
];

const TIMELINES = [
  { id: 'urgent',   name: 'ASAP',          sub: 'Within 1 month',  multiplier: 1.2 },
  { id: 'normal',   name: '1–3 Months',    sub: 'Standard pace',   multiplier: 1.0 },
  { id: 'flexible', name: '3–6 Months',    sub: 'Flexible timing', multiplier: 0.9 },
];

const QUICK_AREAS = [450, 650, 900, 1200];

const INITIAL = {
  homeType: '', rooms: [], style: '', area: '', timeline: '',
  name: '', phone: '', city: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtFull(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function computeEstimate(data) {
  const ht = HOME_TYPES.find(h => h.id === data.homeType);
  if (!ht) return null;

  const roomMult = data.rooms.length > 0
    ? data.rooms.reduce((s, id) => s + (ROOMS.find(r => r.id === id)?.multiplier || 0), 0)
    : 1.0;

  const styleMult  = STYLES.find(s => s.id === data.style)?.multiplier    || 1.0;
  const timeMult   = TIMELINES.find(t => t.id === data.timeline)?.multiplier || 1.0;
  const areaMult   = data.area ? Math.max(0.5, Math.min(2.0, Number(data.area) / 1000)) : 1.0;

  const total = Math.round(ht.basePrice * roomMult * styleMult * timeMult * areaMult);
  return {
    total,
    breakdown: {
      design:  Math.round(total * 0.3),
      materials: Math.round(total * 0.4),
      labor:   Math.round(total * 0.2),
      misc:    Math.round(total * 0.1),
    },
  };
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = ['Home Type', 'Rooms', 'Style & Area', 'Contact'];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const num   = i + 1;
        const done  = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done  ? 'bg-green-500 border-green-500 text-white' :
                active ? 'bg-primary-600 border-primary-600 text-white' :
                         'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : num}
              </div>
              <span className={`text-[10px] font-semibold hidden sm:block ${active ? 'text-primary-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded transition-colors ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Live estimate chip ────────────────────────────────────────────────────────

function LiveEstimate({ estimate }) {
  if (!estimate) return null;
  return (
    <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 mb-6">
      <IndianRupee className="w-4 h-4 text-primary-500 flex-shrink-0" />
      <span className="text-xs text-primary-600 font-medium">Live estimate:</span>
      <span className="text-sm font-extrabold text-primary-700">{fmt(estimate.total)}</span>
      <span className="text-[10px] text-primary-400 ml-auto hidden sm:block">updates as you fill the form</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InteriorDesignCalculator() {
  const [data, setData]         = useState(INITIAL);
  const [step, setStep]         = useState(1);
  const [done, setDone]         = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const { isSubmitting, startSubmission, endSubmission } = useSubmission();
  const formId = 'interior-design-calculator';

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));
  const toggleRoom = id =>
    set('rooms', data.rooms.includes(id)
      ? data.rooms.filter(r => r !== id)
      : [...data.rooms, id]);

  const estimate = useMemo(() => computeEstimate(data), [data]);

  const canNext = {
    1: !!data.homeType,
    2: data.rooms.length > 0,
    3: !!data.style && !!data.timeline,
    4: data.name.trim() && data.phone.trim(),
  };

  const handleNext = () => {
    if (step < 4) { setStep(s => s + 1); return; }
    if (!estimate) return;
    setDone(true);
  };

  const handleSubmit = async () => {
    setError('');
    const sid = startSubmission(formId);
    if (!sid) return;
    try {
      await api.createLead({
        name:  data.name.trim(),
        phone: data.phone.trim(),
        city:  data.city.trim(),
        homeType: data.homeType,
        sourcePage: 'Interior Design Calculator',
        message: `Calculator estimate — ${data.homeType.toUpperCase()}, ${data.rooms.length} rooms, ${STYLES.find(s => s.id === data.style)?.name || ''} style`,
        meta: {
          calculatorData: {
            homeType: data.homeType,
            rooms: data.rooms,
            area: data.area,
            style: data.style,
            timeline: data.timeline,
            estimatedCost: estimate?.total,
          },
          requestId: `calc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      endSubmission(formId);
    }
  };

  const reset = () => {
    setData(INITIAL); setStep(1); setDone(false); setSuccess(false); setError('');
  };

  // ── Results view ────────────────────────────────────────────────────────────
  if (done && estimate) {
    const { total, breakdown } = estimate;
    const bars = [
      { label: 'Design & Planning', value: breakdown.design,    pct: 30, color: 'bg-blue-500' },
      { label: 'Materials',         value: breakdown.materials, pct: 40, color: 'bg-primary-500'  },
      { label: 'Labour',            value: breakdown.labor,     pct: 20, color: 'bg-amber-500' },
      { label: 'Miscellaneous',     value: breakdown.misc,      pct: 10, color: 'bg-gray-400' },
    ];

    if (success) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Quote Request Sent!</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Our design expert will call you within 24 hours to discuss your project and provide a detailed quote.
          </p>
          <button onClick={reset} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <RotateCcw className="w-4 h-4" /> Calculate Again
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Result header */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 p-8 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Estimated Project Cost</p>
          <div className="text-5xl font-extrabold text-white mb-1">{fmtFull(total)}</div>
          <p className="text-gray-400 text-sm">Final cost may vary based on material choices & site conditions</p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Cost breakdown bars */}
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Cost Breakdown</h4>
          <div className="space-y-3 mb-8">
            {bars.map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">{label}</span>
                  <span className="text-xs font-bold text-gray-800">{fmtFull(value)} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Project summary pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              HOME_TYPES.find(h => h.id === data.homeType)?.name,
              `${data.rooms.length} room${data.rooms.length !== 1 ? 's' : ''}`,
              STYLES.find(s => s.id === data.style)?.name,
              TIMELINES.find(t => t.id === data.timeline)?.name,
              data.area ? `${data.area} sq ft` : null,
            ].filter(Boolean).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>

          {/* Contact to get detailed quote */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-6">
            <p className="text-sm font-bold text-gray-800 mb-1">Want a precise quote?</p>
            <p className="text-xs text-gray-500 mb-4">Enter your details and our designer will prepare a detailed plan and exact pricing for you.</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={data.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Full Name *"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="tel"
                value={data.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="Phone *"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <input
              type="text"
              value={data.city}
              onChange={e => set('city', e.target.value)}
              placeholder="City (e.g. Bangalore)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
            />

            {error && (
              <p className="text-primary-600 text-xs font-medium bg-primary-100 px-3 py-2 rounded-xl mb-3">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!data.name.trim() || !data.phone.trim() || isSubmitting(formId)}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
            >
              {isSubmitting(formId)
                ? 'Sending…'
                : <><Send className="w-4 h-4" /> Get Detailed Quote — Free</>
              }
            </button>
          </div>

          <button onClick={reset} className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm">
            <RotateCcw className="w-4 h-4" /> Calculate Again
          </button>
        </div>
      </div>
    );
  }

  // ── Multi-step form ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight">Cost Estimator</h3>
          <p className="text-xs text-gray-500">Get an instant estimate — takes under 2 minutes</p>
        </div>
      </div>

      <StepBar current={step} />
      <LiveEstimate estimate={estimate} />

      {/* ── Step 1: Home Type ── */}
      {step === 1 && (
        <div>
          <h4 className="text-base font-bold text-gray-800 mb-4">What type of home are you designing?</h4>
          <div className="grid grid-cols-2 gap-3">
            {HOME_TYPES.map(ht => (
              <button
                key={ht.id}
                onClick={() => set('homeType', ht.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  data.homeType === ht.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-lg font-extrabold text-gray-900 mb-0.5">{ht.name}</div>
                <div className="text-xs text-gray-500 mb-2">{ht.description}</div>
                <div className="text-xs font-bold text-gray-500">{ht.area}</div>
                <div className="text-xs font-bold text-primary-600 mt-1">Starting {fmt(ht.basePrice)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Rooms ── */}
      {step === 2 && (
        <div>
          <h4 className="text-base font-bold text-gray-800 mb-1">Which rooms do you want to design?</h4>
          <p className="text-xs text-gray-400 mb-4">Select all that apply</p>
          <div className="grid grid-cols-3 gap-3">
            {ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => toggleRoom(room.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  data.rooms.includes(room.id)
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-2xl mb-1">{room.icon}</div>
                <div className="text-xs font-semibold text-gray-800 leading-tight">{room.name}</div>
              </button>
            ))}
          </div>
          {data.rooms.length > 0 && (
            <p className="text-xs text-primary-600 font-medium mt-3">
              {data.rooms.length} room{data.rooms.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Style & Area ── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Style */}
          <div>
            <h4 className="text-base font-bold text-gray-800 mb-3">Preferred interior style</h4>
            <div className="grid grid-cols-5 gap-2">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => set('style', s.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    data.style === s.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="text-lg mb-1">{s.emoji}</div>
                  <div className="text-[10px] font-bold text-gray-800 leading-tight">{s.name}</div>
                  <div className="text-[9px] text-gray-400 leading-tight hidden sm:block">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Total carpet area (sq ft) <span className="font-normal text-gray-400">— optional</span></label>
            <div className="flex gap-2 mb-2">
              {QUICK_AREAS.map(a => (
                <button
                  key={a}
                  onClick={() => set('area', String(a))}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border-2 transition-colors ${
                    data.area === String(a)
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={data.area}
              onChange={e => set('area', e.target.value)}
              placeholder="Or type custom area…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">When do you need it done?</h4>
            <div className="grid grid-cols-3 gap-3">
              {TIMELINES.map(t => (
                <button
                  key={t.id}
                  onClick={() => set('timeline', t.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    data.timeline === t.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-gray-900 mb-0.5">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.sub}</div>
                  {t.id === 'urgent' && <div className="text-[10px] text-amber-600 font-bold mt-0.5">+20% rush fee</div>}
                  {t.id === 'flexible' && <div className="text-[10px] text-green-600 font-bold mt-0.5">10% off</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Contact ── */}
      {step === 4 && (
        <div>
          <h4 className="text-base font-bold text-gray-800 mb-1">Almost there! Get your estimate.</h4>
          <p className="text-xs text-gray-400 mb-5">We'll prepare a detailed plan and call you within 24 hours.</p>

          {estimate && (
            <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-xl px-5 py-4 mb-5 text-center">
              <p className="text-gray-400 text-xs mb-1">Your estimated cost</p>
              <p className="text-3xl font-extrabold text-white">{fmtFull(estimate.total)}</p>
              <p className="text-gray-400 text-xs mt-1">This is an approximate estimate</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={data.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Full Name *"
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="tel"
                value={data.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="Phone Number *"
                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <input
              type="text"
              value={data.city}
              onChange={e => set('city', e.target.value)}
              placeholder="City (e.g. Bangalore, Mumbai)"
              className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canNext[step]}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          {step === 4
            ? <><Sparkles className="w-4 h-4" /> See My Estimate</>
            : <>Next <ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </div>
  );
}
