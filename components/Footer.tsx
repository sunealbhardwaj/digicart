'use client';

import React from 'react';
import { Sparkles, ShieldCheck, HardDriveDownload, Lock } from 'lucide-react';
import { ALL_CATEGORIES } from './CategoryFilter';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  categories?: string[];
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, categories = ALL_CATEGORIES }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-10 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base tracking-tight">
              <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
              </span>
              <span>
                APEX<span className="text-blue-600">DIGITAL</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Premium digital product marketplace for modern creators, digital marketers, designers, and software engineers. Instant Google Drive & Mega delivery.
            </p>
            <div className="flex items-center gap-2 text-blue-600 text-[11px] font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>All Cloud Download Servers Online</span>
            </div>
          </div>

          {/* Categories 1 */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">
              Asset Collections
            </h4>
            <ul className="space-y-1.5">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="text-left text-slate-500 hover:text-blue-600 transition-colors truncate max-w-[220px] block cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">
              Specialized Tools
            </h4>
            <ul className="space-y-1.5">
              {categories.slice(4).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="text-left text-slate-500 hover:text-blue-600 transition-colors truncate max-w-[220px] block cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">
              Buyer Protection
            </h4>
            <div className="space-y-2 font-mono text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Commercial Rights Granted</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDriveDownload className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Instant Google Drive Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-600 shrink-0" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Questions? Reach us at <span className="text-slate-700 font-medium">support@apexdigital.store</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px] font-mono">
          <p>© {new Date().getFullYear()} ApexDigital Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Instant Cloud Delivery Protocol</span>
            <span>·</span>
            <span>Unrestricted Commercial License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
