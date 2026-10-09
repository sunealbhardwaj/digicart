'use client';

import React from 'react';
import { ArrowDown, HardDriveDownload, ShieldCheck, Star } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onDealsClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onDealsClick }) => {
  return (
    <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Editorial Eyebrow / Kicker */}
        <div className="text-xs font-mono font-medium uppercase tracking-wider text-slate-500 mb-3">
          Verified Cloud Delivery · Unrestricted Commercial Rights
        </div>

        {/* Crisp, Balanced Display Heading */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight text-balance">
          Curated Digital Assets & Creator Vaults
        </h1>

        {/* Refined Subtitle */}
        <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Explore commercial design templates, AI prompt matrices, video assets, and software boilerplates. Instant cloud download with lifetime access.
        </p>

        {/* Compact Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Explore All Vaults</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDealsClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Flash Deals (₹149)</span>
          </button>
        </div>

        {/* Compact Proof Metrics Strip */}
        <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center font-mono">
          <div className="p-2.5 rounded-lg bg-slate-50/70">
            <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">50,000+</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Creative Assets</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/70">
            <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums flex items-center justify-center gap-1">
              4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Verified Rating</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/70">
            <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums flex items-center justify-center gap-1">
              <HardDriveDownload className="w-3.5 h-3.5 text-blue-600 inline" />
              Instant
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cloud Delivery</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/70">
            <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              100%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Commercial Use</div>
          </div>
        </div>
      </div>
    </section>
  );
};
