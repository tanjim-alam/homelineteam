import CollectionsClient from './CollectionsClient';

/* ─── Server-side data fetch ─────────────────────────────────────────────── */
async function fetchMainCategories() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';
  try {
    const res = await fetch(`${base}/categories/hierarchical`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.categories)) return data.categories;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

/* ─── Next.js App Router metadata ───────────────────────────────────────── */
export const metadata = {
  title: 'All Collections | HomelineTeam – Premium Home Furnishings',
  description:
    'Browse our complete range of premium home furnishings — curtains, blinds, wallpapers, cushions, rugs and more. Shop by category.',
  keywords: [
    'home furnishings', 'curtains', 'blinds', 'wallpaper', 'cushions',
    'collections', 'homelineteam',
  ],
  openGraph: {
    title: 'All Collections | HomelineTeam',
    description: 'Browse our complete range of premium home furnishings.',
    url: 'https://homelineteam.com/collections',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  alternates: {
    canonical: 'https://homelineteam.com/collections',
  },
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default async function CollectionsPage() {
  const mainCategories = await fetchMainCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Collections – HomelineTeam',
    url: 'https://homelineteam.com/collections',
    description: 'Browse our complete range of premium home furnishings.',
    hasPart: mainCategories.flatMap((mc) =>
      (mc.subcategories || []).map((sub) => ({
        '@type': 'CollectionPage',
        name: sub.name,
        url: `https://homelineteam.com/collections/${sub.slug}`,
        image: sub.image || undefined,
      }))
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CollectionsClient mainCategories={mainCategories} />
    </>
  );
}
