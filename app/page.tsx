'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Currency, CartItem, Coupon, Order, StoreSettings } from '@/lib/types';
import {
  getStoredProducts,
  getStoredCoupons,
  getStoredSettings,
  addStoredOrder,
} from '@/lib/store';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { TrustSection } from '@/components/TrustSection';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { Sparkles, Search, SlidersHorizontal, Star, ShieldCheck } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStoredCoupons());
  const [settings, setSettings] = useState<StoreSettings | null>(() => getStoredSettings());

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('INR');

  // Interactive states
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('apex_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Checkout & Success states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [checkoutCoupon, setCheckoutCoupon] = useState<Coupon | undefined>(undefined);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getStoredProducts());
      setCoupons(getStoredCoupons());
      setSettings(getStoredSettings());
    };

    window.addEventListener('apex_products_updated', handleUpdate);
    window.addEventListener('apex_coupons_updated', handleUpdate);
    window.addEventListener('apex_settings_updated', handleUpdate);

    return () => {
      window.removeEventListener('apex_products_updated', handleUpdate);
      window.removeEventListener('apex_coupons_updated', handleUpdate);
      window.removeEventListener('apex_settings_updated', handleUpdate);
    };
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('apex_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name.slice(0, 28)}..." to cart`);
  };

  const handleBuyNow = (product: Product) => {
    setCheckoutItems([{ product, quantity: 1 }]);
    setCheckoutCoupon(undefined);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = (appliedCoupon?: Coupon) => {
    setCheckoutItems(cart);
    setCheckoutCoupon(appliedCoupon);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    addStoredOrder(order);
    setCompletedOrder(order);
    setIsCheckoutOpen(false);
    // clear cart if checked out from cart
    if (checkoutItems.length === cart.length) {
      setCart([]);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    products
      .filter((p) => p.isActive)
      .forEach((p) => {
        counts['ALL'] = (counts['ALL'] || 0) + 1;
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
    return counts;
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.name.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchFeature = p.features.some((f) => f.toLowerCase().includes(query));
        const matchBadge = p.badges.some((b) => b.toLowerCase().includes(query));
        if (!matchTitle && !matchCategory && !matchDesc && !matchFeature && !matchBadge) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Dynamic Top Announcement Bar */}
      {settings && <AnnouncementBar settings={settings} />}

      {/* 2. Sticky Storefront Header */}
      <Navbar
        cartCount={cart.reduce((total, i) => total + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currency={currency}
        onCurrencyChange={setCurrency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Hero Section */}
      <HeroSection
        onExploreClick={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDealsClick={() => {
          setSelectedCategory('ALL');
          setSearchQuery('FLASH SALE');
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. Product Catalog Main Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter Pills / Tabs */}
        <div className="mb-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchQuery('');
            }}
            counts={categoryCounts}
          />
        </div>

        {/* Section Header with Sort / Filter info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>
                {selectedCategory === 'ALL' ? 'Featured Creator Vaults & Tools' : selectedCategory}
              </span>
              <span className="text-xs font-mono font-normal text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                {filteredProducts.length} items
              </span>
            </h2>
            {searchQuery && (
              <p className="text-xs text-blue-600 font-mono mt-1">
                Showing results for &ldquo;{searchQuery}&rdquo; —{' '}
                <button
                  onClick={() => setSearchQuery('')}
                  className="underline hover:text-blue-800 cursor-pointer font-bold"
                >
                  Clear search
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified Cloud Download Links
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No assets match your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try exploring all categories or clearing your keyword filter to view available vaults.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Customer Reviews / Social Proof Showcase */}
      <section className="py-14 border-t border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase text-blue-600 tracking-wider">
              Real Verified Reviews
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Loved by Top Content Creators & Agencies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;The Ultimate Content Creator Mega Vault cut our agency&apos;s editing time by 80%. The 4K Premiere transitions and sound effects are broadcast quality. Instant Google Drive download took under 20 seconds.&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">Marcus Vance</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Creative Director @ Apex Media</p>
                </div>
                <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;The Full-Stack Developer SaaS Toolkit gave me a fully working Next.js App Router boilerplate with Tailwind and Stripe billing. Saved me at least 3 weeks of scaffolding work for our startup MVP.&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">Ananya Sharma</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Founding Engineer @ QuickFlow</p>
                </div>
                <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;Purchased the Master Graphic Designer Suite during the ₹149 flash sale. The PSD mockups and typography pairings are worth hundreds of dollars. Highly recommend to every freelancer.&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">David K.</h4>
                  <p className="text-[11px] text-slate-500 font-mono">Senior Brand Designer</p>
                </div>
                <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trust Badges & Guarantee Pillars */}
      <TrustSection />

      {/* 7. FAQ Section */}
      <FaqSection />

      {/* 8. Footer (Strictly ZERO admin links or buttons) */}
      <Footer onSelectCategory={(cat) => setSelectedCategory(cat)} />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        currency={currency}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        coupons={coupons}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        currency={currency}
        coupon={checkoutCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
