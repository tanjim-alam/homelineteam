import OfferBannerCarousel from './OfferBannerCarousel'

async function fetchActiveBanners(position) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'
  try {
    const url = position
      ? `${base}/offer-banners/active?position=${encodeURIComponent(position)}`
      : `${base}/offer-banners/active`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data?.data || []
  } catch {
    return []
  }
}

// `position` matches the OfferBanner model's position enum: 'below-hero' | 'below-categories' | 'below-products'.
// Banners set to 'all' on the backend are included in every position automatically.
export default async function OfferBannerSection({ position = 'below-hero' }) {
  const banners = await fetchActiveBanners(position)
  if (!banners.length) return null
  return <OfferBannerCarousel banners={banners} />
}
