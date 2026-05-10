import { generateProductMetadata, generateProductStructuredData } from '@/utils/metadata';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';
  try {
    const res = await fetch(`${base}/products/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('not found');
    const product = await res.json();
    const meta = generateProductMetadata(product);
    const structured = generateProductStructuredData(product);
    return {
      title: meta.title,
      description: meta.description,
      keywords: Array.isArray(meta.keywords) ? meta.keywords.join(', ') : meta.keywords,
      openGraph: {
        title: meta.ogTitle,
        description: meta.ogDescription,
        images: meta.ogImage ? [{ url: meta.ogImage, alt: meta.ogTitle }] : [],
        type: 'website',
        siteName: 'HomelineTeam',
      },
      twitter: {
        card: 'summary_large_image',
        title: meta.ogTitle,
        description: meta.ogDescription,
        images: meta.ogImage ? [meta.ogImage] : [],
      },
      alternates: {
        canonical: `/products/${slug}`,
      },
      other: structured ? {
        'script:ld+json': JSON.stringify(structured),
      } : {},
    };
  } catch {
    return {
      title: 'Product — HomelineTeam',
      description: 'Premium home furnishings at HomelineTeam.',
    };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
