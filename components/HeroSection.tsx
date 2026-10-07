'use client';

import React from 'react';
import { ArrowDown, HardDriveDownload, ShieldCheck, Star } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onDealsClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onDealsClick }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200 bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
      {/* Background soft blue glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-200/40 via-indigo-100/30 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Subtle kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 font-mono mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>INSTANT GOOGLE DRIVE & MEGA DOWNLOADS · 2026 EDITION</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15] text-balance">
          The Ultimate All-in-One <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">Digital Assets & Creator Vault</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unlock commercial-grade design templates, viral creator hooks, marketing swipe files, Next.js SaaS boilerplates, and 4K cinema LUTs. Ready for instant lifetime access.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
          >
            <span>Explore All 7 Mega Categories</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={onDealsClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>View Flash Sale Deals (Flat ₹149)</span>
          </button>
        </div>

        {/* Proof & Metrics Grid */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              50,000+
            </span>
            <span className="text-xs text-slate-500 mt-1 font-medium">Curated Creative Files</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tabular-nums flex items-center gap-1">
              4.9
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs text-slate-500 mt-1 font-medium">Over 14,200 Reviews</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums flex items-center gap-1.5">
              <HardDriveDownload className="w-5 h-5 text-blue-600" />
              Instant
            </span>
            <span className="text-xs text-slate-500 mt-1 font-medium">Google Drive & Mega Sync</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              100%
            </span>
            <span className="text-xs text-slate-500 mt-1 font-medium">Commercial License</span>
          </div>
        </div>
      </div>
    </section>
  );
};
