import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

export default async function HomeProductSection({
  slug,
  categoryId,
  title,
  viewAllHref,
  bgFrom,
  bgTo,
  badgeFrom,
  badgeTo,
}) {
  const products = await fetchProducts(slug, categoryId)
  if (!products.length) return null

  const href = viewAllHref || `/collections/${slug}`

  return (
    <section
      className="py-5 sm:py-6"
      style={{ background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)` }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
          <Link
            href={href}
            className="flex items-center gap-1 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
