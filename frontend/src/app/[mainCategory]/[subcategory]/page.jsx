// app/[mainCategory]/[subcategory]/page.jsx
// ✅ SERVER COMPONENT — no "use client", fully crawlable by search engines

import { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/services/api";
import {
  generateCategoryMetadata,
  generateCategoryStructuredData,
} from "@/utils/metadata";
import CategoryContent from "./CategoryContentPage";

// ─── Dynamic metadata for each subcategory page ───────────────────────────────
export async function generateMetadata({ params }) {
  const { mainCategory, subcategory } = await params;
  try {
    const [categoryData, mainCategories] = await Promise.all([
      api.getCategoryBySlug(subcategory),
      api.getMainCategories(),
    ]);

    const mainCategoryData = Array.isArray(mainCategories)
      ? mainCategories.find((c) => c.slug === mainCategory)
      : mainCategories?.data?.find((c) => c.slug === mainCategory);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

    return {
      title:
        categoryData?.metaTitle ||
        `${categoryData?.name} | ${mainCategoryData?.name}`,
      description:
        categoryData?.metaDescription ||
        categoryData?.description ||
        `Explore our ${categoryData?.name} collection`,
      keywords:
        categoryData?.metaKeywords ||
        `${categoryData?.name}, ${mainCategoryData?.name}, home furnishings`,
      alternates: {
        canonical: `${siteUrl}/${mainCategory}/${subcategory}`,
      },
      openGraph: {
        title: categoryData?.metaTitle || categoryData?.name,
        description: categoryData?.metaDescription || categoryData?.description,
        url: `${siteUrl}/${mainCategory}/${subcategory}`,
        images: categoryData?.image
          ? [{ url: categoryData.image, alt: categoryData.name }]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: categoryData?.metaTitle || categoryData?.name,
        description: categoryData?.metaDescription || categoryData?.description,
        images: categoryData?.image ? [categoryData.image] : [],
      },
    };
  } catch {
    return {
      title: `${subcategory?.replace(/-/g, " ")} | Collections`,
      description: `Browse our ${subcategory?.replace(/-/g, " ")} collection`,
    };
  }
}

// ─── Page — Server Component ──────────────────────────────────────────────────
export default async function SubcategoryPage({ params }) {
  const { mainCategory, subcategory } = await params;

  let categoryData = null;
  let mainCategoryData = null;
  let products = [];
  let filterOptions = null;

  try {
    // All data fetching happens on the server — fast, SEO-friendly
    const [categoryRes, mainCategoriesRes, filterRes, productsRes] =
      await Promise.all([
        api.getCategoryBySlug(subcategory),
        api.getMainCategories(),
        api.getCategoryFilterOptions(subcategory),
        api.getSubcategoryProducts(subcategory, mainCategory, {
          sort: "newest",
        }),
      ]);

    categoryData = categoryRes;

    mainCategoryData = Array.isArray(mainCategoriesRes)
      ? mainCategoriesRes.find((c) => c.slug === mainCategory)
      : mainCategoriesRes?.data?.find((c) => c.slug === mainCategory);

    filterOptions = filterRes;

    // Normalise products response shape
    if (Array.isArray(productsRes)) products = productsRes;
    else if (productsRes?.products) products = productsRes.products;
    else if (productsRes?.data) products = productsRes.data;
  } catch (err) {
    // Graceful fallback — don't 404, show empty state
    categoryData = {
      name: subcategory?.replace(/-/g, " "),
      description: `Explore our ${subcategory?.replace(/-/g, " ")} collection`,
    };
    mainCategoryData = {
      name: mainCategory?.replace(/-/g, " "),
      slug: mainCategory,
    };
    filterOptions = {
      priceRange: { min: 0, max: 10000 },
      brands: [],
      ratings: [5, 4, 3, 2, 1],
      availability: ["In Stock", "Out of Stock", "Pre-order"],
      importantFilters: [],
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

  // ── Structured data (JSON-LD) injected into <head> server-side ─────────────
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryData?.name,
    description: categoryData?.description,
    url: `${siteUrl}/${mainCategory}/${subcategory}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Collections",
          item: `${siteUrl}/collections`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: mainCategoryData?.name,
          item: `${siteUrl}/collections/${mainCategory}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: categoryData?.name,
          item: `${siteUrl}/${mainCategory}/${subcategory}`,
        },
      ],
    },
    ...(categoryData?.image && {
      image: {
        "@type": "ImageObject",
        url: categoryData.image,
        name: categoryData.name,
      },
    }),
  };

  return (
    <>
      {/* ── JSON-LD structured data — injected by server, invisible to users ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/*
        ── SEO-critical static content rendered by the server ──────────────────
        Search engines see this HTML directly in the page source.
        No JavaScript required to render it.
      */}
      <div className="sr-only" aria-hidden="false">
        <h1>{categoryData?.name}</h1>
        <p>{categoryData?.description}</p>
        {/* Breadcrumb text for crawlers */}
        <nav aria-label="breadcrumb">
          <span>Home</span> &gt;
          <span>Collections</span> &gt;
          <span>{mainCategoryData?.name}</span> &gt;
          <span>{categoryData?.name}</span>
        </nav>
      </div>

      {/*
        ── Interactive client component receives server-fetched data as props ──
        Hydration happens client-side but the initial HTML is already meaningful.
      */}
      <CategoryContent
        initialCategory={categoryData}
        initialMainCategory={mainCategoryData}
        initialProducts={products}
        initialFilterOptions={filterOptions}
        mainCategorySlug={mainCategory}
        subcategorySlug={subcategory}
      />

      {/* ── SEO content block (rendered by server, fully crawlable) ── */}
      {categoryData?.seoContent && (
        <div className="bg-white border-t">
          <div className="container-custom py-8 lg:py-12">
            <div className="max-w-4xl mx-auto">
              <div
                className="seo-content prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: categoryData.seoContent }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
