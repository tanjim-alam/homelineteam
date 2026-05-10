import { generateCategoryMetadata, generateCategoryStructuredData } from '@/utils/metadata';
import api from '@/services/api';
import CategoryPageClient from './CategoryPageClient-new';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const category = await api.getCategoryBySlug(slug);
    return generateCategoryMetadata(category);
  } catch {
    return { title: 'Category', description: 'Explore our collection' };
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  let category = null;
  let products = [];
  let filterOptions = null;
  let isMainCategory = false;
  let subcategories = [];

  try {
    // First, try to fetch from hierarchical categories (for main categories)
    try {
      const hierarchicalData = await api.getHierarchicalCategories();
      if (Array.isArray(hierarchicalData)) {
        const found = hierarchicalData.find(mc => mc.slug === slug);
        if (found && found.subcategories && found.subcategories.length > 0) {
          // This is a main category with subcategories
          isMainCategory = true;
          category = found;
          subcategories = found.subcategories;

          // Enrich subcategories with product counts
          subcategories = await Promise.all(
            subcategories.map(async (sub) => {
              try {
                const subProducts = await api.getCategoryProducts(sub.slug, { sort: 'newest' });
                const arr = Array.isArray(subProducts)
                  ? subProducts
                  : subProducts?.products || subProducts?.data || [];
                return { ...sub, productCount: arr.length };
              } catch {
                return { ...sub, productCount: 0 };
              }
            })
          );
        }
      }
    } catch (hierarchyErr) {
      // Fallback if hierarchical fetch fails
      console.log('Could not fetch hierarchical categories, trying regular category...');
    }

    // If not found as main category, fetch as regular category
    if (!isMainCategory) {
      category = await api.getCategoryBySlug(slug);

      // Check if this category has children/subcategories
      if (category?.subcategories?.length > 0 || category?.children?.length > 0) {
        isMainCategory = true;
        subcategories = category.subcategories || category.children || [];

        // Enrich subcategories with product counts
        subcategories = await Promise.all(
          subcategories.map(async (sub) => {
            try {
              const subProducts = await api.getCategoryProducts(sub.slug, { sort: 'newest' });
              const arr = Array.isArray(subProducts)
                ? subProducts
                : subProducts?.products || subProducts?.data || [];
              return { ...sub, productCount: arr.length };
            } catch {
              return { ...sub, productCount: 0 };
            }
          })
        );
      } else {
        // It's a regular subcategory - fetch products and filters
        [filterOptions] = await Promise.all([
          api.getCategoryFilterOptions(slug),
        ]);

        const productsData = await api.getCategoryProducts(slug, { sort: 'newest' });
        if (Array.isArray(productsData)) products = productsData;
        else if (productsData?.products) products = productsData.products;
        else if (productsData?.data) products = productsData.data;
      }
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    category = { name: 'Category', description: 'Explore our amazing collection' };
    filterOptions = {
      priceRange: { min: 0, max: 10000 },
      brands: [],
      ratings: [5, 4, 3, 2, 1],
      availability: ['In Stock', 'Out of Stock', 'Pre-order'],
      importantFilters: [],
    };
  }

  const structuredData = generateCategoryStructuredData(category);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/collections/${slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <link rel="canonical" href={canonicalUrl} />
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