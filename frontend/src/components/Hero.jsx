'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHeroData } from '../hooks/useHeroData'

const LOCAL_FALLBACK = [
  { imageUrl: '/hero-bg-2.jpg', altText: 'Home Interior Design' },
  { imageUrl: '/hero-bg-3.jpg', altText: 'Premium Furniture Collection' },
]

const DESKTOP_RATIO = '28.57%'
const MOBILE_RATIO  = '50%'

function SlideImage({ slide, priority, objectPosition = 'object-center' }) {
  const img = (
    <Image
      src={slide.imageUrl}
      alt={slide.altText || 'Banner'}
      fill
      className={`object-cover ${objectPosition}`}
      priority={priority}
      sizes="100vw"
    />
  )
  return slide.link
    ? <Link href={slide.link} className="absolute inset-0">{img}</Link>
    : img
}

export default function Hero() {
  const [current, setCurrent]       = useState(0)
  const [prevSlides, setPrevSlides] = useState(null)
  const touchStartX                 = useRef(0)
  const { heroData, isLoading }     = useHeroData()

  // Collect active backend slides — prefer desktop array, fall back to mobile
  const backendSlides = (() => {
    const desktop = (heroData.desktopBackgroundImages || []).filter(s => s?.isActive && s?.imageUrl)
    if (desktop.length > 0) return desktop
    return (heroData.mobileBackgroundImages || []).filter(s => s?.isActive && s?.imageUrl)
  })()

  // Show LOCAL_FALLBACK immediately while API is loading so there's never a blank frame.
  // Switch to backend slides once they arrive.
  const slides =
    !isLoading && backendSlides.length > 0 ? backendSlides : LOCAL_FALLBACK

  const interval    = heroData.sliderSettings?.slideInterval || 4000
  const auto        = heroData.sliderSettings?.autoSlide !== false
  const totalSlides = slides.length

  const prev = useCallback(() => setCurrent(c => (c - 1 + totalSlides) % totalSlides), [totalSlides])
  const next = useCallback(() => setCurrent(c => (c + 1) % totalSlides), [totalSlides])

  // When backend slides arrive and differ from what we had, reset to slide 0
  useEffect(() => {
    const key = backendSlides.map(s => s.imageUrl).join(',')
    if (key !== prevSlides) {
      setCurrent(0)
      setPrevSlides(key)
    }
  }, [backendSlides, prevSlides])

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

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      aria-label="Promotional banner slider"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ══ DESKTOP (md+) — matches 1600×600 exactly ══════════════ */}
      <div className="hidden md:block relative w-full bg-gray-100" style={{ paddingBottom: DESKTOP_RATIO }}>

        {/* Shimmer overlay while API is still loading */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}

        {slides.map((slide, i) => (
          <div
            key={slide.imageUrl}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <SlideImage slide={slide} priority={i === 0} />
          </div>
        ))}
      </div>

      {/* ══ MOBILE (<md) — 2:1, crop from top to keep focal point ═ */}
      <div className="block md:hidden relative w-full bg-gray-100" style={{ paddingBottom: MOBILE_RATIO }}>

        {isLoading && (
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}

        {slides.map((slide, i) => (
          <div
            key={slide.imageUrl}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <SlideImage slide={slide} priority={i === 0} objectPosition="object-top" />
          </div>
        ))}
      </div>

      {/* ══ ARROW BUTTONS ══════════════════════════════════════════ */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20
              w-8 h-8 md:w-11 md:h-11 bg-white/85 hover:bg-white rounded-full
              flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20
              w-8 h-8 md:w-11 md:h-11 bg-white/85 hover:bg-white rounded-full
              flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* ══ DOT INDICATORS ═════════════════════════════════════════ */}
      {totalSlides > 1 && (
        <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
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
