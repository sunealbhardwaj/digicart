import { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS } from '@/lib/initialData';
import { getDbProducts } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://apexdigital.market';

  let products = INITIAL_PRODUCTS;
  try {
    const dbProds = await getDbProducts();
    if (dbProds && dbProds.length > 0) {
      products = dbProds;
    }
  } catch {
    // fallback
  }

  const productEntries: MetadataRoute.Sitemap = products
    .filter((p) => p.isActive)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug || product.id}`,
      lastModified: new Date(product.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: product.isFeatured ? 0.9 : 0.8,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...productEntries,
  ];
}
