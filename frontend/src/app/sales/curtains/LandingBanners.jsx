'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── ADD YOUR BANNER IMAGES HERE ──────────────────────────────────────────────
// src: local path from /public (e.g. '/banner1.jpg') or a full URL
// alt: image description
// link: click destination — leave '' for no link
const BANNERS = [
  { src: '/hero-bg-1.jpg', alt: 'Curtains Installation', link: '' },
  { src: '/hero-bg-2.jpg', alt: 'Blinds Installation',   link: '' },
  { src: '/hero-bg-3.jpg', alt: 'Wallpaper Installation', link: '' },
]
// ─────────────────────────────────────────────────────────────────────────────

const openModal = () => window.dispatchEvent(new CustomEvent('openLeadModal'))

function BannerCard({ banner, compact = false }) {
  return (
    <div
      className="cursor-pointer"
      onClick={openModal}
    >
      <div
        className={`relative w-full overflow-hidden bg-gray-100 ${
          compact
            ? 'rounded-lg aspect-square'
            : 'rounded-xl h-44 sm:h-52 lg:h-56'
        }`}
      >
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          className="object-cover hover:scale-[1.03] transition-transform duration-500"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
    </div>
  )
}

export default function LandingBanners() {
  const [current, setCurrent] = useState(0)
  const [perPage, setPerPage] = useState(3)
  const touchStartX = useRef(0)

  useEffect(() => {
    const calc = () => (window.innerWidth < 1024 ? 2 : 3)
    setPerPage(calc())
    const handler = () => setPerPage(calc())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { setCurrent(0) }, [perPage])

  const ep          = Math.min(BANNERS.length, perPage)
  const needsSlider = BANNERS.length > ep
  const maxStep     = Math.max(0, BANNERS.length - ep)

  const prev = useCallback(() => setCurrent(c => c <= 0 ? maxStep : c - 1), [maxStep])
  const next = useCallback(() => setCurrent(c => c >= maxStep ? 0 : c + 1), [maxStep])

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

  const trackW = (BANNERS.length / ep) * 100
  const itemW  = 100 / BANNERS.length
  const slideX = -(current / BANNERS.length) * 100

  return (
    <section className="py-2 sm:py-3 bg-white">

      {/* ── MOBILE (<sm): all 3 banners in a compact row, no slider ── */}
      <div className="sm:hidden px-3">
        <div className="grid grid-cols-3 gap-2">
          {BANNERS.map((banner, i) => (
            <BannerCard key={i} banner={banner} compact />
          ))}
        </div>
      </div>

      {/* ── TABLET + DESKTOP (sm+): carousel ─────────────────────── */}
      <div
        className="hidden sm:block container-custom"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ width: `${trackW}%`, transform: `translateX(${slideX}%)` }}
            >
              {BANNERS.map((banner, i) => (
                <div key={i} style={{ width: `${itemW}%` }} className="px-1">
                  <BannerCard banner={banner} />
                </div>
              ))}
            </div>
          </div>

          {needsSlider && (
            <>
              <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 bg-white/90 rounded-full shadow-md border border-gray-200
                  flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 bg-white/90 rounded-full shadow-md border border-gray-200
                  flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {needsSlider && (
          <div className="flex justify-center gap-1.5 mt-2 sm:mt-3">
            {Array.from({ length: maxStep + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-2 bg-primary-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  )
}
