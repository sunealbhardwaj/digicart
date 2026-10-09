'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Product,
  Currency,
  CartItem,
  Coupon,
  Order,
  StoreSettings,
} from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_SETTINGS } from '@/lib/initialData';
import {
  getStoredProducts,
  getStoredCoupons,
  getStoredSettings,
  addStoredOrder,
  formatPrice,
} from '@/lib/store';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { ProductMockupGraphic } from './ProductMockupGraphic';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { OrderSuccessModal } from './OrderSuccessModal';
import { TrustSection } from './TrustSection';
import { FaqSection } from './FaqSection';
import { Footer } from './Footer';
import {
  Star,
  ShoppingCart,
  Zap,
  HardDriveDownload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Share2,
  Check,
  Layers,
  FileCheck,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface ProductPageViewProps {
  initialProduct: Product;
}

export default function ProductPageView({ initialProduct }: ProductPageViewProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [checkoutCoupon, setCheckoutCoupon] = useState<Coupon | undefined>(undefined);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<StoreSettings | null>(INITIAL_SETTINGS);
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync client state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setCoupons(getStoredCoupons());
      setSettings(getStoredSettings());

      try {
        const storedProds = getStoredProducts();
        if (storedProds && storedProds.length > 0) {
          setAllProducts(storedProds);
          const matched = storedProds.find(
            (p) => p.id === initialProduct.id || (p.slug && p.slug === initialProduct.slug)
          );
          if (matched) {
            setProduct(matched);
          }
        }
      } catch {
        // ignore
      }

      try {
        const savedCart = localStorage.getItem('apex_cart_v1');
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch {
        // ignore
      }

      try {
        const savedCurrency = localStorage.getItem('apex_currency_v1') as Currency;
        if (savedCurrency) setCurrency(savedCurrency);
      } catch {
        // ignore
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [initialProduct.id, initialProduct.slug]);

  // Save cart
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('apex_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, isMounted]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem('apex_currency_v1', c);
    } catch {
      // ignore
    }
  };

  const handleAddToCart = (item: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product: item, quantity: 1 }];
    });
    showToast(`Added "${item.name.slice(0, 26)}..." to cart`);
  };

  const handleBuyNow = (item: Product) => {
    setCheckoutItems([{ product: item, quantity: 1 }]);
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
    if (checkoutItems.length === cart.length) {
      setCart([]);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCategorySelect = (cat: string) => {
    router.push(`/?category=${encodeURIComponent(cat)}#catalog-section`);
  };

  const discountPercent = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  // Related products from same category or featured
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.isActive)
    .filter((p) => p.category === product.category || p.isFeatured)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* 1. Announcement Bar */}
      {settings?.announcementActive && (
        <AnnouncementBar settings={settings} />
      )}

      {/* 2. Main Storefront Navbar */}
      <Navbar
        cartCount={isMounted ? cart.reduce((total, i) => total + i.quantity, 0) : 0}
        onOpenCart={() => setIsCartOpen(true)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        searchQuery=""
        onSearchChange={(q) => router.push(`/?q=${encodeURIComponent(q)}#catalog-section`)}
        selectedCategory={product.category}
        onCategorySelect={handleCategorySelect}
      />

      {/* 3. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 text-xs flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-mono overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400 shrink-0" />
            <Link href={`/?category=${encodeURIComponent(product.category)}#catalog-section`} className="hover:text-blue-600 transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 5. Main Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Visual Mockup & Technical Specifications */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
              <ProductMockupGraphic
                category={product.category}
                theme={product.mockupTheme}
                title={product.name}
                fileSize={product.fileSize}
                fileFormat={product.fileFormat}
                imageUrl={product.imageUrl}
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20 pointer-events-none">
                {product.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded font-mono font-bold bg-blue-600 text-white shadow-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <span className="bg-emerald-600 text-white font-extrabold text-xs font-mono px-3 py-1 rounded shadow-sm">
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Technical Specifications Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Asset Technical Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase">File Size</div>
                  <div className="text-slate-800 font-bold mt-0.5">{product.fileSize}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase">File Format</div>
                  <div className="text-slate-800 font-bold mt-0.5">{product.fileFormat}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase">Delivery</div>
                  <div className="text-blue-600 font-bold mt-0.5">Instant Cloud</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase">License</div>
                  <div className="text-slate-800 font-bold mt-0.5">Commercial</div>
                </div>
              </div>

              {/* Share & Deep Link Toolbar */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Product Link</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-400">
                  Official ApexDigital ID: {product.id}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Primary CTA, Description & Features */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
                <span className="font-bold text-blue-600 uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600 font-bold">{product.salesCount.toLocaleString()} sold</span>
                </div>
              </div>

              {/* Product Title (H1 for SEO) */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Short Hook */}
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Box & Action CTAs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs text-slate-400 font-mono">ONE-TIME PAYMENT • LIFETIME ACCESS</div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-base text-slate-400 line-through font-mono">
                      {formatPrice(product.regularPrice, currency)}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-blue-600 font-mono tracking-tight">
                      {formatPrice(product.salePrice, currency)}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md">
                        Save {discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    Instant Cloud Delivery
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleBuyNow(product)}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now & Download</span>
                </button>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Virus & Malware Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Instant Link via Email</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Commercial Resell Rights</span>
                </div>
              </div>
            </div>

            {/* Key Features & Assets Included */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                What&apos;s Included In This Digital Asset
              </h2>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Custom Meta Keywords / Search Discoverability */}
            {product.metaKeywords && product.metaKeywords.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 mb-3">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>Discoverability & Search Keywords</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Indexed topics and search terms related to this digital product:
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.metaKeywords.map((kw, idx) => (
                    <Link
                      key={idx}
                      href={`/?q=${encodeURIComponent(kw)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 border border-slate-200 text-xs font-mono transition-colors"
                    >
                      <span>#{kw}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Customer Reviews & Social Proof */}
        <section className="mt-14 pt-12 border-t border-slate-200">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Reviews ({product.reviewCount})
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Verified buyers who purchased and downloaded this asset
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Exceptional quality assets. Download link arrived right after UPI payment with zero friction. Saved our team at least 40 hours of design work.&rdquo;
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-500 font-bold">
                — Aman S., Agency Lead
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Everything is organized into neat Google Drive folders with high-res source files. Worth 10x the price.&rdquo;
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-500 font-bold">
                — Neha Verma, Digital Creator
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;The commercial resell rights alone gave us an instant return on investment on day one. Highly recommended!&rdquo;
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-500 font-bold">
                — Rohit K., E-commerce Entrepreneur
              </div>
            </div>
          </div>
        </section>

        {/* 7. Related Products in Same Category */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  More in {product.category}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Discover top-rated companion vaults and resources
                </p>
              </div>

              <Link
                href={`/?category=${encodeURIComponent(product.category)}#catalog-section`}
                className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  currency={currency}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewDetails={() => router.push(`/product/${rel.slug || rel.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 8. Trust & FAQ */}
      <TrustSection />
      <FaqSection />

      {/* 9. Footer */}
      <Footer onSelectCategory={handleCategorySelect} />

      {/* 10. Slide-over Cart Drawer */}
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

      {/* 11. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        currency={currency}
        coupon={checkoutCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 12. Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}
