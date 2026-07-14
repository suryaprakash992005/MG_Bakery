import React, { useRef, useEffect, useCallback } from 'react';
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

// ── Single circle chip ─────────────────────────────────────────────────────────
interface CircleButtonProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  imageSrc?: string;
  isAllButton?: boolean;
}

const CircleButton: React.FC<CircleButtonProps> = ({ name, isActive, onClick, imageSrc, isAllButton }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group focus:outline-none"
    aria-label={`Filter by ${name}`}
    aria-pressed={isActive}
  >
    <motion.div
      animate={{
        borderColor: isActive ? '#C9A227' : '#ffffff',
        boxShadow: isActive
          ? '0 0 0 2.5px #C9A227, 0 6px 20px rgba(201,162,39,0.32)'
          : '0 3px 12px rgba(44,23,23,0.12)',
        scale: isActive ? 1.12 : 1,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden border-[3px] bg-brand-cream-100 flex items-center justify-center"
    >
      {isAllButton ? (
        <LayoutGrid
          size={30}
          strokeWidth={1.5}
          className={isActive ? 'text-brand-gold-700' : 'text-brand-brown-950'}
        />
      ) : (
        <img
          src={imageSrc}
          alt={name}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500"
        />
      )}
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

// ── Main component ─────────────────────────────────────────────────────────────
interface CategoryChipsProps {
  categories: string[];
  activeCategory: string;
  onChange: (cat: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  activeCategory,
  onChange,
}) => {
  const scrollRef        = useRef<HTMLDivElement>(null);
  const rafRef           = useRef<number | null>(null);
  const isUserActive     = useRef(false);   // true while user is interacting
  const resumeTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollLeft   = useRef(0);

  // Auto-scroll speed: pixels per animation frame (~60 fps → ~36 px/s)
  const SPEED = 0.6;

  const visibleCategories = categories.filter((n) => CATEGORY_IMAGES[n]);
  const allItems = visibleCategories.map((name) => ({
    name,
    isAllButton: false,
    imageSrc: CATEGORY_IMAGES[name],
  }));

  // ── RAF loop ──────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      if (!isUserActive.current) {
        // Advance by SPEED px each frame
        el.scrollLeft += SPEED;
      }

      // Seamless wrap: when we pass the halfway mark (end of copy-1),
      // snap back silently so the loop never ends.
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }
      // Also handle manual backward scroll past 0
      if (el.scrollLeft < 0) {
        el.scrollLeft += half;
      }

      lastScrollLeft.current = el.scrollLeft;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (resumeTimer.current !== null) clearTimeout(resumeTimer.current);
    };
  }, [tick]);

  // ── Pause / resume helpers ────────────────────────────────────────────────
  const pause = useCallback(() => {
    isUserActive.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const resumeAfter = useCallback((ms = 1800) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false;
    }, ms);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative overflow-hidden py-3"
      /* Soft fade mask on both edges */
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 7%, black 93%, transparent)',
        maskImage:       'linear-gradient(to right, transparent, black 7%, black 93%, transparent)',
      }}
    >
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-1"
        style={{
          scrollbarWidth:          'none',
          msOverflowStyle:         'none',
          WebkitOverflowScrolling: 'touch',
          cursor:                  'grab',
        }}

        /* ── Desktop: mouse-drag support ─────────────────────────── */
        onMouseEnter={pause}
        onMouseLeave={() => resumeAfter(800)}
        onMouseDown={(e) => {
          pause();
          const el = scrollRef.current;
          if (!el) return;
          const startX     = e.pageX - el.offsetLeft;
          const startScroll = el.scrollLeft;
          el.style.cursor  = 'grabbing';

          const onMove = (mv: MouseEvent) => {
            const dx = mv.pageX - e.pageX;
            el.scrollLeft = startScroll - dx;
          };
          const onUp = () => {
            el.style.cursor = 'grab';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            resumeAfter(1800);
          };
          // suppress unused variable warning
          void startX;
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}

        /* ── Mobile: touch-swipe support ─────────────────────────── */
        onTouchStart={pause}
        onTouchEnd={() => resumeAfter(1800)}
        onTouchCancel={() => resumeAfter(800)}
      >
        {/* Copy 1 — primary */}
        {allItems.map(({ name, isAllButton, imageSrc }) => (
          <CircleButton
            key={`a-${name}`}
            name={name}
            isActive={activeCategory === name}
            imageSrc={imageSrc}
            isAllButton={isAllButton}
            onClick={() => {
              pause();
              onChange(name);
              resumeAfter(2000);
            }}
          />
        ))}

        {/* Copy 2 — seamless continuation */}
        {allItems.map(({ name, isAllButton, imageSrc }) => (
          <CircleButton
            key={`b-${name}`}
            name={name}
            isActive={activeCategory === name}
            imageSrc={imageSrc}
            isAllButton={isAllButton}
            onClick={() => {
              pause();
              onChange(name);
              resumeAfter(2000);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryChips;
