'use client';

import { Product, Coupon, StoreSettings, Order, Currency, DEFAULT_CATEGORIES } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_SETTINGS, INITIAL_ORDERS, SAMPLE_IMAGE_PRESETS } from './initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'apex_products_v3',
  CATEGORIES: 'apex_categories_v3',
  COUPONS: 'apex_coupons_v1',
  SETTINGS: 'apex_settings_v1',
  ORDERS: 'apex_orders_v1',
  CART: 'apex_cart_v1',
  CURRENCY: 'apex_currency_v1',
  ADMIN_AUTH: 'apex_admin_session_v1',
};

const OLD_CATEGORY_MAPPINGS: Record<string, string> = {
  'CONTENT CREATION & MEDIA ASSETS': 'Content Creation',
  'GRAPHIC DESIGN & CREATIVE TEMPLATES': 'Graphic Design',
  'BUSINESS & DIGITAL MARKETING RESOURCES': 'Business & Marketing',
  'EMAIL MARKETING MEGA BUNDLE': 'Email Marketing',
  'SOFTWARE, WORDPRESS & DEVELOPMENT TOOLS': 'Software & WordPress',
  'VIDEO & AUDIO PRODUCTION BUNDLE': 'Video & Audio',
  'COURSES & EDUCATIONAL RESOURCES': 'Courses & Education',
};

// Safe LocalStorage helpers
export const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      // Check if v2 products exist and migrate
      const v2Raw = localStorage.getItem('apex_products_v2');
      if (v2Raw) {
        try {
          const v2Products: Product[] = JSON.parse(v2Raw);
          // Migrate old categories to new
          const migrated = v2Products.map((p) => ({
            ...p,
            category: OLD_CATEGORY_MAPPINGS[p.category] || p.category,
          }));
          // Merge with any new initial products not present in v2
          const existingIds = new Set(migrated.map((p) => p.id));
          const toAdd = INITIAL_PRODUCTS.filter((init) => !existingIds.has(init.id));
          const merged = [...migrated, ...toAdd];
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          return merged;
        } catch {
          // ignore error
        }
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    let updated = false;
    const enriched = parsed.map((p) => {
      // Check if old category needs update
      let cat = p.category;
      if (OLD_CATEGORY_MAPPINGS[p.category]) {
        cat = OLD_CATEGORY_MAPPINGS[p.category];
        updated = true;
      }
      if (!p.imageUrl) {
        const found = INITIAL_PRODUCTS.find((init) => init.id === p.id);
        if (found?.imageUrl) {
          updated = true;
          return { ...p, category: cat, imageUrl: found.imageUrl };
        }
        const fallbackSample =
          SAMPLE_IMAGE_PRESETS.find((s) => s.category === cat) || SAMPLE_IMAGE_PRESETS[0];
        if (fallbackSample?.url) {
          updated = true;
          return { ...p, category: cat, imageUrl: fallbackSample.url };
        }
      }
      if (cat !== p.category) {
        return { ...p, category: cat };
      }
      return p;
    });

    // Make sure new initial products exist
    const existingIds = new Set(enriched.map((p) => p.id));
    const missing = INITIAL_PRODUCTS.filter((init) => !existingIds.has(init.id));
    if (missing.length > 0) {
      enriched.push(...missing);
      updated = true;
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(enriched));
    }
    return enriched;
  } catch (err) {
    console.error('Failed to read products:', err);
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('apex_products_updated'));
  } catch (err) {
    console.error('Failed to save products:', err);
  }
};

// Category storage helpers
export const getStoredCategories = (): string[] => {
  if (typeof window === 'undefined') return [...DEFAULT_CATEGORIES];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    let cats: string[] = [];
    if (raw) {
      cats = JSON.parse(raw);
      // If cats still contains old categories, replace them with DEFAULT_CATEGORIES
      const hasOldCategory = cats.some((c) => OLD_CATEGORY_MAPPINGS[c] || c.includes('CONTENT CREATION & MEDIA'));
      if (hasOldCategory) {
        cats = [...DEFAULT_CATEGORIES];
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
      }
    } else {
      cats = [...DEFAULT_CATEGORIES];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
    }
    // Also include any custom categories from existing products to prevent orphaned items
    try {
      const prodRaw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (prodRaw) {
        const prods: Product[] = JSON.parse(prodRaw);
        prods.forEach((p) => {
          const cleanCat = OLD_CATEGORY_MAPPINGS[p.category] || p.category;
          if (cleanCat && !cats.includes(cleanCat)) {
            cats.push(cleanCat);
          }
        });
      }
    } catch {
      // ignore
    }
    return cats;
  } catch (err) {
    console.error('Failed to read categories:', err);
    return [...DEFAULT_CATEGORIES];
  }
};

export const saveStoredCategories = (categories: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    window.dispatchEvent(new Event('apex_categories_updated'));
  } catch (err) {
    console.error('Failed to save categories:', err);
  }
};

export const addStoredCategory = (categoryName: string): { success: boolean; message: string; category?: string } => {
  const trimmed = categoryName.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, message: 'Category name must be at least 2 characters.' };
  }
  const current = getStoredCategories();
  const normalized = trimmed.toUpperCase();
  const existing = current.find((c) => c.toUpperCase() === normalized);
  if (existing) {
    return { success: false, message: `Category "${existing}" already exists.`, category: existing };
  }
  const updated = [...current, trimmed];
  saveStoredCategories(updated);
  return { success: true, message: `Category "${trimmed}" created successfully!`, category: trimmed };
};

export const deleteStoredCategory = (categoryName: string): { success: boolean; message: string } => {
  const current = getStoredCategories();
  if (current.length <= 1) {
    return { success: false, message: 'At least one category must remain.' };
  }
  const updated = current.filter((c) => c !== categoryName);
  saveStoredCategories(updated);
  return { success: true, message: `Category "${categoryName}" removed.` };
};

export const getStoredCoupons = (): Coupon[] => {
  if (typeof window === 'undefined') return INITIAL_COUPONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COUPONS;
  }
};

export const saveStoredCoupons = (coupons: Coupon[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    window.dispatchEvent(new Event('apex_coupons_updated'));
  } catch (err) {
    console.error('Failed to save coupons:', err);
  }
};

export const getStoredSettings = (): StoreSettings => {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: StoreSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('apex_settings_updated'));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

export const getStoredOrders = (): Order[] => {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const addStoredOrder = (order: Order) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredOrders();
    const updated = [order, ...current];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    window.dispatchEvent(new Event('apex_orders_updated'));
  } catch (err) {
    console.error('Failed to save order:', err);
  }
};

export const formatINRNumber = (amountINR: number): string => {
  const str = Math.round(amountINR).toString();
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
};

export const formatPrice = (amountINR: number, currency: Currency): string => {
  if (currency === 'USD') {
    const usd = Math.max(1.99, Number((amountINR * 0.012).toFixed(2)));
    return `$${usd.toFixed(2)}`;
  }
  if (currency === 'EUR') {
    const eur = Math.max(1.89, Number((amountINR * 0.011).toFixed(2)));
    return `€${eur.toFixed(2)}`;
  }
  return `₹${formatINRNumber(amountINR)}`;
};

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'INR':
    default:
      return '₹';
  }
};
