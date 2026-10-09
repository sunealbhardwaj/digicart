'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Currency, CATEGORY_TAXONOMY } from '@/lib/types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  currency,
  onCurrencyChange,
  searchQuery,
  onSearchChange,
  selectedCategory = 'ALL',
  onCategorySelect,
  categoryCounts = {},
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (categoryName: string) => {
    setOpenDropdown(null);
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* 1. Main Header Bar: Brand, Search, Currency, Cart (Compact h-14) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            onClick={() => handleSelect('ALL')}
            className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:opacity-90 transition-opacity"
          >
            <span className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
            </span>
            <span className="font-extrabold tracking-tight">
              APEX<span className="text-blue-600">DIGITAL</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search prompts, templates, bundles..."
              className="w-full bg-slate-100/80 hover:bg-slate-100 text-xs text-slate-900 placeholder-slate-400 rounded-lg pl-9 pr-8 py-2 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions (Search on mobile, Currency, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Compact Currency Switcher */}
          <div className="flex items-center rounded-md bg-slate-100 p-0.5 text-xs font-mono font-medium">
            <button
              type="button"
              onClick={() => onCurrencyChange('INR')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                currency === 'INR'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₹
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('EUR')}
              className={`hidden sm:inline-block px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                currency === 'EUR'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              €
            </button>
          </div>

          {/* Compact Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search expanded input */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-2.5 pt-1 border-t border-slate-100 bg-white">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search prompts, templates, bundles..."
              autoFocus
              className="w-full bg-slate-100 text-xs text-slate-900 placeholder-slate-400 rounded-lg pl-9 pr-8 py-2 border border-slate-200 focus:outline-none focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Compact Category Navigation Row (Centered & Standard In-Place Dropdowns) */}
      <div className="border-t border-slate-100 bg-white relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className={`flex items-center justify-start sm:justify-center gap-1 sm:gap-2 lg:gap-3.5 h-10 text-xs scrollbar-none ${
              openDropdown ? 'overflow-visible' : 'overflow-x-auto sm:overflow-visible'
            }`}
          >
            {/* All Products */}
            <button
              type="button"
              onClick={() => handleSelect('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer font-medium ${
                selectedCategory === 'ALL'
                  ? 'text-blue-600 font-semibold bg-blue-50/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>

            {/* Taxonomy Groups with Standard Dropdowns */}
            {CATEGORY_TAXONOMY.groups.map((group) => {
              const isGroupActive =
                selectedCategory === group.name ||
                group.subcategories.includes(selectedCategory);
              const isOpen = openDropdown === group.name;

              return (
                <div
                  key={group.name}
                  className={`relative shrink-0 ${isOpen ? 'z-50' : 'z-20'}`}
                  onMouseEnter={() => setOpenDropdown(group.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : group.name)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium whitespace-nowrap ${
                      isGroupActive
                        ? 'text-blue-600 font-semibold bg-blue-50/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <span>{group.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {/* Standard In-Place Dropdown Menu (No Lightbox, No Backdrop) */}
                  {isOpen && (
                    <div className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 pt-1 w-60 sm:w-64 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                        {/* Option to view all items in group */}
                        <button
                          type="button"
                          onClick={() => handleSelect(group.name)}
                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 cursor-pointer"
                        >
                          <span>All {group.name}</span>
                          {categoryCounts[group.name] !== undefined && (
                            <span className="text-[11px] text-slate-400 font-mono font-normal">
                              {categoryCounts[group.name]}
                            </span>
                          )}
                        </button>

                        {/* List of subcategories */}
                        <div className="py-1 max-h-72 overflow-y-auto">
                          {group.subcategories.map((sub) => {
                            const isSubSelected = selectedCategory === sub;
                            const count = categoryCounts[sub] || 0;
                            return (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => handleSelect(sub)}
                                className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  isSubSelected
                                    ? 'text-blue-600 font-semibold bg-blue-50/70'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <span>{sub}</span>
                                {count > 0 && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="h-3.5 w-px bg-slate-200 mx-1 shrink-0" />

            {/* Special Collections */}
            {CATEGORY_TAXONOMY.specialCollections.map((col) => {
              const isActive = selectedCategory === col;
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => handleSelect(col)}
                  className={`px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer font-medium whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 font-semibold bg-blue-50/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
