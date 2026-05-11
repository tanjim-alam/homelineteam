import { Shield, Truck, Clock, Star, Award, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Every product is crafted with the finest materials and passes rigorous quality checks before reaching your home.',
    accent: 'bg-red-500',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on all orders above ₹999 across India. Fast, safe and reliable logistics you can count on.',
    accent: 'bg-orange-500',
  },
  {
    icon: Star,
    title: 'Customer First',
    description: '24/7 support, easy returns, and a dedicated team ready to help you make the right choices for your home.',
    accent: 'bg-yellow-500',
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Get your products delivered within 3–5 business days. We value your time as much as you do.',
    accent: 'bg-emerald-500',
  },
];

const stats = [
  { value: '50K+', label: 'Happy Customers', color: 'text-red-400'     },
  { value: '10K+', label: 'Products Sold',   color: 'text-orange-400'  },
  { value: '4.8★', label: 'Avg. Rating',     color: 'text-yellow-400'  },
  { value: '24/7', label: 'Support',          color: 'text-emerald-400' },
];

const trust = [
  'ISI Certified Materials',
  'Easy 30-Day Returns',
  'Cash on Delivery',
  'Secure Payments',
  'Pan-India Delivery',
  'Expert Design Help',
];

export default function WhyChooseUs() {
  return (
    <section
      className="relative overflow-hidden py-10 sm:py-14"
      style={{ background: 'linear-gradient(135deg, #070d1a 0%, #0f172a 50%, #0c0f1e 100%)' }}
      aria-labelledby="why-choose-heading"
    >
      {/* ── Ambient glow blobs ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-red-900/10 rounded-full blur-[80px] pointer-events-none" />

      {/* ── Grid overlay ───────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container-custom">

        {/* ── Top label ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-7 sm:mb-8">
          <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 backdrop-blur-sm text-white/60 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-red-400" />
            Why Choose Us
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {/* ── Main 2-col layout ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 mb-7">

          {/* Left — heading + feature list ─────────────────────────────── */}
          <div>
            <h2 id="why-choose-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
              The{' '}
              <span className="bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                HomelineTeam
              </span>
              {' '}Difference
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mb-6 leading-relaxed">
              We don't just sell home furnishings — we help you build a home you'll love every single day.
            </p>

            {/* Feature list */}
            <div className="divide-y divide-white/[0.07]">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group flex items-start gap-4 py-3.5 first:pt-0 hover:pl-1 transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-8 h-8 ${f.accent} bg-opacity-15 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-25 transition-all`}>
                      <Icon className="w-4 h-4 text-white opacity-90" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-bold text-sm group-hover:text-red-300 transition-colors">
                          {f.title}
                        </h3>
                        <span className="text-[10px] font-bold text-white/20 tabular-nums">
                          0{i + 1}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
                    </div>

                    {/* Animated chevron */}
                    <div className="mt-1 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                      <ArrowRight className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — big stats ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Stats 2x2 */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between transition-colors duration-300 overflow-hidden group"
                >
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
                  <p className={`text-3xl font-black ${s.color} leading-none mb-1.5 tracking-tight`}>
                    {s.value}
                  </p>
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA card */}
            <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-rose-400/30 rounded-full blur-2xl pointer-events-none" />
              <p className="text-white font-bold text-sm mb-0.5 relative z-10">Ready to transform?</p>
              <p className="text-white/70 text-xs mb-3 relative z-10">Book a free consultation today.</p>
              <Link
                href="/contact"
                className="relative z-10 inline-flex items-center gap-1.5 bg-white text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Trust strip ─────────────────────────────────────────────────── */}
        <div className="border-t border-white/[0.07] pt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
          {trust.map((item) => (
            <span key={item} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-red-500/70 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
