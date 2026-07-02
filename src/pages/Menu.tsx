import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Sparkles, LayoutGrid } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useBakeryDatabase } from '../context/DatabaseContext';
import ShinyText from '../components/ShinyText';
import { motion, AnimatePresence } from 'framer-motion';
import LogoLoop from '../components/LogoLoop';
import type { LogoItem } from '../components/LogoLoop';


// Stable module-level image map for all 23 categories
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
export const Menu: React.FC = () => {
  const { products, categories } = useBakeryDatabase();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const productsGridRef = useRef<HTMLDivElement>(null);

  // Sort categories by displayPriority
  const sortedCategories = [...categories]
    .sort((a, b) => (a.displayPriority || 9999) - (b.displayPriority || 9999))
    .map(c => c.name);



  // Build stable LogoLoop items from sorted categories — 'All' first as a special node
  const logoLoopItems = useMemo<LogoItem[]>(() => [
    { node: <LayoutGrid size={36} strokeWidth={1.5} className="text-brand-brown-950" />, title: 'All' },
    ...sortedCategories
      .filter(name => CATEGORY_IMAGES[name])
      .map(name => ({ src: CATEGORY_IMAGES[name], alt: name, title: name })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [sortedCategories.join(',')]);

  const isCurrentlyVisible = (p: any): boolean => {
    if (p.isDeleted) return false;
    if (p.status === 'Hidden') return false;

    const todayStr = new Date().toISOString().split('T')[0];
    if (p.publishDate && p.publishDate > todayStr) return false;
    if (p.visibilityExpiryDate && p.visibilityExpiryDate < todayStr) return false;
    return true;
  };

  const filteredProducts = products
    .filter((product) => {
      if (!isCurrentlyVisible(product)) return false;

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (a.displayPriority || 9999) - (b.displayPriority || 9999));

  const scrollToProducts = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && productsGridRef.current) {
      setTimeout(() => {
        const rect = productsGridRef.current?.getBoundingClientRect();
        if (rect) {
          const absoluteTop = rect.top + window.scrollY;
          window.scrollTo({
            top: absoluteTop - 130,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  };

  // Auto-scroll product section into view smoothly on mobile when typing
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      scrollToProducts();
    }
  }, [searchQuery]);

  // If only one product matches search result, automatically close keyboard (blur)
  useEffect(() => {
    if (searchQuery.trim() !== '' && filteredProducts.length === 1) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filteredProducts.length, searchQuery]);

  return (
    <div 
      style={{ paddingBottom: isFocused ? '60dvh' : '5rem' }} 
      className="pt-28 min-h-dvh-locked bg-brand-cream-50/10 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-3">
            <Sparkles className="w-3 h-3" />
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
          <p className="text-sm text-brand-brown-800/60 font-light mt-4">
            Browse through our daily selections. Baked fresh every morning and served with love.
          </p>
        </div>

        {/* Search and Filters Layout */}
        <div className="space-y-8 mb-12">
          {/* Search bar wrapper with sticky positioning on mobile */}
          <div className="sticky top-[76px] md:relative md:top-auto z-20 max-w-lg mx-auto bg-brand-cream-50/90 backdrop-blur-md py-3 px-4 -mx-4 sm:mx-0 sm:px-1 rounded-2xl transition-all shadow-sm focus-within:shadow-md border border-transparent">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-brown-800/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  scrollToProducts();
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Search cakes, pizza, burger, milkshake, coffee..."
                className="w-full pl-12 pr-6 py-4 rounded-full bg-white border border-brand-cream-200/80 text-brand-brown-950 placeholder-brand-brown-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-500/35 focus:border-brand-gold-500 transition-all"
              />
            </div>
          </div>

          {/* ── Category Image Selector (LogoLoop) ── */}
          <div className="relative" style={{ height: '108px', overflow: 'visible' }}>
            <div style={{ height: '108px', overflow: 'hidden', position: 'relative' }}>
              <LogoLoop
                logos={logoLoopItems}
                speed={60}
                direction="left"
                logoHeight={80}
                gap={20}
                hoverSpeed={0}
                fadeOut
                fadeOutColor="#FAF9F6"
                ariaLabel="Filter menu by category"
                className="menu-cat-loop"
                renderItem={useCallback((item: LogoItem, key: React.Key) => {
                  const name = (item as { title?: string }).title ?? '';
                  const isActive = selectedCategory === name;
                  const imgSrc = (item as { src?: string }).src;
                  const isNode = !imgSrc;
                  return (
                    <button
                      key={String(key)}
                      title={name}
                      aria-label={`Filter by ${name}`}
                      onClick={() => {
                        setSelectedCategory(name);
                        scrollToProducts();
                      }}
                      style={{
                        flexShrink: 0,
                        width: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: isActive ? '3px solid #D4AF37' : '3px solid #ffffff',
                          boxShadow: isActive
                            ? '0 0 0 2px #D4AF37, 0 6px 20px rgba(212,175,55,0.35)'
                            : '0 3px 12px rgba(44,23,23,0.12)',
                          transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          background: isNode ? '#FAF5EC' : undefined,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isNode
                          ? (item as { node: React.ReactNode }).node
                          : <img src={imgSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} draggable={false} loading="lazy" />
                        }
                      </div>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#D4AF37' : '#5B3535',
                          letterSpacing: '0.03em',
                          whiteSpace: 'nowrap',
                          maxWidth: '76px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2,
                          transition: 'color 0.2s ease',
                          fontFamily: 'var(--font-playfair, serif)',
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  );
                }, [selectedCategory, setSelectedCategory, scrollToProducts])}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-2">
          <span className="text-xs font-medium text-brand-brown-800/50">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-brand-gold-700 hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            ref={productsGridRef}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-brand-cream-100/50 max-w-xl mx-auto">
            <p className="text-brand-brown-800/60 font-light text-base">
              No products found matching your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-xs font-bold bg-brand-brown-950 text-brand-cream-50 px-5 py-2 rounded-full hover:bg-brand-brown-900 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
