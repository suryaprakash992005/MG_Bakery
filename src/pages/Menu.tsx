import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data';
import ShinyText from '../components/ShinyText';
import PillFilters from '../components/PillFilters';

export const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterCategories = ['All', ...CATEGORIES];

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen bg-brand-cream-50/10">
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
          {/* Search bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-brown-800/40" />
            <input
              type="text"
              placeholder="Search cakes, puffs, cookies, coffee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-full bg-white border border-brand-cream-200/80 text-brand-brown-950 placeholder-brand-brown-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold-500/35 focus:border-brand-gold-500 transition-all shadow-sm"
            />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
