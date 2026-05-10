import OfferBannerCarousel from './OfferBannerCarousel'

async function fetchActiveBanners() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com'
  try {
    const res = await fetch(`${base}/offer-banners/active`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data?.data || []
  } catch {
    return []
  }
}

export default async function OfferBannerSection() {
  const banners = await fetchActiveBanners()
  if (!banners.length) return null
  return <OfferBannerCarousel banners={banners} />
}
