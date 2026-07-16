'use client'

import Image from 'next/image'

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
    <div className="group cursor-pointer" onClick={openModal}>
      <div className="bg-white overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
        <div className="relative w-full aspect-square bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🏠</div>
          )}
          <div
            className="absolute bottom-0 left-0 right-0 py-1.5 px-2 text-center"
            style={{ background: `linear-gradient(135deg, ${badgeFrom}, ${badgeTo})` }}
          >
            <p className="text-white font-bold text-[10px] sm:text-xs leading-tight">
              From ₹{price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] sm:text-xs text-white/90 text-center font-medium line-clamp-2 leading-tight px-0.5">
        {product.name}
      </p>
    </div>
  )
}

export default function ProductsGrid({ products, badgeFrom, badgeTo }) {
  if (!products?.length) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
      {products.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          badgeFrom={badgeFrom}
          badgeTo={badgeTo}
        />
      ))}
    </div>
  )
}
