'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/store';
import {
  CheckCircle2,
  HardDriveDownload,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Mail,
  X,
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  // Lock background body scroll
  useEffect(() => {
    if (order) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [order]);

  if (!order) return null;

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Celebration Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black">Payment Successful!</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Order #{order.id} · Instant Cloud Drive Access Unlocked
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* Email dispatch notice */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-slate-700">
            <Mail className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">
                Download access sent to <span className="text-blue-700 font-bold">{order.customerEmail}</span>
              </p>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                Check your inbox and spam folder. You can also download your files directly below right now!
              </p>
            </div>
          </div>

          {/* Download Delivery Links Card */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-500 flex items-center justify-between">
              <span>Your Instant Download Links ({order.items.length})</span>
              <span className="text-blue-600 font-bold">● 100% Active Cloud Sync</span>
            </h3>

            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Bundle {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Cloud Host: Google Drive / Mega High-Speed Server
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleCopyLink(item.deliveryLink, `${idx}`)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === `${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-blue-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.deliveryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                    >
                      <HardDriveDownload className="w-3.5 h-3.5" />
                      <span>Download Now</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Info */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 flex items-center justify-between">
            <span>Payment Method: {order.paymentMethod}</span>
            <span className="text-slate-900 font-bold">
              Total Paid: {formatPrice(order.total, order.currency)}
            </span>
          </div>

          {/* Guarantees */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1.5 text-blue-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Lifetime Access Granted
            </span>
            <span>Commercial Pro License: Valid</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
