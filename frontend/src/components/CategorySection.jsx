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

      {/* ══════════ MOBILE only (< sm / 640px) — horizontal scroll circles ══════════ */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 id="cat-heading-mobile" className="text-base font-extrabold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <Link href="/collections"
            className="text-xs font-bold text-primary-600 flex items-center gap-0.5">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-4 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={getHref(cat)}
              aria-label={`Shop ${cat.name}`}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-gray-100 border-2 border-primary-100 shadow-sm">
                <Image
                  src={cat.image || PLACEHOLDER}
                  alt={cat.name}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight w-[76px] line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════ TABLET + DESKTOP (sm / 640px+) — responsive grid ══════════ */}
      <div className="hidden sm:block py-8 md:py-12">
        <div className="container-custom">

          {/* Header */}
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <p className="text-xs font-bold text-gradient uppercase tracking-widest mb-1">Collections</p>
              <h2 id="cat-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                Shop by <span className="text-transparent bg-clip-text text-gradient">Category</span>
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 max-w-md hidden md:block">
                Curated collections to transform every room with style.
              </p>
            </div>
            <Link
              href="/collections"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors flex-shrink-0"
            >
              View All <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Responsive grid:
              sm  (640–767px)  → 3 columns
              md  (768–1023px) → 4 columns
              lg  (1024–1279px)→ 5 columns
              xl  (1280px+)    → 6 columns                    */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={getHref(cat)}
                aria-label={`Shop ${cat.name}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <Image
                    src={cat.image || PLACEHOLDER}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  {/* Name */}
                  <div className="absolute bottom-0 inset-x-0 px-1.5 sm:px-2 pb-2 sm:pb-2.5">
                    <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-snug line-clamp-2 drop-shadow-sm">
                      {cat.name}
                    </h3>
                  </div>
                  {/* Hover shine */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-xl sm:rounded-2xl" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>

    </section>
  )
}
