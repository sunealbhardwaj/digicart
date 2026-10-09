import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByIdOrSlug } from '@/lib/products.server';
import { buildProductMetadata, buildProductJsonLd } from '@/lib/seo';
import ProductPageView from '@/components/ProductPageView';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamically generates SEO Title, Meta Description, OpenGraph, Twitter Card
 * and canonical tags for individual product pages
 */
export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return {
      title: 'Digital Asset Not Found | ApexDigital Marketplace',
      description:
        'The requested digital product could not be found. Browse thousands of high-converting creator bundles, templates, and software tools on ApexDigital.',
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  return buildProductMetadata(product, appUrl);
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  const jsonLd = buildProductJsonLd(product, appUrl);

  return (
    <>
      {/* Schema.org Product Rich Snippet for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageView initialProduct={product} />
    </>
  );
}
