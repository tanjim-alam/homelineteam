// Server Component — no 'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

async function fetchCategories() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'
  try {
    const res = await fetch(`${base}/categories/hierarchical`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()

    let raw = []
    if (Array.isArray(data))       raw = data
    else if (data?.categories)     raw = data.categories
    else if (data?.data)           raw = data.data

    const flat = []
    raw.forEach(main => {
      ;(main.subcategories || []).forEach(sub => {
        flat.push({ ...sub, mainCategory: { _id: main._id, name: main.name, slug: main.slug } })
      })
    })
    return flat.length > 0 ? flat : raw
  } catch {
    return []
  }
}

const getHref = (cat) =>
  cat.mainCategory ? `/${cat.mainCategory.slug}/${cat.slug}` : `/collections/${cat.slug}`

const PLACEHOLDER = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=...'

export default async function CategorySection() {
  const categories = await fetchCategories()
  if (categories.length === 0) return null

  return (
    <section aria-labelledby="cat-heading" className="bg-white">

      {/* ══════════ MOBILE (< md) — app-style circles ══════════════ */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 id="cat-heading" className="text-base font-extrabold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <Link href="/collections"
            className="text-xs font-bold text-blue-600 flex items-center gap-0.5">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={getHref(cat)}
              aria-label={`Shop ${cat.name}`}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              {/* Circle image */}
              <div className="w-[68px] h-[68px] rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 shadow-sm">
                <Image
                  src={cat.image || PLACEHOLDER}
                  alt={cat.name}
                  width={68}
                  height={68}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Name */}
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight w-[72px] line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════ DESKTOP (md+) — grid cards ═════════════════════ */}
      <div className="hidden md:block py-12 px-6 lg:px-10 xl:px-16">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Collections</p>
              <h2 id="cat-heading" className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Category</span>
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                Curated collections to transform every room with style.
              </p>
            </div>
            <Link
              href="/collections"
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors flex-shrink-0"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid — 4 cols lg, 5 cols xl, scroll fallback on md */}
          <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={getHref(cat)}
                aria-label={`Shop ${cat.name}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <Image
                    src={cat.image || PLACEHOLDER}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {/* Name */}
                  <div className="absolute bottom-0 inset-x-0 px-2 pb-2.5">
                    <h3 className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm">
                      {cat.name}
                    </h3>
                  </div>
                  {/* Hover shine */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-2xl" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>

    </section>
  )
}
