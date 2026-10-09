'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Product, Currency } from '@/lib/types';
import { formatPrice } from '@/lib/store';
import { buildProductTitle, buildProductDescription } from '@/lib/seo';
import { ProductMockupGraphic } from './ProductMockupGraphic';
import {
  X,
  CheckCircle2,
  HardDriveDownload,
  ShieldCheck,
  Zap,
  ShoppingCart,
  Star,
  Sparkles,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
  onBuyNow,
}) => {
  // Dynamically update page title, meta description & meta keywords while modal is open
  useEffect(() => {
    if (!isOpen || !product) return;
    const prevTitle = document.title;
    const metaDescTag = document.querySelector('meta[name="description"]');
    const prevMetaDesc = metaDescTag ? metaDescTag.getAttribute('content') : '';

    let metaKeywordsTag = document.querySelector('meta[name="keywords"]');
    const createdKeywordsTag = !metaKeywordsTag;
    const prevKeywords = metaKeywordsTag ? metaKeywordsTag.getAttribute('content') : '';

    document.title = buildProductTitle(product);
    if (metaDescTag) {
      metaDescTag.setAttribute('content', buildProductDescription(product));
    }

    if (product.metaKeywords && product.metaKeywords.length > 0) {
      if (!metaKeywordsTag) {
        metaKeywordsTag = document.createElement('meta');
        metaKeywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywordsTag);
      }
      metaKeywordsTag.setAttribute('content', product.metaKeywords.join(', '));
    }

    return () => {
      document.title = prevTitle;
      if (metaDescTag && prevMetaDesc) {
        metaDescTag.setAttribute('content', prevMetaDesc);
      }
      if (metaKeywordsTag) {
        if (createdKeywordsTag) {
          metaKeywordsTag.remove();
        } else if (prevKeywords) {
          metaKeywordsTag.setAttribute('content', prevKeywords);
        }
      }
    };
  }, [isOpen, product]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background body scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const discountPercent = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Sticky Top Header Bar with prominent Close Button (ALWAYS VISIBLE) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[200px] sm:max-w-none">
              {product.category}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-mono">• Product Details</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.slug || product.id}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold transition-colors border border-slate-200"
              title="Open full dedicated product page"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs transition-colors shadow-md cursor-pointer shrink-0"
              aria-label="Close product details dialog"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Visual Mockup & Tech Specs */}
            <div className="bg-slate-50 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
              <div>
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <ProductMockupGraphic
                    category={product.category}
                    theme={product.mockupTheme}
                    title={product.name}
                    fileSize={product.fileSize}
                    fileFormat={product.fileFormat}
                    imageUrl={product.imageUrl}
                  />
                </div>

                {/* Delivery link preview */}
                <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
                  <div className="flex items-center justify-between font-mono mb-1.5">
                    <span className="text-slate-500">Delivery Method:</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      <HardDriveDownload className="w-3.5 h-3.5" /> Instant Cloud Drive
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                    <span>File Volume:</span>
                    <span className="text-slate-800 font-semibold">{product.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mt-1">
                    <span>Format:</span>
                    <span className="text-slate-800 truncate max-w-[150px]">{product.fileFormat}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>100% Commercial Rights Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Lifetime Free Future Updates</span>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Purchase */}
            <div className="p-5 sm:p-6 flex flex-col justify-between bg-white">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {product.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {badge}
                    </span>
                  ))}
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-500">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                  <span>({product.reviewCount} reviews)</span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Features List */}
                <div className="mt-4">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-500 mb-2">
                    What&apos;s Included In This Vault:
                  </h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Custom Meta Keywords / Discoverability Tags */}
                {product.metaKeywords && product.metaKeywords.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                      <Tag className="w-3 h-3 text-blue-600" />
                      <span>Search & Discoverability Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.metaKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase Footer */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-2 font-mono tabular-nums">
                      {formatPrice(product.regularPrice, currency)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                      {formatPrice(product.salePrice, currency)}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold">
                    Instant Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:col-span-3 py-3 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="sm:col-span-4 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBuyNow(product);
                    }}
                    className="sm:col-span-5 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer transform active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Instant Checkout</span>
                  </button>
                </div>

                <p className="mt-2 text-center text-[10px] text-slate-400 font-mono">
                  Download links delivered immediately on screen and via email after checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
