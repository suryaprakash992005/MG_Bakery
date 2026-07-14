import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FoodOrderCard } from '../components/FoodOrderCard';
import { CategoryChips } from '../components/CategoryChips';
import { useBakeryDatabase } from '../context/DatabaseContext';
import ShinyText from '../components/ShinyText';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Skeleton card (matches FoodOrderCard dimensions) ────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-brand-cream-100/60 overflow-hidden animate-pulse">
    <div className="flex items-stretch gap-3 p-3 sm:p-3.5">
      <div className="flex-1 flex flex-col gap-2 py-0.5">
        <div className="flex gap-1.5">
          <div className="h-3.5 w-14 bg-brand-cream-100 rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-brand-cream-100 rounded-lg" />
        <div className="h-3 w-full bg-brand-cream-50 rounded-lg" />
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="h-5 w-12 bg-brand-cream-100 rounded-lg" />
          <div className="h-8 w-20 bg-brand-cream-100 rounded-full" />
        </div>
      </div>
      <div className="w-[108px] h-[108px] rounded-2xl bg-brand-cream-100 flex-shrink-0" />
    </div>
  </div>
);

// ─── Skeleton card for desktop ProductCard grid ───────────────────────────────
const SkeletonCardDesktop: React.FC = () => (
  <div className="bg-white rounded-[1.5rem] border border-brand-cream-100/60 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-brand-cream-100" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-5 w-3/4 bg-brand-cream-100 rounded-lg" />
      <div className="h-3 w-full bg-brand-cream-50 rounded-lg" />
      <div className="h-3 w-2/3 bg-brand-cream-50 rounded-lg" />
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-cream-50">
        <div className="h-6 w-16 bg-brand-cream-100 rounded-lg" />
        <div className="h-9 w-28 bg-brand-cream-100 rounded-full" />
      </div>
    </div>
  </div>
);

// ─── Visibility helper (preserves existing logic exactly) ─────────────────────
const isCurrentlyVisible = (p: {
  isDeleted?: boolean;
  status?: string;
  publishDate?: string;
  visibilityExpiryDate?: string;
}): boolean => {
  if (p.isDeleted) return false;
  if (p.status === 'Hidden') return false;
  const todayStr = new Date().toISOString().split('T')[0];
  if (p.publishDate && p.publishDate > todayStr) return false;
  if (p.visibilityExpiryDate && p.visibilityExpiryDate < todayStr) return false;
  return true;
};

// ─── Menu Page ─────────────────────────────────────────────────────────────────
export const Menu: React.FC = () => {
  const { products, categories } = useBakeryDatabase();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery,      setSearchQuery]       = useState<string>('');
  const [isFocused,        setIsFocused]         = useState<boolean>(false);
  const [scrollProgress,   setScrollProgress]    = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const productsRef    = useRef<HTMLDivElement>(null);

  // ── Scroll progress bar ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Category list (sorted by displayPriority) ────────────────────────────────
  const sortedCategories = useMemo(
    () =>
      [...categories]
        .sort((a, b) => (a.displayPriority ?? 9999) - (b.displayPriority ?? 9999))
        .map((c) => c.name),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.map((c) => c.name).join(',')],
  );

  // ── Filtered + sorted products (preserves existing filter logic exactly) ─────
  const filteredProducts = useMemo(
    () =>
      products
        .filter((product) => {
          if (!isCurrentlyVisible(product)) return false;
          const matchesCategory =
            selectedCategory === 'All' || product.category === selectedCategory;
          const q = searchQuery.toLowerCase();
          const matchesSearch =
            product.name.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q);
          return matchesCategory && matchesSearch;
        })
        .sort((a, b) => (a.displayPriority ?? 9999) - (b.displayPriority ?? 9999)),
    [products, selectedCategory, searchQuery],
  );

  // ── Smooth scroll to product list after category/search change ───────────────
  const scrollToProducts = useCallback(() => {
    if (window.innerWidth < 1024 && productsRef.current) {
      setTimeout(() => {
        const rect = productsRef.current?.getBoundingClientRect();
        if (rect) {
          window.scrollTo({
            top: rect.top + window.scrollY - 155,
            behavior: 'smooth',
          });
        }
      }, 120);
    }
  }, []);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      setSelectedCategory(cat);
      scrollToProducts();
    },
    [scrollToProducts],
  );

  // Auto-scroll to products when user starts typing (mobile UX)
  useEffect(() => {
    if (searchQuery.trim()) scrollToProducts();
  }, [searchQuery, scrollToProducts]);

  // Auto-blur keyboard when only 1 result left
  useEffect(() => {
    if (searchQuery.trim() && filteredProducts.length === 1) {
      const t = setTimeout(() => searchInputRef.current?.blur(), 300);
      return () => clearTimeout(t);
    }
  }, [filteredProducts.length, searchQuery]);

  const isLoading   = products.length === 0;
  const hasNoResult = !isLoading && filteredProducts.length === 0;
  const hasResults  = !isLoading && filteredProducts.length > 0;

  return (
    <div
      className="min-h-dvh bg-brand-cream-50/10"
      style={{ paddingBottom: isFocused ? '55dvh' : '7rem' }}
    >
      {/* ── Scroll Progress Indicator ──────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 z-[999] h-[2.5px] bg-gradient-to-r from-brand-gold-850 via-brand-gold-700 to-amber-400 origin-left pointer-events-none transition-none"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden
      />

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="pt-20 sm:pt-24 pb-6 text-center px-4">
        <div className="inline-flex items-center gap-1 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-3">
          <Sparkles className="w-3 h-3" aria-hidden />
          <span>Delicately Handcrafted</span>
        </div>

        <h1 className="text-center">
          <ShinyText
            text="Our Bakery & Chat Menu"
            disabled={false}
            speed={3}
            className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold"
            color="#2C1717"
            shineColor="#D4AF37"
            spread={120}
            yoyo={false}
            pauseOnHover={false}
            direction="left"
            delay={1}
          />
        </h1>

        <p className="text-sm text-brand-brown-800/60 font-light mt-3 max-w-md mx-auto">
          Browse through our daily selections. Baked fresh every morning and served with love.
        </p>
      </div>

      {/* ── Sticky Search + Category Chips Bar ─────────────────────────────── */}
      {/* On mobile: sticks at top-0 (no full-width navbar on mobile).
          On desktop: sticks at top-[72px] below the fixed navbar. */}
      <div className="sticky top-0 lg:top-[72px] z-30 bg-brand-cream-50/96 backdrop-blur-md border-b border-brand-cream-200/60 shadow-[0_1px_12px_rgba(44,23,23,0.06)]">
        {/* Search bar */}
        <div className="px-3 sm:px-5 pt-2.5 pb-1 max-w-7xl mx-auto">
          <div className="relative max-w-lg mx-auto lg:mx-0">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown-800/40 pointer-events-none"
              aria-hidden
            />
            <input
              ref={searchInputRef}
              id="menu-search"
              type="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search cakes, pizza, milkshake, coffee…"
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-brand-cream-200 text-brand-brown-950 placeholder-brand-brown-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-500/30 focus:border-brand-gold-500 transition-all"
              aria-label="Search products"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-cream-200 hover:bg-brand-cream-300 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3 text-brand-brown-700" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category chips scrollable row */}
        <div className="max-w-7xl mx-auto">
          <CategoryChips
            categories={sortedCategories}
            activeCategory={selectedCategory}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* ── Results Meta Row ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 sm:px-5 lg:px-8 py-2.5 max-w-7xl mx-auto">
        <motion.span
          key={`${filteredProducts.length}-${isLoading}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs font-medium text-brand-brown-800/50"
        >
          {isLoading
            ? 'Loading menu…'
            : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}${
                selectedCategory !== 'All' && !searchQuery ? ` in ${selectedCategory}` : ''
              }`}
        </motion.span>

        <AnimatePresence>
          {(searchQuery || selectedCategory !== 'All') && (
            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-xs font-semibold text-brand-gold-700 hover:underline cursor-pointer"
            >
              Clear filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Products Area ───────────────────────────────────────────────────── */}
      <div
        ref={productsRef}
        className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8"
      >

        {/* ── SKELETON LOADING ──────────────────────────────────────────────── */}
        {isLoading && (
          <>
            {/* Mobile / Tablet skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCardDesktop key={i} />
              ))}
            </div>
          </>
        )}

        {/* ── NO RESULTS ────────────────────────────────────────────────────── */}
        {hasNoResult && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center py-20 bg-white rounded-[2rem] border border-brand-cream-100/50 max-w-sm mx-auto mt-4"
          >
            <div
              className="text-5xl mb-4 inline-block"
              style={{ animation: 'bounce 1.5s ease-in-out infinite' }}
              aria-hidden
            >
              🍽️
            </div>
            <p className="text-brand-brown-800/70 font-semibold text-base">
              Nothing found
            </p>
            <p className="text-brand-brown-800/40 text-sm mt-1 font-light">
              Try a different category or search term
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-5 text-xs font-bold bg-brand-brown-950 text-brand-cream-50 px-6 py-2.5 rounded-full hover:bg-brand-brown-900 active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* ── PRODUCTS ──────────────────────────────────────────────────────── */}
        {hasResults && (
          <>
            {/* ── Mobile / Tablet: FoodOrderCard horizontal list ─────────── */}
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={`m-${product.id}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.22,
                      delay: Math.min(index * 0.035, 0.28),
                    }}
                    viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <FoodOrderCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── Desktop: existing compact ProductCard grid ──────────────── */}
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={`d-${product.id}`}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.28,
                      delay: Math.min(index * 0.04, 0.32),
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Keyframe for no-results bounce */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};
