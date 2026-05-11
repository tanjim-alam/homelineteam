'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export default function ProductNavbarClient({ categories }) {
  const [hovered, setHovered] = useState(null)

  if (!categories.length) return null

  return (
    <nav>
      <div className="hidden lg:flex items-center justify-center bg-primary">
        <div className="container-custom">
          <div className="flex items-center space-x-6 xl:space-x-8">
            {categories.map((cat) => {
              const key  = cat._id || cat.slug
              const subs = cat.subcategories || []
              return (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Link
                    href={`/collections/${cat.slug}`}
                    className="flex items-center gap-1 text-white font-medium py-1 px-3 whitespace-nowrap transition-colors"
                  >
                    {cat.name}
                    {subs.length > 0 && <ChevronDown className="w-4 h-4" />}
                  </Link>

                  {subs.length > 0 && hovered === key && (
                    <div className="absolute top-full left-0 w-56 bg-primary shadow-lg z-50">
                      {subs.map((sub) => (
                        <Link
                          key={sub._id || sub.slug}
                          href={`/collections/${sub.slug}`}
                          className="block px-4 py-2 text-sm font-medium text-white border-b border-white/10 hover:bg-white/10 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
