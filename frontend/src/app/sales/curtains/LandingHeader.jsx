'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, MessageCircle, Scissors } from 'lucide-react'

const PHONE  = '+919611925494'
const WA_NUM = '919611925494'
const WA_MSG = encodeURIComponent(
  '🛍️ Hi! I saw your curtains ad on Google. I am interested in ordering curtains. Please share details and pricing.'
)

const openModal = () => window.dispatchEvent(new CustomEvent('openLeadModal'))

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-white border-b border-gray-100 shadow-sm'
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-[#0d1f3b] text-white text-[11px] sm:text-xs font-medium text-center py-1.5 px-4 tracking-wide">
        <span className="text-blue-300 font-bold">FREE</span> measurement &amp; installation on all orders &nbsp;·&nbsp;
        <span className="text-blue-300 font-bold">500+</span> happy customers across India
      </div>

      {/* Main nav row */}
      <div className="container-custom">
        <div className="flex items-center justify-between py-2.5 gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.jpeg" alt="HomelineTeam" width={130} height={44} priority />
          </Link>

          {/* Centre — desktop trust pills */}
          <div className="hidden lg:flex items-center gap-3">
            {[
              { dot: 'bg-green-400', text: 'Free Installation' },
              { dot: 'bg-blue-400',  text: 'Pan India Delivery' },
              { dot: 'bg-yellow-400',text: '4.8★ Rated' },
              { dot: 'bg-purple-400',text: '1-Year Warranty' },
            ].map(({ dot, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {text}
              </span>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">

            {/* Book button — opens modal */}
            <button
              onClick={openModal}
              className="hidden sm:flex items-center gap-1.5
                bg-[#1a3c6e] hover:bg-[#0d1f3b] text-white
                text-xs font-bold px-4 py-2.5 rounded-xl
                shadow-sm transition-all hover:-translate-y-px cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5" />
              Book Free Quote
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600
                text-white text-xs font-bold px-3 sm:px-4 py-2.5 rounded-xl
                shadow-sm transition-all hover:-translate-y-px"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Chat</span>
            </a>

            {/* Call — icon only on mobile, full on desktop */}
            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-1.5 border-2 border-[#1a3c6e] text-[#1a3c6e]
                hover:bg-[#1a3c6e] hover:text-white
                text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl
                transition-all hover:-translate-y-px"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline">{PHONE}</span>
              <span className="md:hidden hidden sm:inline">Call</span>
            </a>

          </div>
        </div>
      </div>
    </header>
  )
}
