import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Emoji map for all 23 bakery categories
const CATEGORY_EMOJIS: Record<string, string> = {
  'All':                '🏠',
  'Cakes':              '🍰',
  'Pastries':           '🥐',
  'Cookies':            '🍪',
  'Puffs':              '🫓',
  'Breads':             '🍞',
  'Snacks':             '🍟',
  'Beverages':          '🥤',
  'Fast Food':          '🍔',
  'Buffs':              '🌯',
  'Tea Coffee':         '☕',
  'Lemon Juice':        '🍋',
  'Ice Creams':         '🍦',
  'Special Ice Creams': '🍨',
  'Fresh Juice':        '🧃',
  'Milk Shakes':        '🥛',
  'Roll Items':         '🌮',
  'Special Milkshakes': '🍫',
  'Pizza':              '🍕',
  'Burger':             '🍔',
  'Sandwich':           '🥪',
  'Cutlet':             '🍘',
  'Oil Fry':            '🍤',
  'Mocktails':          '🍹',
};

interface CategoryChipsProps {
  /** Sorted category names from the database (no "All") */
  categories: string[];
  activeCategory: string;
  onChange: (cat: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  activeCategory,
  onChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const allCategories = ['All', ...categories];

  // Auto-scroll active chip into the center of the container whenever it changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (!activeBtn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const targetScrollLeft =
      container.scrollLeft +
      (btnRect.left - containerRect.left) -
      containerRect.width / 2 +
      btnRect.width / 2;
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label="Filter by category"
      className="flex items-center gap-1.5 overflow-x-auto px-3 sm:px-5 py-2"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory',
      }}
    >
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat;
        const emoji = CATEGORY_EMOJIS[cat] ?? '🍽️';
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => onChange(cat)}
            className={`relative flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap cursor-pointer select-none
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-500/60 transition-colors duration-150
              ${isActive
                ? 'text-brand-brown-950'
                : 'text-brand-brown-800/65 hover:text-brand-brown-950 hover:bg-brand-cream-100'
              }`}
            style={{ scrollSnapAlign: 'start' }}
            aria-label={`Filter by ${cat}`}
          >
            {/* Animated background pill for active state */}
            {isActive && (
              <motion.span
                layoutId="activeCategoryChip"
                className="absolute inset-0 rounded-full bg-brand-gold-850/20 border border-brand-gold-850/35"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 text-sm leading-none" aria-hidden>
              {emoji}
            </span>
            <span className="relative z-10">{cat}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
