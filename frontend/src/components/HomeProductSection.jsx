import { Tag } from 'lucide-react'
import ProductsGrid from './ProductsGrid'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'

async function fetchProducts(slug, categoryId) {
  try {
    const url = categoryId
      ? `${BASE}/products?subcategoryId=${categoryId}&sort=newest&limit=200`
      : null

    if (url) {
      const res = await fetch(url, { next: { revalidate: 120 } })
      const data = res.ok ? await res.json() : []
      return Array.isArray(data) ? data : data?.products || data?.data || []
    }

    const hierRes = await fetch(`${BASE}/categories/hierarchical`, { next: { revalidate: 3600 } })
    const hier = hierRes.ok ? await hierRes.json() : []
    const arr = Array.isArray(hier) ? hier : hier?.data || []

    let catId = null
    for (const mc of arr) {
      const sub = (mc.subcategories || []).find(
        s => s.slug === slug || s.name?.toLowerCase().includes(slug.replace('-', ' '))
      )
      if (sub) { catId = sub._id; break }
    }

    const slugUrl = catId
      ? `${BASE}/products?subcategoryId=${catId}&sort=newest&limit=200`
      : `${BASE}/products?categorySlug=${slug}&sort=newest&limit=200`

    const res = await fetch(slugUrl, { next: { revalidate: 120 } })
    const data = res.ok ? await res.json() : []
    return Array.isArray(data) ? data : data?.products || data?.data || []
  } catch { return [] }
}

export default async function HomeProductSection({ slug, categoryId, title, viewAllHref, bgFrom, bgTo, badgeFrom, badgeTo }) {
  const products = await fetchProducts(slug, categoryId)
  if (!products.length) return null

  return (
    <section className="bg-gray-50 py-8 sm:py-10">
      <div className="container-custom">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{ background: `linear-gradient(180deg, ${bgFrom}, ${bgTo})` }}
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Our Collection</p>
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Tag className="w-3 h-3" />
            Best Prices
          </div>
        </div>

        <ProductsGrid
          products={products}
          badgeFrom={badgeFrom}
          badgeTo={badgeTo}
        />
      </div>
    </section>
  )
}
