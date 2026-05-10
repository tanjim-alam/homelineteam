'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function BannerCard({ banner }) {
  const card = (
    <div className="rounded-2xl overflow-hidden shadow-sm bg-gray-100 group cursor-pointer">
      <div className="relative w-full" style={{ paddingBottom: '55%' }}>
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt={banner.text || 'Offer banner'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: banner.backgroundColor || '#dc2626' }}
          >
            {banner.text && (
              <p className="text-center text-sm font-bold px-3" style={{ color: banner.textColor || '#ffffff' }}>
                {banner.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return banner.link
    ? <Link href={banner.link} className="block">{card}</Link>
    : <div>{card}</div>
}

export default function OfferBannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0)
  const [perPage, setPerPage] = useState(3)
  const touchStartX = useRef(0)

  // Detect viewport width → set how many banners to show at once
  useEffect(() => {
    const calc = () =>
      window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3
    setPerPage(calc())
    const handler = () => setPerPage(calc())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Reset position when perPage changes (viewport resize)
  useEffect(() => { setCurrent(0) }, [perPage])

  // Effective perPage: never more than total banners
  const ep = Math.min(banners.length, perPage)
  const needsSlider = banners.length > ep
  const maxStep = Math.max(0, banners.length - ep)

  const prev = useCallback(() =>
    setCurrent(c => c <= 0 ? maxStep : c - 1), [maxStep])
  const next = useCallback(() =>
    setCurrent(c => c >= maxStep ? 0 : c + 1), [maxStep])

  // Auto-slide every 4 seconds when slider is active
  useEffect(() => {
    if (!needsSlider) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [needsSlider, next])

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  // Transform math:
  //  - Track width  = (banners.length / ep) × 100% of container
  //  - Item width   = (100 / banners.length)% of track  →  = (100 / ep)% of container ✓
  //  - TranslateX   = −(current / banners.length) × 100% of track
  const trackW  = (banners.length / ep) * 100
  const itemW   = 100 / banners.length
  const slideX  = -(current / banners.length) * 100

  return (
    <section
      className="py-3 md:py-5 bg-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-10 xl:px-16">
        <div className="relative">

          {/* ── Sliding track ─────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                width: `${trackW}%`,
                transform: `translateX(${slideX}%)`,
              }}
            >
              {banners.map((banner, i) => (
                <div
                  key={banner._id || i}
                  style={{ width: `${itemW}%` }}
                  className="px-1 md:px-1.5"
                >
                  <BannerCard banner={banner} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Arrow buttons ─────────────────────────────────── */}
          {needsSlider && (
            <>
              <button
                onClick={prev}
                aria-label="Previous offer banner"
                className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 bg-white rounded-full shadow-md border border-gray-200
                  flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                aria-label="Next offer banner"
                className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 bg-white rounded-full shadow-md border border-gray-200
                  flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* ── Dot indicators ────────────────────────────────── */}
        {needsSlider && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: maxStep + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-2 bg-red-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
