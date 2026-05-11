import Link from 'next/link';
import { ArrowRight, ChefHat, Home, Package, Users, Layers, CheckCircle } from 'lucide-react';

const services = [
  {
    icon: ChefHat,
    label: 'Kitchen',
    title: 'Modular Kitchen',
    description: 'Premium layouts & smart storage crafted for modern living.',
    features: ['Custom Design', 'Smart Storage', 'Premium Finish'],
    href: '/interior-design/kitchen',
    type: 'colored', // red gradient
  },
  {
    icon: Home,
    label: 'Wardrobe',
    title: 'Wardrobe Solutions',
    description: 'Space-maximising wardrobes that blend style with function.',
    features: ['Space Optimised', 'Custom Fittings', 'Modern Styles'],
    href: '/interior-design/wardrobes',
    type: 'plain',   // white + red border
  },
  {
    icon: Package,
    label: '1 BHK',
    title: '1 BHK Package',
    description: 'All-inclusive interior packages — beautiful and budget-smart.',
    features: ['Complete Setup', 'Budget Friendly', 'Fast Delivery'],
    href: '/interior-design/1bhk-package',
    type: 'colored', // red gradient
  },
  {
    icon: Users,
    label: '2 BHK',
    title: '2 BHK Package',
    description: 'Full home design with premium furniture & expert consultation.',
    features: ['Premium Quality', 'Full Home Design', 'Expert Consult'],
    href: '/interior-design/2bhk-package',
    type: 'plain',   // white + red border
  },
];

const stats = [
  { value: '500+', label: 'Projects Done'      },
  { value: '4.9★', label: 'Client Rating'      },
  { value: '45d',  label: 'Avg. Delivery'      },
  { value: '100%', label: 'Satisfaction'        },
];

/* ── Colored card (red gradient) ─────────────────────────────────────────── */
function ColoredCard({ s }) {
  const Icon = s.icon;
  return (
    <Link
      href={s.href}
      className="group relative bg-gradient-to-br from-red-500 via-red-600 to-rose-700 rounded-2xl overflow-hidden shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-rose-400/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23fff'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 p-5 sm:p-6 flex flex-col flex-1">
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-2 py-1 rounded-full">
            {s.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-white leading-snug mb-2">
          {s.title}
        </h3>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed flex-1 mb-5">
          {s.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {s.features.map(f => (
            <span key={f} className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle className="w-2.5 h-2.5" />
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <span className="text-white text-xs font-bold tracking-wide">Explore Service</span>
          <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
            <ArrowRight className="w-4 h-4 text-white group-hover:text-red-600 transition-colors group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Plain card (white + red border) ─────────────────────────────────────── */
function PlainCard({ s }) {
  const Icon = s.icon;
  return (
    <Link
      href={s.href}
      className="group relative bg-white border-2 border-red-500 hover:border-red-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-red-100 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
    >
      {/* Subtle red tint on hover fill */}
      <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-6 flex flex-col flex-1">
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors">
            <Icon className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
            {s.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-red-700 leading-snug mb-2 transition-colors">
          {s.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">
          {s.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {s.features.map(f => (
            <span key={f} className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle className="w-2.5 h-2.5" />
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-red-100">
          <span className="text-red-600 text-xs font-bold tracking-wide">Explore Service</span>
          <span className="w-8 h-8 bg-red-50 group-hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-300 border border-red-200 group-hover:border-red-600">
            <ArrowRight className="w-4 h-4 text-red-600 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
export default function InteriorDesignSection() {
  return (
    <section className="py-14 sm:pb-20 bg-white">
      <div className="container-custom">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            <Layers className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Transform Your Space with{' '}
            <span className="text-gradient">Expert Design</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
            From modular kitchens to complete home packages — professional design for every budget.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {services.map((s) =>
            s.type === 'colored'
              ? <ColoredCard key={s.title} s={s} />
              : <PlainCard   key={s.title} s={s} />
          )}
        </div>

        {/* Stats + CTA bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-primary rounded-2xl px-6 sm:px-8 py-5">
          <div className="flex items-center gap-6 sm:gap-10 flex-wrap justify-center">
            {stats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-gray-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/interior-design"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
