import React, { useState, useRef } from 'react';
import { Star, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useBakeryDatabase } from '../context/DatabaseContext';
import CurvedLoop from '../components/CurvedLoop';
import FlowingSelect from '../components/FlowingSelect';
import { ParticleCard, GlobalSpotlight } from '../components/MagicBento';

const FLAVOR_OPTIONS = [
  { value: 'All', label: 'All Flavors', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80' },
  { value: 'Chocolate & Truffle', label: 'Chocolate & Truffle', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80' },
  { value: 'Fruit & Berry', label: 'Fruit & Berry', image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=150&q=80' },
  { value: 'Traditional & Fusion', label: 'Traditional & Fusion', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=150&q=80' },
  { value: 'Specialty', label: 'Specialty', image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=150&q=80' }
];

const PRICE_OPTIONS = [
  { value: 'All', label: 'All Prices', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=150&q=80' },
  { value: 'under-400', label: 'Under ₹400', image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=150&q=80' },
  { value: '400-800', label: '₹400 - ₹800', image: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=150&q=80' },
  { value: 'above-800', label: 'Above ₹800', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=150&q=80' }
];

const WEIGHT_OPTIONS = [
  { value: 'All', label: 'All Sizes', image: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=150&q=80' },
  { value: 'piece', label: 'Slices / Pieces', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=150&q=80' },
  { value: 'halfKg', label: '½ Kg Options', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=150&q=80' },
  { value: 'oneKg', label: '1 Kg Options', image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=150&q=80' }
];


export const Cakes: React.FC = () => {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const productsGridRef = useRef<HTMLDivElement>(null);
  const [selectedWeight, setSelectedWeight] = useState<string>('All');

  const { products } = useBakeryDatabase();

  const isCurrentlyVisible = (p: any): boolean => {
    if (p.isDeleted) return false;
    if (p.status === 'Hidden') return false;

    const todayStr = new Date().toISOString().split('T')[0];
    if (p.publishDate && p.publishDate > todayStr) return false;
    if (p.visibilityExpiryDate && p.visibilityExpiryDate < todayStr) return false;
    return true;
  };

  // Filter celebration cakes and sort by displayPriority
  const cakeProducts = products
    .filter((p) => p.category === 'Cakes' && isCurrentlyVisible(p))
    .sort((a, b) => (a.displayPriority || 9999) - (b.displayPriority || 9999));

  const filteredCakes = cakeProducts.filter((cake) => {
    // 1. Flavor Filter
    const matchesFlavor =
      selectedFlavor === 'All' || cake.tags?.includes(selectedFlavor);

    // 2. Price Filter (based on 1/2 kg price if available, otherwise first tier)
    const getRepresentativePrice = (): number => {
      if (typeof cake.price === 'number') return cake.price;
      const priceObj = cake.price as any;
      return priceObj.halfKg || priceObj.piece || 0;
    };
    const priceVal = getRepresentativePrice();
    let matchesPrice = true;
    if (selectedPriceRange === 'under-400') {
      matchesPrice = priceVal < 400;
    } else if (selectedPriceRange === '400-800') {
      matchesPrice = priceVal >= 400 && priceVal <= 800;
    } else if (selectedPriceRange === 'above-800') {
      matchesPrice = priceVal > 800;
    }

    // 3. Weight Filter (checks if specific price tier exists)
    let matchesWeight = true;
    if (typeof cake.price === 'object') {
      const priceObj = cake.price as any;
      if (selectedWeight === 'piece') {
        matchesWeight = !!priceObj.piece;
      } else if (selectedWeight === 'halfKg') {
        matchesWeight = !!priceObj.halfKg;
      } else if (selectedWeight === 'oneKg') {
        matchesWeight = !!priceObj.oneKg;
      }
    } else if (selectedWeight !== 'All') {
      // If it's a number, it doesn't have multiple tiers
      matchesWeight = false;
    }

    return matchesFlavor && matchesPrice && matchesWeight;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen bg-brand-cream-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-3">
            <Star className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
            <span>Luxury Cake Boutique</span>
          </div>
          <CurvedLoop
            marqueeText="Celebration Cake Collections ✦ "
            speed={1.5}
            curveAmount={90}
            interactive={true}
            className="font-playfair font-bold fill-brand-brown-950"
          />
          <p className="text-sm text-brand-brown-800/60 font-light mt-4">
            Special moments deserve the extraordinary. Discover our luxury flavor compositions from classic Black Forest to traditional Indian Rasmalai cakes.
          </p>
        </div>

        {/* Filter Controls Sidebar/Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 mb-12 border border-brand-cream-100/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-brand-brown-950">
            <Filter className="w-5 h-5 text-brand-gold-850" />
            <h2 className="font-playfair text-lg font-bold">Filter Collections</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flavor Category */}
            <FlowingSelect
              label="Flavor Profile"
              value={selectedFlavor}
              onChange={setSelectedFlavor}
              options={FLAVOR_OPTIONS}
            />

            {/* Price Categories (Representative ½ Kg) */}
            <FlowingSelect
              label="Price Level (approx.)"
              value={selectedPriceRange}
              onChange={setSelectedPriceRange}
              options={PRICE_OPTIONS}
            />

            {/* Weight Options */}
            <FlowingSelect
              label="Size / Weight Option"
              value={selectedWeight}
              onChange={setSelectedWeight}
              options={WEIGHT_OPTIONS}
            />
          </div>

          {/* Reset Filters Option */}
          {(selectedFlavor !== 'All' || selectedPriceRange !== 'All' || selectedWeight !== 'All') && (
            <div className="mt-6 pt-4 border-t border-brand-cream-50 flex justify-end">
              <button
                onClick={() => {
                  setSelectedFlavor('All');
                  setSelectedPriceRange('All');
                  setSelectedWeight('All');
                }}
                className="text-xs font-semibold text-brand-gold-700 hover:text-brand-gold-600 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
          <span className="text-xs font-medium text-brand-brown-800/50">
            Showing {filteredCakes.length} {filteredCakes.length === 1 ? 'cake profile' : 'cake profiles'}
          </span>
        </div>

        {/* Product Grid */}
        {filteredCakes.length > 0 ? (
          <>
            <GlobalSpotlight
              gridRef={productsGridRef}
              glowColor="201, 162, 39"
              spotlightRadius={280}
            />
            <div 
              ref={productsGridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 bento-section"
            >
              {filteredCakes.map((product) => (
                <ParticleCard
                  key={product.id}
                  disableAnimations={false}
                  particleCount={8}
                  glowColor="201, 162, 39"
                  enableTilt={true}
                  clickEffect={true}
                  enableMagnetism={false}
                  className="magic-bento-product-card magic-bento-product-card--border-glow rounded-[2.5rem]"
                >
                  <ProductCard product={product} />
                </ParticleCard>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-brand-cream-100/50 max-w-xl mx-auto">
            <p className="text-brand-brown-800/60 font-light text-base">
              No celebration cakes match the selected filter configuration.
            </p>
            <button
              onClick={() => {
                setSelectedFlavor('All');
                setSelectedPriceRange('All');
                setSelectedWeight('All');
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
