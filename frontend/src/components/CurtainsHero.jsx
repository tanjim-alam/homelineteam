'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const openModal = () => window.dispatchEvent(new CustomEvent('openLeadModal'))

// ── ADD YOUR HERO BANNER IMAGES HERE ─────────────────────────────────────────
const SLIDES = [
  { src: '/curtains-hero1.jpeg', alt: 'Curtains Collection 1' },
  { src: '/curtains-hero2.jpeg', alt: 'Curtains Collection 2' },
  { src: '/curtains-hero3.jpeg', alt: 'Curtains Collection 3' },
]
// ─────────────────────────────────────────────────────────────────────────────

export default function CurtainsHero() {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const total = SLIDES.length

  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])
  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])

  useEffect(() => {
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [next])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Hero banner"
    >
      {/* Desktop — same 7:2 ratio as main site hero */}
      <div className="hidden md:block relative w-full bg-gray-100 cursor-pointer" style={{ paddingBottom: '28.57%' }} onClick={openModal}>
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image src={slide.src} alt={slide.alt} fill className="object-cover" priority={i === 0} sizes="100vw" />
          </div>
        ))}
      </div>

      {/* Mobile — same 2:1 ratio as main site hero */}
      <div className="block md:hidden relative w-full bg-gray-100 cursor-pointer" style={{ paddingBottom: '50%' }} onClick={openModal}>
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image src={slide.src} alt={slide.alt} fill className="object-cover object-top" priority={i === 0} sizes="100vw" />
          </div>
        ))}
      </div>

      {/* Arrow buttons */}
      <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20
          w-8 h-8 md:w-11 md:h-11 bg-white/85 hover:bg-white rounded-full
          flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer">
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
      </button>
      <button onClick={e => { e.stopPropagation(); next() }} aria-label="Next"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20
          w-8 h-8 md:w-11 md:h-11 bg-white/85 hover:bg-white rounded-full
          flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer">
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? 'w-5 h-2 md:w-7 md:h-2.5 bg-white shadow-md' : 'w-2 h-2 bg-white/55 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
