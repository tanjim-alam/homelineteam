'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

// ── ADD YOUR REVIEW VIDEOS HERE — paste the Google Drive file ID ────────────
// (from a share link like https://drive.google.com/file/d/FILE_ID/view)
const REVIEWS = [
  { id: '1om-5arlYbl71uVoP3uxLBlG9G-Yl3ibu', name: 'Verified Customer' },
  { id: '1raUthBQQUsKAfUkgE8ZxoUoUm9EBidYB', name: 'Verified Customer' },
  { id: '1KIOgWzV0ZCHUfun8FmBcCKjkIl-wxIFZ', name: 'Verified Customer' },
  { id: '1QhkZA6ywIEpWXCK-J7TjkkZifG6s6oMe', name: 'Verified Customer' },
  { id: '1SIoXHQtzejcRbSeN1VrOO0WZOjWU7HCT', name: 'Verified Customer' },
  { id: '19O6mL8Kl1NI31WuWiZE4IMSLN_MFLyy3', name: 'Verified Customer' },
  { id: '1aRSFmFKSm4-Bx_5PvttwMAeA-qCDIVkk', name: 'Verified Customer' },
  { id: '13iBc8OYwHt4D2a3isp_xDZaOGvq2z-mP', name: 'Verified Customer' },
  { id: '1Xtw2-sEANLWOLXJmR2LrLWQSZNdyaaKT', name: 'Verified Customer' },
]
// ─────────────────────────────────────────────────────────────────────────────

function ReviewCard({ review }) {
  return (
    <div className="relative w-full aspect-[4/5] bg-black shadow-sm hover:shadow-xl transition-shadow duration-300">
      <iframe
        src={`https://drive.google.com/file/d/${review.id}/preview`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
        loading="lazy"
        title={`${review.name} review video`}
      />
    </div>
  )
}

export default function CustomerReviews() {
  const [current, setCurrent] = useState(0)
  const [perPage, setPerPage] = useState(2)
  const touchStartX = useRef(0)

  useEffect(() => {
    const calc = () => {
      if (window.innerWidth >= 1024) return 4
      if (window.innerWidth >= 640) return 3
      return 2
    }
    setPerPage(calc())
    const handler = () => setPerPage(calc())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { setCurrent(0) }, [perPage])

  const total    = REVIEWS.length
  const ep       = Math.min(total, perPage)
  const maxStep  = Math.max(0, total - ep)

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent(c => Math.min(maxStep, c + 1)), [maxStep])

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  const itemW  = 100 / ep
  const slideX = -(current * itemW)

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="container-custom">

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full border border-primary-100 mb-3">
            <Star className="w-3.5 h-3.5 fill-primary-700" />
            Real Customers, Real Homes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Hear It From Our Customers
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mt-2">
            Watch what our customers have to say about their flooring experience with HomelineTeam.
          </p>
        </div>

        <div
          className="relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${slideX}%)` }}
            >
              {REVIEWS.map((review) => (
                <div key={review.id} style={{ width: `${itemW}%` }} className="px-1.5 sm:px-2 flex-shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {current > 0 && (
            <button
              onClick={prev}
              aria-label="Previous reviews"
              className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-10
                w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full shadow-lg border border-gray-200
                flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {current < maxStep && (
            <button
              onClick={next}
              aria-label="Next reviews"
              className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-10
                w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full shadow-lg border border-gray-200
                flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {maxStep > 0 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: maxStep + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
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
