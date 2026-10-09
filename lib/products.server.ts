import { Product } from './types';
import { INITIAL_PRODUCTS } from './initialData';
import { getDbProducts } from './db';

/**
 * Server-only lookup for a product by its ID or Slug
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  if (!idOrSlug) return null;
  const normalized = decodeURIComponent(idOrSlug).toLowerCase().trim();

  // Try DB first if available
  try {
    const dbProducts = await getDbProducts();
    if (dbProducts && dbProducts.length > 0) {
      const match = dbProducts.find(
        (p) =>
          p.id.toLowerCase() === normalized ||
          (p.slug && p.slug.toLowerCase() === normalized)
      );
      if (match) return match;
    }
  } catch {
    // Fall back to initial products
  }

  // Fallback to static catalog
  const match = INITIAL_PRODUCTS.find(
    (p) =>
      p.id.toLowerCase() === normalized ||
      (p.slug && p.slug.toLowerCase() === normalized)
  );

  return match || null;
}
