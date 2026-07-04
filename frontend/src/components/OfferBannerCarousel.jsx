'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function BannerCard({ banner }) {
  const card = (
    <div className="overflow-hidden rounded-xl bg-gray-100 group cursor-pointer">
      <div className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56">
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt={banner.text || 'Offer banner'}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: banner.backgroundColor || '#dc2626' }}
          >
            {banner.text && (
              <p
                className="text-center text-sm sm:text-base font-bold px-4"
                style={{ color: banner.textColor || '#ffffff' }}
              >
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
  const [perPage, setPerPage] = useState(1)
  const touchStartX = useRef(0)

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      if (w < 640)  return 1   // mobile:  1 banner full width
      if (w < 1024) return 2   // tablet:  2 banners side by side
      return 3                  // desktop: 3 banners side by side
    }
    setPerPage(calc())
    const handler = () => setPerPage(calc())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { setCurrent(0) }, [perPage])

  const ep          = Math.min(banners.length, perPage)
  const needsSlider = banners.length > ep
  const maxStep     = Math.max(0, banners.length - ep)

  const prev = useCallback(() =>
    setCurrent(c => c <= 0 ? maxStep : c - 1), [maxStep])
  const next = useCallback(() =>
    setCurrent(c => c >= maxStep ? 0 : c + 1), [maxStep])

  useEffect(() => {
    if (!needsSlider) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [needsSlider, next])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  const trackW = (banners.length / ep) * 100
  const itemW  = 100 / banners.length
  const slideX = -(current / banners.length) * 100

  return (
    <section
      className="py-1.5 sm:py-2 bg-white w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="container-custom">
        {/* relative here so arrows are positioned against the container, not the images */}
        <div className="relative">

          {/* ── Sliding track — images fill the full container width ── */}
          <div className="overflow-hidden rounded-xl">
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
                  className="px-1"
                >
                  <BannerCard banner={banner} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Arrow buttons — float OVER the image edges, not outside them ── */}
          {needsSlider && (
            <>
              <button
                onClick={prev}
                aria-label="Previous offer banner"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 bg-white/90 rounded-full shadow-md border border-gray-200
                  flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                aria-label="Next offer banner"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 bg-white/90 rounded-full shadow-md border border-gray-200
                  flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* ── Dot indicators ────────────────────────────────── */}
        {needsSlider && (
          <div className="flex justify-center gap-1.5 mt-2 sm:mt-3">
            {Array.from({ length: maxStep + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-2 bg-primary-600'
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
