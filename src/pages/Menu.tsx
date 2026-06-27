import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useBakeryDatabase } from '../context/DatabaseContext';
import ShinyText from '../components/ShinyText';
import PillFilters from '../components/PillFilters';
import { motion, AnimatePresence } from 'framer-motion';

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

  const filterCategories = ['All', ...sortedCategories];

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

  // Auto-scroll product section into view smoothly on mobile when typing
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const isMobile = window.innerWidth < 768;
      if (isMobile && productsGridRef.current) {
        const rect = productsGridRef.current.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        // Scroll slightly above the products grid to account for sticky search bar
        window.scrollTo({
          top: absoluteTop - 140,
          behavior: 'smooth'
        });
      }
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
      style={{ paddingBottom: isFocused ? '60vh' : '5rem' }} 
      className="pt-28 min-h-screen bg-brand-cream-50/10 transition-all duration-300"
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
                placeholder="Search cakes, puffs, cookies, coffee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  // Smoothly scroll the input into center view if on mobile
                  setTimeout(() => {
                    if (window.innerWidth < 768) {
                      searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-12 pr-6 py-4 rounded-full bg-white border border-brand-cream-200/80 text-brand-brown-950 placeholder-brand-brown-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-500/35 focus:border-brand-gold-500 transition-all"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <PillFilters
            items={filterCategories.map((category) => ({
              id: category,
              label: category
            }))}
            activeId={selectedCategory}
            onChange={setSelectedCategory}
            baseColor="#2C1717"
            pillColor="#ffffff"
            hoveredPillTextColor="#FAF8F5"
            pillTextColor="#5B3535"
          />
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
