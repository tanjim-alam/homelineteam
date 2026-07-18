'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

const PER_PAGE = 12

const openModal = () => window.dispatchEvent(new CustomEvent('openLeadModal'))

function getPrice(product) {
  if (product.hasVariants && product.variants?.length > 0) {
    const prices = product.variants.map(v => v.price).filter(Boolean)
    return prices.length ? Math.min(...prices) : product.basePrice
  }
  return product.basePrice || 0
}

function ProductCard({ product, badgeFrom, badgeTo }) {
  const price = getPrice(product)
  const image = product.mainImages?.[0] || product.images?.[0]

  return (
    <div
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
      onClick={openModal}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">🏠</div>
        )}

        {/* Price badge — top-left */}
        <div
          className="absolute top-2 left-2 px-2 py-1 rounded-lg text-white text-[10px] sm:text-xs font-bold shadow-md"
          style={{ background: `linear-gradient(135deg, ${badgeFrom}, ${badgeTo})` }}
        >
          ₹{price.toLocaleString('en-IN')}
        </div>

        {/* Hover overlay with Book button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0
            flex items-center gap-1.5 bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-full shadow-lg">
            <ShoppingBag className="w-3.5 h-3.5" />
            Book Now
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-1 flex-1">
        <p className="text-gray-800 text-xs sm:text-sm font-semibold line-clamp-2 leading-snug">
          {product.name}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-auto">Tap to enquire</p>
      </div>
    </div>
  )
}

export default function ProductsGrid({ products, badgeFrom, badgeTo }) {
  const [page, setPage] = useState(1)

  if (!products?.length) return null

  const totalPages = Math.ceil(products.length / PER_PAGE)
  const start      = (page - 1) * PER_PAGE
  const visible    = products.slice(start, start + PER_PAGE)

  const goTo = useCallback((p) => {
    setPage(p)
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const prev = () => { if (page > 1) goTo(page - 1) }
  const next = () => { if (page < totalPages) goTo(page + 1) }

  const pageNums = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages))
    return [...set].sort((a, b) => a - b)
  })()

  return (
    <div id="products-section">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {visible.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            badgeFrom={badgeFrom}
            badgeTo={badgeTo}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-3">

          <p className="text-gray-400 text-xs">
            Showing {start + 1}–{Math.min(start + PER_PAGE, products.length)} of {products.length} products
          </p>

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">

            <button
              onClick={prev}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold
                text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <div className="flex items-center gap-1 mx-1">
              {pageNums.map((p, i) => {
                const prevP = pageNums[i - 1]
                const showEllipsis = prevP && p - prevP > 1
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && <span className="text-gray-300 text-xs px-0.5">…</span>}
                    <button
                      onClick={() => goTo(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        p === page
                          ? 'bg-[#1a3c6e] text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                )
              })}
            </div>

            <button
              onClick={next}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold
                text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
