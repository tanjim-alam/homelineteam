import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, ChefHat, Home, Package, Users,
  CheckCircle, Sparkles, Clock, Star, Shield,
  Phone, Headphones, Tag, MessageSquare, Ruler, Paintbrush,
} from 'lucide-react';
import InteriorDesignCalculator from '@/components/InteriorDesignCalculator';
import QuickQuoteEstimator from '@/components/QuickQuoteEstimator';

export const metadata = {
  title: 'Interior Design Services | HomelineTeam',
  description:
    'Transform your home with premium interior design — modular kitchens, wardrobes, 1 BHK & 2 BHK packages. Expert consultation included.',
  keywords: ['interior design', 'modular kitchen', 'wardrobe design', '1bhk package', '2bhk package', 'HomelineTeam'],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design' },
  openGraph: {
    title: 'Interior Design | HomelineTeam',
    description: 'Premium interior design — kitchens, wardrobes, and full-home packages.',
    url: 'https://www.homelineteam.com/interior-design',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interior Design Services | HomelineTeam',
    description: 'Premium interior design — kitchens, wardrobes, and full-home packages for every budget.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const services = [
  {
    num: '01', icon: ChefHat,
    title: 'Modular Kitchen', subtitle: 'Kitchen Design',
    description: 'Custom kitchen designs with smart storage, premium finishes, and layouts built for the way you cook — L-shaped, parallel, U-shaped, and more.',
    features: ['Custom Layouts', 'Premium Materials', 'Smart Storage', 'Professional Installation'],
    href: '/interior-design/kitchen', label: 'Explore Kitchens',
  },
  {
    num: '02', icon: Home,
    title: 'Wardrobe Solutions', subtitle: 'Wardrobe Design',
    description: 'Space-maximising wardrobe designs — sliding, hinged, and walk-in options with premium hardware. Built to fit your room and your lifestyle.',
    features: ['Space Optimisation', 'Premium Hardware', 'Custom Fittings', 'Multiple Finishes'],
    href: '/interior-design/wardrobes', label: 'View Wardrobes',
  },
  {
    num: '03', icon: Package,
    title: '1 BHK Package', subtitle: 'Complete Package',
    description: 'All-inclusive interior package for 1 BHK apartments — kitchen, wardrobe, TV unit, false ceiling and more. Budget-smart, delivered on time.',
    features: ['Complete Setup', 'Budget Friendly', 'Fast Delivery', 'Expert Consultation'],
    href: '/interior-design/1bhk-package', label: 'View 1 BHK Packages',
  },
  {
    num: '04', icon: Users,
    title: '2 BHK Package', subtitle: 'Full Home Package',
    description: 'Complete interior solution for 2 BHK homes — two bedrooms, modular kitchen, wardrobes, living room, and more. Premium quality throughout.',
    features: ['Full Home Design', 'Premium Quality', 'Expert Consultation', 'Warranty Included'],
    href: '/interior-design/2bhk-package', label: 'View 2 BHK Packages',
  },
];

const stats = [
  { num: '500+',  label: 'Projects Delivered' },
  { num: '4.9/5', label: 'Client Rating' },
  { num: '5 Yrs', label: 'Warranty' },
  { num: '30–45', label: 'Days Delivery' },
];

const whyUs = [
  { icon: Star,       title: 'Expert Designers',   desc: 'Seasoned pros with an eye for detail and function.' },
  { icon: Shield,     title: 'Premium Materials',   desc: 'Only the finest from certified, trusted suppliers.' },
  { icon: Clock,      title: 'On-Time Delivery',   desc: 'Projects completed on schedule, every time.' },
  { icon: Headphones, title: '24/7 Support',       desc: 'Dedicated support throughout the project.' },
  { icon: Paintbrush, title: '100% Custom',        desc: 'Every design tailored to your space and style.' },
  { icon: Tag,        title: 'Best Price Promise', desc: 'Transparent pricing — no hidden costs, ever.' },
];

const process = [
  { step: '01', icon: MessageSquare, title: 'Free Consultation', desc: 'Tell us your vision. Our designers listen and plan.' },
  { step: '02', icon: Ruler,         title: 'Design & Approval', desc: '3D design, material selection, and budget sign-off.' },
  { step: '03', icon: Paintbrush,    title: 'Expert Execution',  desc: 'Precision installation by our skilled craftsmen.' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
      ],
    },
    {
      '@type': 'HomeAndConstructionBusiness',
      name: 'HomelineTeam',
      url: 'https://www.homelineteam.com',
      telephone: '+919611925494',
      description: 'Premium interior design services — modular kitchens, wardrobes, and full-home packages.',
      areaServed: { '@type': 'Country', name: 'India' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Interior Design Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Modular Kitchen Design' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wardrobe Solutions' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '1 BHK Interior Package' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '2 BHK Interior Package' } },
        ],
      },
    },
  ],
};

export default function InteriorDesignPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero: asymmetric ── */}
      <div className="bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900">
        <div className="container-custom py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">

            {/* Left: 3 cols */}
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-1.5 bg-primary-600/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Premium Interior Design
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                Design your dream{' '}
                <span className="bg-gradient-to-r from-primary-400 to-rose-400 bg-clip-text text-transparent">
                  home interior
                </span>{' '}
                with us.
              </h1>

              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                From modular kitchens to complete home packages — premium quality,
                expert craftsmanship, delivered on time.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3.5 rounded-xl transition-colors"
                >
                  Get Free Consultation <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="tel:+919611925494"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </Link>
              </div>
            </div>

            {/* Right: service quick-nav tiles */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {services.map(({ icon: Icon, title, subtitle, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/40 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 bg-primary-600/20 group-hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <Icon className="w-4.5 h-4.5 text-primary-300 group-hover:text-white transition-colors" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">{subtitle}</p>
                    <p className="text-sm font-bold text-white leading-tight">{title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats band ── */}
      <div className="bg-primary-600">
        <div className="container-custom py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-primary-500">
            {stats.map(({ num, label }) => (
              <div key={label} className="text-center sm:px-6">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{num}</div>
                <div className="text-xs text-primary-200 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feature strip ── */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-custom py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {['Free Consultation', 'Premium Materials', 'On-Time Delivery', 'Expert Designers', '5-Year Warranty'].map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" /> {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Services — numbered editorial rows ── */}
      <div className="bg-white py-16 sm:py-20">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600">What we offer</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Our Services</h2>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">4 specialisations</span>
          </div>

          <div className="divide-y divide-gray-100">
            {services.map(({ num, icon: Icon, title, subtitle, description, features, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-6 sm:gap-10 py-8 sm:py-10 -mx-2 px-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Big faded number */}
                <span className="text-5xl sm:text-7xl font-extrabold text-gray-100 group-hover:text-primary-100 leading-none flex-shrink-0 select-none transition-colors pt-1 hidden sm:block">
                  {num}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary-50 group-hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors duration-300 flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary-500">{subtitle}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-xl">{description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {features.map((f) => (
                          <span key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow button */}
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 mt-1">
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it Works ── */}
      <div className="bg-gray-50 py-16 sm:py-20 border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">Our Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3">How It Works</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Simple, transparent, and stress-free from first call to final handover.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Connecting dashes (desktop) */}
            <div className="hidden md:flex absolute top-8 left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] items-center pointer-events-none">
              <div className="flex-1 border-t-2 border-dashed border-primary-200" />
              <div className="flex-1 border-t-2 border-dashed border-primary-200" />
            </div>

            {process.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative bg-white rounded-2xl border border-gray-100 p-7 flex flex-col items-center text-center shadow-sm">
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Choose Us — dark panel ── */}
      <div className="bg-gray-950 py-16 sm:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Left panel */}
            <div className="lg:col-span-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Why Us</span>
              <h2 className="text-3xl font-extrabold text-white mt-3 mb-4 leading-tight">
                Why thousands choose HomelineTeam
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                We combine creative design with precise execution — delivering beautiful spaces that are functional, durable, and within budget.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Talk to an Expert <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: 2x3 features */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyUs.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Calculator ── */}
      <div className="bg-white py-16 sm:py-20 border-t border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
            {/* Left: text */}
            <div className="lg:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600">Cost Estimator</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-4 leading-tight">
                Get an instant cost estimate
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Fill in a few details about your home and we'll give you an instant ballpark estimate. Takes under 2 minutes.
              </p>
              <ul className="space-y-2">
                {['No commitment required', 'Instant estimate, no waiting', 'Our expert will call within 24 hrs'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: calculator */}
            <div className="lg:col-span-3">
              <InteriorDesignCalculator />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Bnner ── */}
      <div className="bg-gradient-to-r from-primary-600 to-rose-700 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to transform your home?</h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Talk to our expert designers for a personalised plan — premium quality at a price that works for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 hover:bg-primary-50 font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Book Free Consultation <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="tel:+919611925494"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" /> +91 96119 25494
            </Link>
          </div>
        </div>
      </div>

      <QuickQuoteEstimator />
    </div>
  );
}
