'use client';

import React, { useState } from 'react';
import { CartItem, Currency, Coupon, Order } from '@/lib/types';
import { formatPrice } from '@/lib/store';
import {
  X,
  ShieldCheck,
  Zap,
  Lock,
  CreditCard,
  QrCode,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  coupon?: Coupon;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  coupon,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI / GPay' | 'Credit/Debit Card' | 'PayPal'>('UPI / GPay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const discountAmount = coupon
    ? Math.round((subtotal * coupon.discountPercentage) / 100)
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) {
      setError('Please provide your name and valid delivery email.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate payment processing for 1.2 seconds
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          salePrice: i.product.salePrice,
          quantity: i.quantity,
          deliveryLink: i.product.deliveryLink,
        })),
        subtotal,
        discountAmount,
        total,
        appliedCoupon: coupon?.code,
        currency,
        paymentMethod,
        status: 'DELIVERED',
        createdAt: new Date().toISOString(),
      };

      // POST to server order route as well
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(console.error);

      onOrderSuccess(newOrder);
    } catch {
      setError('Payment simulation error. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Zap className="w-4 h-4 fill-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Instant Download Checkout</h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Immediate Google Drive / Mega cloud delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {/* Order Summary Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 text-slate-500 font-mono">
              <span>Items in Order: {items.length}</span>
              <span className="text-blue-600 font-bold tabular-nums">
                Total: {formatPrice(total, currency)}
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.product.id} className="flex justify-between text-[11px] text-slate-700">
                  <span className="truncate max-w-[280px]">
                    {it.quantity}x {it.product.name}
                  </span>
                  <span className="font-mono text-slate-500 font-semibold">
                    {formatPrice(it.product.salePrice * it.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Delivery Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-500">
              1. Delivery Information
            </h3>

            <div>
              <label className="block text-xs text-slate-700 mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1 font-medium">
                Email Address (Direct cloud link delivery)
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Your private Google Drive folder link will be unlocked immediately and emailed.
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-500">
              2. Select Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI / GPay')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'UPI / GPay'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-[11px]">UPI / QR / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Credit/Debit Card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'Credit/Debit Card'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span className="font-mono text-[11px]">Card (Debit/Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('PayPal')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'PayPal'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-5 h-5 text-sky-600" />
                <span className="font-mono text-[11px]">PayPal / Global</span>
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-mono">{error}</p>}

          {/* Trust Banner */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>256-bit SSL encrypted. Commercial license included with all downloads.</span>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 transform active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment & Generating Cloud Access...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Pay {formatPrice(total, currency)} & Get Instant Access
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
