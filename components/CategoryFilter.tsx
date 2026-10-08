'use client';

import React from 'react';
import { ProductCategory, DEFAULT_CATEGORIES } from '@/lib/types';
import {
  Sparkles,
  Layers,
  Briefcase,
  Mail,
  Code2,
  Video,
  BookOpen,
  LayoutGrid,
  Folder,
} from 'lucide-react';

export const ALL_CATEGORIES: string[] = [...DEFAULT_CATEGORIES];

interface CategoryFilterProps {
  selectedCategory: string; // 'ALL' or a category
  onSelectCategory: (cat: string) => void;
  counts: Record<string, number>;
  categories?: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
  categories = ALL_CATEGORIES,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'CONTENT CREATION & MEDIA ASSETS':
        return <Sparkles className="w-4 h-4 shrink-0" />;
      case 'GRAPHIC DESIGN & CREATIVE TEMPLATES':
        return <Layers className="w-4 h-4 shrink-0" />;
      case 'BUSINESS & DIGITAL MARKETING RESOURCES':
        return <Briefcase className="w-4 h-4 shrink-0" />;
      case 'EMAIL MARKETING MEGA BUNDLE':
        return <Mail className="w-4 h-4 shrink-0" />;
      case 'SOFTWARE, WORDPRESS & DEVELOPMENT TOOLS':
        return <Code2 className="w-4 h-4 shrink-0" />;
      case 'VIDEO & AUDIO PRODUCTION BUNDLE':
        return <Video className="w-4 h-4 shrink-0" />;
      case 'COURSES & EDUCATIONAL RESOURCES':
        return <BookOpen className="w-4 h-4 shrink-0" />;
      default:
        return <LayoutGrid className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-500 font-mono">
          Browse by Core Category
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          Showing {counts[selectedCategory] || counts['ALL'] || 0} Assets
        </span>
      </div>

      {/* Filter scroll bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 shadow-xs'
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span>ALL CATEGORIES</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              selectedCategory === 'ALL' ? 'bg-white text-blue-700 font-bold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts['ALL'] || 0}
          </span>
        </button>

        {/* Categories Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = counts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 shadow-xs'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-white text-blue-700 font-bold' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
