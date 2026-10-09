'use client';

import React from 'react';
import { CATEGORY_TAXONOMY } from '@/lib/types';
import { ChevronRight, X } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  counts: Record<string, number>;
  categories?: string[];
}

export const ALL_CATEGORIES = [
  ...CATEGORY_TAXONOMY.groups.flatMap((g) => g.subcategories),
  'MEGA BUNDLES',
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  // If 'ALL' is selected, don't show any duplicate box in the body
  if (selectedCategory === 'ALL') {
    return null;
  }

  // Find if a parent group or one of its subcategories is selected
  const activeGroup = CATEGORY_TAXONOMY.groups.find(
    (g) => g.name === selectedCategory || g.subcategories.includes(selectedCategory)
  );

  return (
    <div className="w-full bg-white rounded-lg p-3 border border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-500 font-medium">Filtering by:</span>
        {activeGroup && activeGroup.name !== selectedCategory && (
          <>
            <button
              onClick={() => onSelectCategory(activeGroup.name)}
              className="text-slate-700 hover:text-blue-600 font-medium cursor-pointer"
            >
              {activeGroup.name}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </>
        )}
        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {selectedCategory}
        </span>
        {counts[selectedCategory] !== undefined && (
          <span className="text-slate-400 font-mono text-[11px]">
            ({counts[selectedCategory]} items)
          </span>
        )}
      </div>

      {/* Subcategories quick filter pills if activeGroup exists */}
      {activeGroup && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => onSelectCategory(activeGroup.name)}
            className={`px-2 py-1 rounded text-xs transition-colors shrink-0 cursor-pointer ${
              selectedCategory === activeGroup.name
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All {activeGroup.name}
          </button>
          {activeGroup.subcategories.map((sub) => {
            const isSubSelected = selectedCategory === sub;
            return (
              <button
                key={sub}
                onClick={() => onSelectCategory(sub)}
                className={`px-2 py-1 rounded text-xs transition-colors shrink-0 cursor-pointer ${
                  isSubSelected
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => onSelectCategory('ALL')}
        className="flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-medium cursor-pointer shrink-0 transition-colors"
      >
        <span>Clear filter</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
