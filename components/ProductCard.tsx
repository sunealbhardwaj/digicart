'use client';

import React from 'react';
import Link from 'next/link';
import { Product, Currency } from '@/lib/types';
import { formatPrice } from '@/lib/store';
import { ProductMockupGraphic } from './ProductMockupGraphic';
import { Star, ShoppingCart, Zap, HardDriveDownload } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const discountPercent = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between overflow-hidden shadow-xs">
      {/* Top Graphic Mockup Area */}
      <div
        onClick={() => onViewDetails(product)}
        className="cursor-pointer relative overflow-hidden"
      >
        <ProductMockupGraphic
          category={product.category}
          theme={product.mockupTheme}
          title={product.name}
          fileSize={product.fileSize}
          fileFormat={product.fileFormat}
          imageUrl={product.imageUrl}
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20 pointer-events-none">
          {product.badges.map((badge, idx) => {
            let badgeStyle = 'bg-blue-600 text-white font-bold';
            if (badge.includes('70%') || badge.includes('80%') || badge.includes('85%') || badge.includes('90%')) {
              badgeStyle = 'bg-rose-600 text-white font-bold';
            } else if (badge === 'BESTSELLER') {
              badgeStyle = 'bg-blue-700 text-white font-bold';
            } else if (badge === 'HOT DEAL' || badge === 'HOT SELL' || badge === 'FLASH SALE') {
              badgeStyle = 'bg-amber-500 text-slate-950 font-extrabold';
            } else if (badge === 'MEGA BUNDLE') {
              badgeStyle = 'bg-indigo-600 text-white font-bold';
            } else if (badge === 'LIMITED OFFER') {
              badgeStyle = 'bg-sky-600 text-white font-bold';
            }

            return (
              <span
                key={idx}
                className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded font-mono font-bold shadow-xs ${badgeStyle}`}
              >
                {badge}
              </span>
            );
          })}
        </div>

        {/* Discount Tag Top Right */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span className="bg-emerald-600 text-white font-extrabold text-[11px] font-mono px-2 py-0.5 rounded shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category metadata */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2 font-mono">
            <span className="truncate uppercase text-[11px] text-blue-600 font-bold">
              {product.category}
            </span>
            <div className="flex items-center gap-1 shrink-0 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-xs text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            <Link
              href={`/product/${product.slug || product.id}`}
              onClick={(e) => {
                // If normal left-click without modifier keys, open modal for fast preview
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                  e.preventDefault();
                  onViewDetails(product);
                }
              }}
              className="hover:underline cursor-pointer"
            >
              {product.name}
            </Link>
          </h3>

          {/* Short description */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Delivery tag */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
              <HardDriveDownload className="w-3.5 h-3.5" />
              Direct Cloud Link
            </span>
            <span className="text-slate-300">·</span>
            <span>{product.fileSize}</span>
          </div>
        </div>

        {/* Price & Action Module */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div>
              <span className="text-xs text-slate-400 line-through mr-2 font-mono tabular-nums">
                {formatPrice(product.regularPrice, currency)}
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 font-mono tabular-nums tracking-tight">
                {formatPrice(product.salePrice, currency)}
              </span>
            </div>

            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              Instant Delivery
            </span>
          </div>

          {/* Buttons: Buy Now & Add to Cart */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer transform active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
