import Image from 'next/image'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'

const DEALS = [
  {
    slug: 'curtains',
    fallbackName: 'Premium Curtains',
    offer: 'Up to 40% Off',
    sub: 'Blackout · Sheer · Designer',
    bg: '#FFF0F6',
    gradFrom: '#9D174D',
    gradTo: '#F472B6',
  },
  {
    slug: 'blinds',
    fallbackName: 'Roller Blinds',
    offer: 'From ₹599',
    sub: 'Roller · Venetian · Zebra',
    bg: '#F5F3FF',
    gradFrom: '#4C1D95',
    gradTo: '#7C3AED',
  },
  {
    slug: 'wallpapers',
    fallbackName: 'Designer Wallpapers',
    offer: 'From ₹149',
    sub: '500+ Designs In Stock',
    bg: '#EFF6FF',
    gradFrom: '#1E3A8A',
    gradTo: '#3B82F6',
  },
]

async function fetchCategories() {
  try {
    const res = await fetch(`${BASE}/categories/hierarchical`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    const arr = Array.isArray(data) ? data : data?.data || []
    const subs = []
    arr.forEach(mc => (mc.subcategories || []).forEach(s => subs.push({ ...s, mainSlug: mc.slug })))
    return subs
  } catch { return [] }
}

export default async function DealCards() {
  const categories = await fetchCategories()

  const deals = DEALS.map(d => {
    const cat = categories.find(
      c => c.slug === d.slug || c.name?.toLowerCase().includes(d.slug.replace('-', ' '))
    )
    return {
      ...d,
      name: cat?.name || d.fallbackName,
      image: cat?.image || null,
      href: cat ? `/${cat.mainSlug || 'collections'}/${cat.slug}` : `/collections/${d.slug}`,
    }
  })

  return (
    <section className="bg-white pt-4 pb-2">
      <div className="container-custom">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Today's Top Deals</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {deals.map((deal) => (
            <Link
              key={deal.slug}
              href={deal.href}
              className="block rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              style={{ backgroundColor: deal.bg }}
            >
              {/* Image area */}
              <div className="relative h-28 sm:h-40 md:h-48 lg:h-56 flex items-center justify-center overflow-hidden">
                {deal.image ? (
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 400px"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <span className="text-5xl">🏠</span>
                  </div>
                )}
              </div>

              {/* Gradient footer */}
              <div
                className="px-2 sm:px-3 py-2 sm:py-3"
                style={{ background: `linear-gradient(135deg, ${deal.gradFrom}, ${deal.gradTo})` }}
              >
                <p className="text-white font-extrabold text-xs sm:text-sm md:text-base leading-tight">
                  {deal.offer}
                </p>
                <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 line-clamp-1">
                  {deal.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
