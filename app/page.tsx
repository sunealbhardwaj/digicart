'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Currency, CartItem, Coupon, Order, StoreSettings, CATEGORY_TAXONOMY, DEFAULT_CATEGORIES } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_SETTINGS } from '@/lib/initialData';
import {
  getStoredProducts,
  getStoredCategories,
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
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { MaintenanceModeBanner } from '@/components/MaintenanceModeBanner';
import { Sparkles, Search, SlidersHorizontal, Star, ShieldCheck } from 'lucide-react';

export default function StorefrontPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES]);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<StoreSettings | null>(INITIAL_SETTINGS);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('INR');

  // Interactive states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
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

  // Admin bypass mode during maintenance
  const [adminBypass, setAdminBypass] = useState(false);

  // Hydration-safe initial client synchronization
  useEffect(() => {
    const syncClientData = () => {
      setIsMounted(true);
      setProducts(getStoredProducts());
      setCategories(getStoredCategories());
      setCoupons(getStoredCoupons());
      setSettings(getStoredSettings());

      try {
        const bypass = sessionStorage.getItem('apex_admin_bypass');
        if (bypass === 'true') {
          setAdminBypass(true);
        }
      } catch {
        // ignore
      }

      // Check server settings
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data?.settings) {
            setSettings(data.settings);
          }
        })
        .catch(() => {});

      try {
        const savedCart = localStorage.getItem('apex_cart_v1');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch {
        // ignore
      }

      try {
        const savedCurrency = localStorage.getItem('apex_currency_v1') as Currency;
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } catch {
        // ignore
      }

      // Read URL query params on mount
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const catParam = searchParams.get('category');
        const queryParam = searchParams.get('q');
        const prodParam = searchParams.get('product');

        if (catParam) {
          setSelectedCategory(catParam);
        }
        if (queryParam) {
          setSearchQuery(queryParam);
        }
        if (prodParam) {
          const prods = getStoredProducts();
          const match = prods.find((p) => p.id === prodParam || p.slug === prodParam);
          if (match) {
            router.push(`/product/${match.slug || match.id}`);
          }
        }
      } catch {
        // ignore
      }
    };

    const timer = setTimeout(syncClientData, 0);

    const handleUpdate = () => {
      setProducts(getStoredProducts());
      setCategories(getStoredCategories());
      setCoupons(getStoredCoupons());
      setSettings(getStoredSettings());
    };

    window.addEventListener('apex_products_updated', handleUpdate);
    window.addEventListener('apex_categories_updated', handleUpdate);
    window.addEventListener('apex_coupons_updated', handleUpdate);
    window.addEventListener('apex_settings_updated', handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('apex_products_updated', handleUpdate);
      window.removeEventListener('apex_categories_updated', handleUpdate);
      window.removeEventListener('apex_coupons_updated', handleUpdate);
      window.removeEventListener('apex_settings_updated', handleUpdate);
    };
  }, [router]);

  // Save cart to local storage only after mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('apex_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, isMounted]);

  // Persist currency selection
  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem('apex_currency_v1', c);
    } catch {
      // ignore
    }
  };

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
    router.push(`/product/${product.slug || product.id}`);
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

    // Special collection counts
    const activeProducts = products.filter((p) => p.isActive);
    counts['MEGA BUNDLES'] = activeProducts.filter(
      (p) => p.category === 'MEGA BUNDLES' || p.badges.includes('MEGA BUNDLE')
    ).length;
    counts['NEW ARRIVALS'] = activeProducts.filter(
      (p) => p.badges.includes('NEW RELEASE') || p.id.includes('tmpl') || p.id.includes('plr')
    ).length;
    counts['BEST SELLERS'] = activeProducts.filter(
      (p) => p.badges.includes('BESTSELLER') || p.salesCount >= 2000
    ).length;

    // Parent group aggregate counts
    CATEGORY_TAXONOMY.groups.forEach((g) => {
      let groupTotal = 0;
      g.subcategories.forEach((sub) => {
        groupTotal += counts[sub] || 0;
      });
      counts[g.name] = groupTotal;
    });

    return counts;
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;

      // Category / Collection filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'MEGA BUNDLES') {
          if (p.category !== 'MEGA BUNDLES' && !p.badges.includes('MEGA BUNDLE')) {
            return false;
          }
        } else if (selectedCategory === 'NEW ARRIVALS') {
          if (!p.badges.includes('NEW RELEASE') && !p.id.includes('tmpl') && !p.id.includes('plr')) {
            return false;
          }
        } else if (selectedCategory === 'BEST SELLERS') {
          if (!p.badges.includes('BESTSELLER') && p.salesCount < 2000) {
            return false;
          }
        } else {
          // Check if selectedCategory is a Parent Taxonomy Group
          const matchedGroup = CATEGORY_TAXONOMY.groups.find((g) => g.name === selectedCategory);
          if (matchedGroup) {
            if (p.category !== selectedCategory && !matchedGroup.subcategories.includes(p.category)) {
              return false;
            }
          } else {
            // Specific subcategory filter
            if (p.category !== selectedCategory) {
              return false;
            }
          }
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.name.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchFeature = p.features.some((f) => f.toLowerCase().includes(query));
        const matchBadge = p.badges.some((b) => b.toLowerCase().includes(query));
        const matchKeyword = p.metaKeywords?.some((k) => k.toLowerCase().includes(query));
        if (!matchTitle && !matchCategory && !matchDesc && !matchFeature && !matchBadge && !matchKeyword) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // If maintenance mode is active and visitor is not in admin bypass mode
  if (isMounted && settings?.maintenanceMode && !adminBypass) {
    return (
      <MaintenanceScreen
        settings={settings}
        onEnableBypass={() => {
          setAdminBypass(true);
          try {
            sessionStorage.setItem('apex_admin_bypass', 'true');
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Admin Bypass Sticky Warning Banner */}
      {settings?.maintenanceMode && adminBypass && (
        <MaintenanceModeBanner
          settings={settings}
          onSettingsUpdated={(newSettings) => setSettings(newSettings)}
          onExitBypass={() => {
            setAdminBypass(false);
            try {
              sessionStorage.removeItem('apex_admin_bypass');
            } catch {
              // ignore
            }
          }}
        />
      )}

      {/* 1. Dynamic Top Announcement Bar */}
      {settings && <AnnouncementBar settings={settings} />}

      {/* 2. Sticky Storefront Header with Full Category Navigation */}
      <Navbar
        cartCount={isMounted ? cart.reduce((total, i) => total + i.quantity, 0) : 0}
        onOpenCart={() => setIsCartOpen(true)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        categoryCounts={categoryCounts}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
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
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Contextual Category Sub-Filter (only shown when category filtered) */}
        {selectedCategory !== 'ALL' && (
          <div className="mb-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchQuery('');
              }}
              counts={categoryCounts}
              categories={categories}
            />
          </div>
        )}

        {/* Section Header with Clean, Compact Typography */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-slate-200/80">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {selectedCategory === 'ALL' ? 'All Digital Assets' : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProducts.length} verified {filteredProducts.length === 1 ? 'asset' : 'assets'} ready for instant download
            </p>
            {searchQuery && (
              <p className="text-xs text-blue-600 font-mono mt-1">
                Filter: &ldquo;{searchQuery}&rdquo; ·{' '}
                <button
                  onClick={() => setSearchQuery('')}
                  className="underline hover:text-blue-800 cursor-pointer font-semibold"
                >
                  Clear search
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-md text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Cloud Links
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No assets match your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try clearing your search query or selecting a different category from the navigation bar.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
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
      <section className="py-10 sm:py-12 border-t border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="text-xs font-mono font-medium uppercase tracking-wider text-slate-500 mb-1">
              Verified Feedback
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trusted by 14,000+ Creators & Developers
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
      <Footer onSelectCategory={(cat) => setSelectedCategory(cat)} categories={categories} />

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
