'use client';

import { Product, Coupon, StoreSettings, Order, Currency } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_SETTINGS, INITIAL_ORDERS, SAMPLE_IMAGE_PRESETS } from './initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'apex_products_v2',
  COUPONS: 'apex_coupons_v1',
  SETTINGS: 'apex_settings_v1',
  ORDERS: 'apex_orders_v1',
  CART: 'apex_cart_v1',
  CURRENCY: 'apex_currency_v1',
  ADMIN_AUTH: 'apex_admin_session_v1',
};

// Safe LocalStorage helpers
export const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    let updated = false;
    const enriched = parsed.map((p) => {
      if (!p.imageUrl) {
        const found = INITIAL_PRODUCTS.find((init) => init.id === p.id);
        if (found?.imageUrl) {
          updated = true;
          return { ...p, imageUrl: found.imageUrl };
        }
        const fallbackSample =
          SAMPLE_IMAGE_PRESETS.find((s) => s.category === p.category) || SAMPLE_IMAGE_PRESETS[0];
        if (fallbackSample?.url) {
          updated = true;
          return { ...p, imageUrl: fallbackSample.url };
        }
      }
      return p;
    });
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

export const formatPrice = (amountINR: number, currency: Currency): string => {
  if (currency === 'USD') {
    const usd = Math.max(1.99, Number((amountINR * 0.012).toFixed(2)));
    return `$${usd.toFixed(2)}`;
  }
  if (currency === 'EUR') {
    const eur = Math.max(1.89, Number((amountINR * 0.011).toFixed(2)));
    return `€${eur.toFixed(2)}`;
  }
  return `₹${amountINR.toLocaleString('en-IN')}`;
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
