import { Metadata } from 'next';
import { Product } from './types';

export const SITE_NAME = 'ApexDigital';
export const DEFAULT_TITLE = 'ApexDigital - Digital Assets & Creator Mega Marketplace';
export const DEFAULT_DESCRIPTION =
  'High-converting digital products marketplace for creator bundles, templates, graphic assets, software tools, and marketing resources with instant cloud delivery.';

/**
 * Formats a clean, high-ranking SEO meta title (30-60 characters where possible)
 */
export function buildProductTitle(product: Product): string {
  const brandSuffix = ` | ${SITE_NAME}`;
  const maxTitleLength = 60;

  if (product.name.length + brandSuffix.length <= maxTitleLength) {
    return `${product.name}${brandSuffix}`;
  }

  // If name is already around 50-60 chars
  if (product.name.length <= 60) {
    return product.name;
  }

  // Truncate at word boundary
  const truncated = product.name.slice(0, 57 - brandSuffix.length).trim();
  return `${truncated}...${brandSuffix}`;
}

/**
 * Formats a compelling, high-CTR meta description (120-160 characters)
 */
export function buildProductDescription(product: Product): string {
  const categoryStr = product.category ? ` in ${product.category}` : '';
  const featuresStr =
    product.features && product.features.length > 0
      ? ` Includes ${product.features[0]}.`
      : '';
  const cta = ' Instant cloud delivery with commercial license.';

  let candidate = `Download ${product.name}${categoryStr}.${featuresStr}${cta}`;

  if (candidate.length < 120 && product.description) {
    const cleanDesc = product.description.replace(/\s+/g, ' ').trim();
    candidate = `Download ${product.name}${categoryStr}. ${cleanDesc} Instant cloud delivery.`;
  }

  if (candidate.length > 160) {
    // Cut safely before 158 chars at last space
    const sub = candidate.slice(0, 155);
    const lastSpace = sub.lastIndexOf(' ');
    candidate = (lastSpace > 110 ? sub.slice(0, lastSpace) : sub) + '...';
  }

  return candidate;
}

/**
 * Generates Next.js Metadata object dynamically for a product
 */
export function buildProductMetadata(product: Product, baseUrl?: string): Metadata {
  const title = buildProductTitle(product);
  const description = buildProductDescription(product);
  const canonicalUrl = baseUrl
    ? `${baseUrl}/product/${product.slug || product.id}`
    : undefined;
  const imageUrl = product.imageUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&h=630&q=80';

  const keywords =
    product.metaKeywords && product.metaKeywords.length > 0
      ? product.metaKeywords
      : [
          product.category,
          'digital products',
          'creator assets',
          'instant download',
          'commercial license',
        ];

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    other: {
      'product:price:amount': product.salePrice.toString(),
      'product:price:currency': 'INR',
      'product:category': product.category,
      keywords: keywords.join(', '),
    },
  };
}

/**
 * Generates Schema.org Product JSON-LD structured data for rich snippets in Google Search
 */
export function buildProductJsonLd(product: Product, baseUrl?: string) {
  const url = baseUrl ? `${baseUrl}/product/${product.slug || product.id}` : '';
  const imageUrl = product.imageUrl || '';
  const keywordsStr =
    product.metaKeywords && product.metaKeywords.length > 0
      ? product.metaKeywords.join(', ')
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrl ? [imageUrl] : [],
    category: product.category,
    keywords: keywordsStr,
    offers: {
      '@type': 'Offer',
      price: product.salePrice,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: url || undefined,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  };
}
