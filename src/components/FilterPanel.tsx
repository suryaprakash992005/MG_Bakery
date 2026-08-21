import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, ChevronDown, Check
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption =
  | 'popular'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'name-asc';

export interface FilterState {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  onlyAvailable: boolean;
  onlyEggless: boolean;
  onlyBestSeller: boolean;
  sort: SortOption;
}

export const defaultFilters: FilterState = {
  categories: [],
  priceMin: null,
  priceMax: null,
  onlyAvailable: false,
  onlyEggless: false,
  onlyBestSeller: false,
  sort: 'popular',
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'price-asc', label: '₹ Price: Low to High' },
  { value: 'price-desc', label: '₹ Price: High to Low' },
  { value: 'newest', label: '🆕 Newest First' },
  { value: 'name-asc', label: '🔤 Name: A to Z' },
];

const PRICE_RANGES = [
  { label: 'Under ₹100', min: null, max: 100 },
  { label: '₹100 – ₹300', min: 100, max: 300 },
  { label: '₹300 – ₹600', min: 300, max: 600 },
  { label: 'Above ₹600', min: 600, max: null },
];

// ─── Active Filter Count ──────────────────────────────────────────────────────

export const activeFilterCount = (filters: FilterState): number => {
  let count = 0;
  if (filters.onlyAvailable) count++;
  if (filters.onlyEggless) count++;
  if (filters.onlyBestSeller) count++;
  if (filters.priceMin !== null || filters.priceMax !== null) count++;
  if (filters.sort !== 'popular') count++;
  return count;
};

// ─── Filter Panel Component ───────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  availableCategories?: string[]; // reserved for future category filter chips
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters, onFiltersChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const count = activeFilterCount(filters);

  const update = (partial: Partial<FilterState>) =>
    onFiltersChange({ ...filters, ...partial });

  const setPriceRange = (min: number | null, max: number | null) => {
    // Toggle: if same range already selected, clear it
    if (filters.priceMin === min && filters.priceMax === max) {
      update({ priceMin: null, priceMax: null });
    } else {
      update({ priceMin: min, priceMax: max });
    }
  };

  const handleReset = () => onFiltersChange(defaultFilters);

  return (
    <>
      {/* Trigger Row */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Filter Button */}
        <button
          onClick={() => setIsOpen(true)}
          className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold border-2 cursor-pointer transition-all shrink-0 ${
            count > 0
              ? 'bg-[#2A0E0A] text-[#FAF7F2] border-[#2A0E0A] shadow-md'
              : 'bg-white text-[#2A0E0A] border-[#2C1A17]/15 hover:border-[#C9A227]/50'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Filters</span>
          {count > 0 && (
            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#C9A227] text-[#2A0E0A] rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center">
              {count}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className={`flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold border-2 cursor-pointer transition-all shrink-0 ${
              filters.sort !== 'popular'
                ? 'bg-[#C9A227]/10 border-[#C9A227] text-[#2A0E0A]'
                : 'bg-white text-[#2A0E0A] border-[#2C1A17]/15 hover:border-[#C9A227]/40'
            }`}
          >
            <span className="truncate max-w-[110px] sm:max-w-none">
              {SORT_OPTIONS.find(o => o.value === filters.sort)?.label || 'Sort'}
            </span>
            <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 z-50 bg-white border border-[#2C1A17]/10 rounded-2xl shadow-xl overflow-hidden w-48 sm:w-52"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { update({ sort: opt.value }); setShowSortDropdown(false); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold cursor-pointer hover:bg-[#FAF6F0] transition-colors ${
                        filters.sort === opt.value ? 'text-[#2A0E0A] font-bold bg-[#FAF6F0]' : 'text-[#2C1A17]/70'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {filters.sort === opt.value && <Check className="w-3.5 h-3.5 text-[#C9A227]" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Active filter reset */}
        {count > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-700 px-2.5 py-2 rounded-full hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-all shrink-0"
          >
            <X className="w-3 h-3" /> Clear ({count})
          </button>
        )}
      </div>

      {/* Filter Sheet (Mobile + Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#2A0E0A]/40 backdrop-blur-sm z-[90] cursor-pointer"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[91] bg-white rounded-t-[2rem] shadow-2xl max-h-[85dvh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-[#2C1A17]/10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#2A0E0A]">Filter & Sort</h3>
                  {count > 0 && (
                    <p className="text-[10px] text-[#C9A227] font-semibold">{count} filter{count !== 1 ? 's' : ''} applied</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {count > 0 && (
                    <button
                      onClick={handleReset}
                      className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4 text-[#2A0E0A]" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6 pb-8">
                {/* Sort */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#2C1A17]/60 uppercase tracking-widest block">Sort By</label>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => update({ sort: opt.value })}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold border-2 cursor-pointer transition-all ${
                          filters.sort === opt.value
                            ? 'bg-[#2A0E0A] text-[#C9A227] border-[#2A0E0A]'
                            : 'bg-white text-[#2C1A17]/70 border-[#2C1A17]/15 hover:border-[#C9A227]/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#2C1A17]/60 uppercase tracking-widest block">Quick Filters</label>
                  <div className="space-y-2">
                    {[
                      { key: 'onlyAvailable', label: '✅ In Stock Only' },
                      { key: 'onlyEggless', label: '🌿 Eggless Only' },
                      { key: 'onlyBestSeller', label: '🔥 Best Sellers' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => update({ [key]: !filters[key as keyof FilterState] })}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                          filters[key as keyof FilterState]
                            ? 'bg-[#C9A227]/10 border-[#C9A227] text-[#2A0E0A]'
                            : 'bg-[#FAF6F0] border-transparent text-[#2C1A17]/70 hover:border-[#C9A227]/30'
                        }`}
                      >
                        {label}
                        {filters[key as keyof FilterState] && <Check className="w-4 h-4 text-[#C9A227]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#2C1A17]/60 uppercase tracking-widest block">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICE_RANGES.map(r => {
                      const isSelected = filters.priceMin === r.min && filters.priceMax === r.max;
                      return (
                        <button
                          key={r.label}
                          onClick={() => setPriceRange(r.min, r.max)}
                          className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#2A0E0A] text-[#C9A227] border-[#2A0E0A]'
                              : 'bg-[#FAF6F0] text-[#2C1A17]/70 border-transparent hover:border-[#C9A227]/30'
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#2C1A17]/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-[#2A0E0A] text-[#C9A227] font-bold py-3.5 sm:py-4 rounded-full cursor-pointer hover:bg-[#401C16] transition-all active:scale-95 text-xs sm:text-sm shadow-md"
                >
                  Apply Filters {count > 0 && `(${count} active)`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
