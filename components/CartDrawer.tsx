'use client';

import React, { useState } from 'react';
import { CartItem, Currency, Coupon } from '@/lib/types';
import { formatPrice } from '@/lib/store';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (appliedCoupon?: Coupon) => void;
  coupons: Coupon[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  coupons,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercentage) / 100)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    const matched = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
    );

    if (!matched) {
      setCouponError('Invalid or expired coupon code.');
      return;
    }

    if (matched.minSpend && subtotal < matched.minSpend) {
      setCouponError(`Minimum order amount of ${formatPrice(matched.minSpend, currency)} required.`);
      return;
    }

    setAppliedCoupon(matched);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Asset Cart</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {cart.reduce((totalQty, i) => totalQty + i.quantity, 0)} items
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Select any mega vault or digital tool bundle to begin instant download.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Browse Bundles
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3.5 rounded-xl bg-white border border-slate-200 items-start justify-between shadow-xs"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase text-blue-600 font-bold">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                      {product.name}
                    </h4>

                    <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                      <span className="text-slate-900 font-bold tabular-nums">
                        {formatPrice(product.salePrice, currency)}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Size: {product.fileSize}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch pl-2">
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 text-xs font-mono">
                      <button
                        onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                      >
                        -
                      </button>
                      <span className="px-2 text-slate-800 font-semibold">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        className="px-2 py-0.5 text-slate-500 hover:text-slate-900"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-4">
              {/* Coupon Form */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono font-bold">{appliedCoupon.code}</span>
                      <span>({appliedCoupon.discountPercentage}% OFF applied)</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-slate-500 hover:text-slate-800 font-mono text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Discount code (e.g. CREATOR70)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 uppercase font-mono placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-rose-600 font-mono">{couponError}</p>}
              </div>

              {/* Summary Calculations */}
              <div className="space-y-1.5 text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800 tabular-nums font-semibold">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums">-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-base text-blue-600 tabular-nums">
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onProceedToCheckout(appliedCoupon || undefined);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95"
              >
                <span>Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Instant Cloud Drive & Mega access generated after payment</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
