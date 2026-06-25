import React, { useState } from 'react';
import { Product } from '../types';
import { AddToCartButton } from './AddToCartButton';
import BorderGlow from './BorderGlow';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isCakeWithMultiPrice = typeof product.price === 'object';
  
  // Select initial price tier for cakes (default to halfKg if available, else piece, else first key)
  const getInitialTier = (): string => {
    if (!isCakeWithMultiPrice) return 'single';
    const priceObj = product.price as any;
    if (priceObj.halfKg) return 'halfKg';
    if (priceObj.piece) return 'piece';
    return Object.keys(priceObj)[0];
  };

  const [selectedTier, setSelectedTier] = useState<string>(getInitialTier());

  const getPriceDisplay = (): number => {
    if (!isCakeWithMultiPrice) {
      return product.price as number;
    }
    return (product.price as any)[selectedTier] || 0;
  };

  const getTierLabel = (tier: string): string => {
    switch (tier) {
      case 'piece':
        return 'Slice';
      case 'halfKg':
        return '½ Kg';
      case 'oneKg':
        return '1 Kg';
      default:
        return 'Standard';
    }
  };


  return (
    <BorderGlow
      className="h-full group"
      backgroundColor="#ffffff"
      glowColor="46 64 52"
      borderRadius={24}
      glowRadius={30}
      glowIntensity={0.8}
      coneSpread={20}
      animated={false}
      colors={['#D4AF37', '#2C1717', '#A46E6E']}
      fillOpacity={0.1}
    >
      <div className="flex flex-col h-full w-full justify-between">
        {/* Product Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />

          {product.status === 'Out of Stock' && (
            <div className="absolute inset-0 bg-brand-brown-950/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="text-brand-cream-50 font-playfair border-2 border-brand-gold-500/80 px-4 py-1.5 rounded-md text-xs sm:text-sm uppercase tracking-widest font-semibold bg-brand-brown-950/30">
                Sold Out
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-1.5">
              {product.isBestSeller && (
                <span className="bg-brand-gold-850 text-brand-brown-950 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Best Seller
                </span>
              )}
              {product.tags?.slice(0, 1).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-brand-brown-950/90 text-brand-cream-50 text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {product.isEggless && (
              <span 
                className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm backdrop-blur-sm"
                title="100% Eggless Option Available"
              >
                <span className="w-2 h-2 rounded-full bg-green-600 block"></span>
                EGGLESS
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="font-playfair text-lg sm:text-xl font-bold text-brand-brown-950 group-hover:text-brand-gold-700 transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-xs text-brand-brown-800/60 font-light mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-cream-100/50">
            {/* Cake Tier Selector */}
            {isCakeWithMultiPrice && (
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-4">
                {Object.keys(product.price as object).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`text-[10px] font-semibold px-2 sm:px-2.5 py-1 rounded-full transition-all border ${
                      selectedTier === tier
                        ? 'bg-brand-gold-850 text-brand-brown-950 border-brand-gold-850 shadow-sm'
                        : 'bg-brand-cream-50 text-brand-brown-800/70 border-brand-cream-100 hover:border-brand-cream-200'
                    }`}
                  >
                    {getTierLabel(tier)}
                  </button>
                ))}
              </div>
            )}

            {/* Pricing & Add to Cart Button */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-brand-brown-800/40 block font-light leading-none">
                  Price
                </span>
                <span className="text-xl font-bold text-brand-brown-950 mt-1 block">
                  ₹{getPriceDisplay()}
                </span>
              </div>

              <AddToCartButton
                product={product}
                selectedWeight={isCakeWithMultiPrice ? getTierLabel(selectedTier) : 'Standard'}
                className="px-4 py-2.5 rounded-full text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </BorderGlow>
  );
};
