const SITE_URL = 'https://homelineteam.com';
const BASE_API  = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

async function safeFetch(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* ── Static pages ────────────────────────────────────────────────────────── */
const staticRoutes = [
  { url: '/',                   priority: 1.0,  changeFrequency: 'daily'   },
  { url: '/collections',        priority: 0.9,  changeFrequency: 'daily'   },
  { url: '/interior-design',    priority: 0.8,  changeFrequency: 'weekly'  },
  { url: '/about',              priority: 0.7,  changeFrequency: 'monthly' },
  { url: '/contact',            priority: 0.7,  changeFrequency: 'monthly' },
  { url: '/search',             priority: 0.5,  changeFrequency: 'weekly'  },
  { url: '/privacy-policy',     priority: 0.3,  changeFrequency: 'yearly'  },
];

export default async function sitemap() {
  const lastModified = new Date();

  /* ── 1. Static pages ─────────────────────────────────────────────────── */
  const staticEntries = staticRoutes.map(r => ({
    url: `${SITE_URL}${r.url}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  /* ── 2. Category pages ───────────────────────────────────────────────── */
  let categoryEntries = [];
  try {
    const hierData = await safeFetch(`${BASE_API}/categories/hierarchical`);
    const mainCats = Array.isArray(hierData)
      ? hierData
      : hierData?.categories || hierData?.data || [];

    mainCats.forEach(mc => {
      // Main category page
      if (mc.slug) {
        categoryEntries.push({
          url: `${SITE_URL}/collections/${mc.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.85,
        });
      }
      // Subcategory pages
      (mc.subcategories || []).forEach(sub => {
        if (sub.slug) {
          categoryEntries.push({
            url: `${SITE_URL}/collections/${sub.slug}`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    });
  } catch { /* skip if API unavailable */ }

  /* ── 3. Product pages ────────────────────────────────────────────────── */
  let productEntries = [];
  try {
    const productsData = await safeFetch(`${BASE_API}/products?limit=1000`);
    const products = Array.isArray(productsData)
      ? productsData
      : productsData?.products || productsData?.data || [];

    productEntries = products
      .filter(p => p.slug)
      .map(p => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : lastModified,
        changeFrequency: 'weekly',
        priority: 0.75,
      }));
  } catch { /* skip if API unavailable */ }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
