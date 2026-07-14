import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

// ── Category photo map ────────────────────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  'Cakes':              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80',
  'Pastries':           'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80',
  'Cookies':            'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=200&q=80',
  'Puffs':              'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=200&q=80',
  'Breads':             'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
  'Snacks':             'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=200&q=80',
  'Beverages':          'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=200&q=80',
  'Fast Food':          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
  'Buffs':              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80',
  'Tea Coffee':         'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=200&q=80',
  'Lemon Juice':        'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=200&q=80',
  'Ice Creams':         'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=200&q=80',
  'Special Ice Creams': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=200&q=80',
  'Fresh Juice':        'https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=200&q=80',
  'Milk Shakes':        'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=200&q=80',
  'Roll Items':         'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=200&q=80',
  'Special Milkshakes': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=200&q=80',
  'Pizza':              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
  'Burger':             'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
  'Sandwich':           'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=200&q=80',
  'Cutlet':             'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=200&q=80',
  'Oil Fry':            'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
  'Mocktails':          'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80',
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

  // Only show "All" + categories that have an image
  const visibleCategories = categories.filter((name) => CATEGORY_IMAGES[name]);

  // Auto-scroll active item to centre when activeCategory changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (!activeBtn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const targetLeft =
      container.scrollLeft +
      (btnRect.left - containerRect.left) -
      containerRect.width / 2 +
      btnRect.width / 2;
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label="Filter menu by category"
      className="flex items-start gap-4 overflow-x-auto py-3 px-4 sm:px-6"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory',
      }}
    >
      {/* "All" chip — uses icon instead of photo */}
      <button
        role="tab"
        aria-selected={activeCategory === 'All'}
        data-active={activeCategory === 'All'}
        onClick={() => onChange('All')}
        className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group focus:outline-none"
        style={{ scrollSnapAlign: 'start' }}
        aria-label="Show all categories"
      >
        <motion.div
          animate={{
            borderColor: activeCategory === 'All' ? '#C9A227' : '#ffffff',
            boxShadow:
              activeCategory === 'All'
                ? '0 0 0 2px #C9A227, 0 6px 20px rgba(201,162,39,0.30)'
                : '0 3px 12px rgba(44,23,23,0.12)',
            scale: activeCategory === 'All' ? 1.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-[3px] bg-brand-cream-100 flex items-center justify-center"
        >
          <LayoutGrid
            size={30}
            strokeWidth={1.5}
            className={activeCategory === 'All' ? 'text-brand-gold-700' : 'text-brand-brown-950'}
          />
        </motion.div>
        <span
          className="text-[9px] sm:text-[10px] leading-tight text-center max-w-[76px] truncate transition-colors duration-200"
          style={{
            fontWeight: activeCategory === 'All' ? 700 : 500,
            color: activeCategory === 'All' ? '#C9A227' : '#5B3535',
            fontFamily: 'var(--font-playfair, serif)',
          }}
        >
          All
        </span>
      </button>

      {/* Category photo circles */}
      {visibleCategories.map((name) => {
        const isActive = activeCategory === name;
        return (
          <button
            key={name}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => onChange(name)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group focus:outline-none"
            style={{ scrollSnapAlign: 'start' }}
            aria-label={`Filter by ${name}`}
          >
            <motion.div
              animate={{
                borderColor: isActive ? '#C9A227' : '#ffffff',
                boxShadow: isActive
                  ? '0 0 0 2px #C9A227, 0 6px 20px rgba(201,162,39,0.30)'
                  : '0 3px 12px rgba(44,23,23,0.12)',
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-[3px]"
            >
              <img
                src={CATEGORY_IMAGES[name]}
                alt={name}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
            <span
              className="text-[9px] sm:text-[10px] leading-tight text-center max-w-[76px] truncate transition-colors duration-200"
              style={{
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#C9A227' : '#5B3535',
                fontFamily: 'var(--font-playfair, serif)',
              }}
            >
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChips;
