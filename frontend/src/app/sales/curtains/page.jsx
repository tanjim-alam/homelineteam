import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle, Star, Truck, ShieldCheck, Clock, BadgeCheck, Users } from 'lucide-react'
import HomeProductSection from '@/components/HomeProductSection'
import CurtainsHero from '@/components/CurtainsHero'
import LandingBanners from './LandingBanners'
import LeadModal from './LeadModal'

const PHONE  = '+919611925494'
const WA_NUM = '919611925494'
const WA_MSG = encodeURIComponent(
  '🛍️ Hi! I saw your curtains ad on Google. I am interested in ordering curtains. Please share details and pricing.'
)

export const metadata = {
  title: 'Premium Curtains | HomelineTeam',
  description: 'Shop premium curtains online. Best prices. Free shipping across India.',
  robots: { index: false },
}

export default function CurtainsLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between py-3">

            {/* Logo — same size as main navbar */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.jpeg" alt="HomelineTeam" width={140} height={48} priority />
            </Link>

            {/* Centre tagline — desktop only */}
            <p className="hidden md:block text-sm text-gray-500 font-medium">
              Premium Curtains · Free Installation · Pan India Delivery
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">Chat</span>
              </a>
              <a
                href={`tel:${PHONE}`}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">{PHONE}</span>
                <span className="sm:hidden">Call</span>
              </a>
            </div>

          </div>
        </div>
      </header>

      {/* ── Hero with auto-slide ───────────────────────────────────────── */}
      <CurtainsHero />

      {/* ── Static service banners — landing page only ────────────────── */}
      <LandingBanners />

      {/* ── Trust badges ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-3 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            4.8★ Rated
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
            <Truck className="w-4 h-4 text-green-500" />
            Free Delivery
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            1-Year Warranty
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
            <MessageCircle className="w-4 h-4 text-green-500" />
            Expert Guidance
          </div>
        </div>
      </div>

      {/* ── Curtains products ─────────────────────────────────────────── */}
      <HomeProductSection
        categoryId="68aa0171e057a18ee9ae4ff5"
        title="Shop Curtains"
        viewAllHref="/collections/curtains"
        bgFrom="#1a3c6e"
        bgTo="#0d1f3b"
        badgeFrom="#1a3c6e"
        badgeTo="#0d1f3b"
      />

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container-custom">

          {/* Top label */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full border border-primary-100">
              <BadgeCheck className="w-3.5 h-3.5" />
              Trusted by 500+ Happy Customers
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              Get a Free Quote in<br />
              <span className="text-primary-600">Under 5 Minutes</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
              Our curtain experts are available 7 days a week. Share your window size and we'll suggest the best options within your budget.
            </p>
          </div>

          {/* Two CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">

            {/* WhatsApp card */}
            <a
              href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl px-6 py-7 shadow-lg shadow-green-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-200"
            >
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-lg leading-tight">Chat on WhatsApp</p>
                <p className="text-white/80 text-xs mt-1">Typically replies in 2 minutes</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Available Now
              </span>
            </a>

            {/* Call card */}
            <a
              href={`tel:${PHONE}`}
              className="group flex flex-col items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-6 py-7 shadow-lg shadow-primary-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-200"
            >
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-lg leading-tight">Call Us Directly</p>
                <p className="text-white/80 text-xs mt-1">{PHONE}</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" /> Mon–Sun 9am–8pm
              </span>
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 border-t border-gray-100 pt-8">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xl font-extrabold text-gray-900">4.8</span>
              </div>
              <span className="text-xs text-gray-500">Customer Rating</span>
            </div>
            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="text-xl font-extrabold text-gray-900">500+</span>
              </div>
              <span className="text-xs text-gray-500">Happy Customers</span>
            </div>
            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-green-500" />
                <span className="text-xl font-extrabold text-gray-900">Free</span>
              </div>
              <span className="text-xs text-gray-500">Delivery & Install</span>
            </div>
            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span className="text-xl font-extrabold text-gray-900">1 Yr</span>
              </div>
              <span className="text-xs text-gray-500">Warranty</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-[#0d1f3b] text-white">

        {/* Main footer body */}
        <div className="container-custom py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

            {/* Brand column */}
            <div className="flex flex-col gap-4">
              <Image src="/logo.jpeg" alt="HomelineTeam" width={130} height={44} className="brightness-0 invert opacity-90" />
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Premium curtains, blinds & wallpapers delivered and installed across India.
              </p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Us
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: 'Home',            href: '/' },
                  { label: 'All Products',    href: '/collections' },
                  { label: 'Interior Design', href: '/interior-design' },
                  { label: 'About Us',        href: '/about' },
                  { label: 'Contact',         href: '/contact' },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Contact Us</h4>
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">{PHONE}</p>
                    <p className="text-gray-500 text-xs">Mon–Sun · 9am – 8pm</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">WhatsApp Chat</p>
                    <p className="text-gray-500 text-xs">Typically replies in 2 min</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-primary-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">Pan India Delivery</p>
                    <p className="text-gray-500 text-xs">Free installation included</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} HomelineTeam. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms"          className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

      </footer>

      {/* Lead capture modal — triggered by any click on the page */}
      <LeadModal />

    </div>
  )
}
