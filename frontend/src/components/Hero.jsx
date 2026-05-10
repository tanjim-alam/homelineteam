'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroData } from '../hooks/useHeroData'

const LOCAL_FALLBACK = [
  { imageUrl: '/hero-bg-2.jpg', altText: 'Home Interior Design' },
  { imageUrl: '/hero-bg-3.jpg', altText: 'Premium Furniture Collection' },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const touchStartX           = useRef(0)
  const { heroData, isLoading } = useHeroData()

  // Collect active backend images — prefer desktop array, fall back to mobile
  const backendSlides = (() => {
    const desktop = (heroData.desktopBackgroundImages || []).filter(img => img?.isActive && img?.imageUrl)
    if (desktop.length > 0) return desktop
    return (heroData.mobileBackgroundImages || []).filter(img => img?.isActive && img?.imageUrl)
  })()

  // Use backend images when loaded; otherwise local fallback
  const slides = !isLoading && backendSlides.length > 0 ? backendSlides : LOCAL_FALLBACK

  const interval    = heroData.sliderSettings?.slideInterval || 4000
  const auto        = heroData.sliderSettings?.autoSlide !== false
  const totalSlides = slides.length

  const prev = useCallback(() =>
    setCurrent(c => (c - 1 + totalSlides) % totalSlides), [totalSlides])
  const next = useCallback(() =>
    setCurrent(c => (c + 1) % totalSlides), [totalSlides])

  // Reset to slide 0 when slide source changes (backend loaded)
  useEffect(() => { setCurrent(0) }, [backendSlides.length])

  useEffect(() => {
    if (!auto || totalSlides <= 1) return
    const id = setInterval(next, interval)
    return () => clearInterval(id)
  }, [auto, totalSlides, interval, next])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  /* ── Loading skeleton ──────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="w-full bg-gray-200 animate-pulse hidden md:block" style={{ paddingBottom: '28.57%' }} />
    )
  }

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <section
      className="relative w-full overflow-hidden bg-gray-900 select-none"
      aria-label="Promotional banner slider"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

      {/* ═══════════ DESKTOP (md+) — 21:6 wide banner ═════════════ */}
      <div className="hidden md:block relative w-full" style={{ paddingBottom: '28.57%' }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.altText || `Banner ${i + 1}`}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* ═══════════ MOBILE (<md) — 2:1 aspect ════════════════════ */}
      <div className="block md:hidden relative w-full" style={{ paddingBottom: '50%' }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.altText || `Banner ${i + 1}`}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* ═══════════ ARROW BUTTONS ══════════════════════════════════ */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20
              w-8 h-8 md:w-11 md:h-11 bg-white/85 hover:bg-white rounded-full
              flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
          </button>

          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20
              w-8 h-8 md:w-11 md:h-11 bg-white/85 hover:bg-white rounded-full
              flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* ═══════════ DOT INDICATORS ════════════════════════════════ */}
      {totalSlides > 1 && (
        <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-2 md:w-7 md:h-2.5 bg-white shadow-md'
                  : 'w-2 h-2 bg-white/55 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
