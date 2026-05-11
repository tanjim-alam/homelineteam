import { generateCategoryStructuredData } from '@/utils/metadata';
import CategoryPageClient from './CategoryPageClient-new';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

async function fetchCategoryBySlug(slug) {
  /* Try hierarchical first (covers main categories) */
  try {
    const res = await fetch(`${BASE}/categories/hierarchical`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const list = await res.json();
      const arr = Array.isArray(list) ? list : list?.categories || list?.data || [];
      const found = arr.find(mc => mc.slug === slug);
      if (found) return found;
      /* Check subcategories */
      for (const mc of arr) {
        const sub = (mc.subcategories || []).find(s => s.slug === slug);
        if (sub) return sub;
      }
    }
  } catch { /* fall through */ }
  /* Fallback: direct category endpoint */
  try {
    const res = await fetch(`${BASE}/categories/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category?.name) return { title: 'Collection | HomelineTeam', description: 'Explore our collection' };
  const cleanName = category.name.replace(/\p{Emoji}/gu, '').trim();
  return {
    title: category.metaData?.title || `${cleanName} | HomelineTeam`,
    description: category.metaData?.description || category.description || `Explore our ${cleanName} collection at HomelineTeam.`,
    openGraph: {
      title: cleanName,
      description: category.description || `${cleanName} collection`,
      images: category.image ? [{ url: category.image }] : [],
    },
    alternates: { canonical: `https://homelineteam.com/collections/${slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  let category      = null;
  let products      = [];
  let filterOptions = null;
  let isMainCategory = false;
  let subcategories = [];

  /* ── helper: raw fetch ─────────────────────────────────────────────── */
  const get = async (path, ttl = 60) => {
    try {
      const res = await fetch(`${BASE}${path}`, { next: { revalidate: ttl } });
      return res.ok ? res.json() : null;
    } catch { return null; }
  };

  try {
    /* 1️⃣ Try hierarchical to detect main category */
    const hier = await get('/categories/hierarchical', 3600);
    const hierArr = Array.isArray(hier) ? hier : hier?.categories || hier?.data || [];
    const mainCat = hierArr.find(mc => mc.slug === slug);

    if (mainCat && mainCat.subcategories?.length > 0) {
      isMainCategory = true;
      category       = mainCat;
      subcategories  = mainCat.subcategories;

    } else {
      /* 2️⃣ Not a main category — fetch as subcategory */
      /* Find it in the hierarchy to get its _id */
      let catId = null;
      for (const mc of hierArr) {
        const sub = (mc.subcategories || []).find(s => s.slug === slug);
        if (sub) { category = sub; catId = sub._id; break; }
      }

      /* Fallback: direct category endpoint */
      if (!category) {
        const direct = await get(`/categories/${slug}`, 300);
        if (direct) { category = direct; catId = direct._id; }
      }

      if (category?.subcategories?.length > 0 || category?.children?.length > 0) {
        /* Turned out to be a main-like category */
        isMainCategory = true;
        subcategories  = category.subcategories || category.children || [];
      } else {
        /* 3️⃣ Leaf category — fetch products + filters in parallel */
        const [productsData, filterData] = await Promise.all([
          catId ? get(`/products?subcategoryId=${catId}&sort=newest`, 60) : get(`/products?categorySlug=${slug}&sort=newest`, 60),
          get(`/categories/${slug}/filter-options`, 300),
        ]);

        const arr = Array.isArray(productsData) ? productsData
          : productsData?.products || productsData?.data || [];
        products = arr;

        filterOptions = filterData || null;
      }
    }
  } catch (err) {
    console.error('CategoryPage fetch error:', err);
  }

  const structuredData = generateCategoryStructuredData(category);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <CategoryPageClient
        slug={slug}
        initialCategory={category}
        initialProducts={products}
        initialFilterOptions={filterOptions}
        isMainCategory={isMainCategory}
        initialSubcategories={subcategories}
      />
    </>
  );
}