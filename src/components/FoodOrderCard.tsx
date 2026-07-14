import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface FoodOrderCardProps {
  product: Product;
}

// Resolve tier key → display label
const getTierLabel = (tier: string): string => {
  switch (tier) {
    case 'piece':   return 'Slice';
    case 'halfKg':  return '½ Kg';
    case 'oneKg':   return '1 Kg';
    default:        return 'Standard';
  }
};

/**
 * Swiggy / Zomato-style compact horizontal product card.
 * Used on mobile (< lg) and tablet (sm → lg) breakpoints in Menu.tsx.
 *
 * Layout:
 *   [ text info (flex-1 left) ]  [ image 108×108px (right) ]
 *
 * ADD button transforms inline into [−] qty [+] stepper — no modal, no popup.
 * Quantity is read directly from CartContext so it reflects the real cart state.
 */
export const FoodOrderCard: React.FC<FoodOrderCardProps> = ({ product }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  const isCakeWithMultiPrice = typeof product.price === 'object';

  // Initialise tier selection (prefer ½ Kg → Slice → first key)
  const getInitialTier = (): string => {
    if (!isCakeWithMultiPrice) return 'single';
    const p = product.price as Record<string, number>;
    if (p.halfKg)  return 'halfKg';
    if (p.piece)   return 'piece';
    return Object.keys(p)[0];
  };

  const [selectedTier, setSelectedTier] = useState<string>(getInitialTier);
  const [imgLoaded, setImgLoaded]       = useState(false);

  // Derived values
  const selectedWeight = isCakeWithMultiPrice ? getTierLabel(selectedTier) : 'Standard';

  const getPriceDisplay = (): number => {
    if (!isCakeWithMultiPrice) return product.price as number;
    return (product.price as Record<string, number>)[selectedTier] ?? 0;
  };

  // Read current quantity from cart for this product + weight combo
  const cartItem = cartItems.find(
    (item) => item.id === product.id && item.selectedWeight === selectedWeight,
  );
  const quantity = cartItem?.quantity ?? 0;

  const isOutOfStock = product.status === 'Out of Stock';

  // ── Cart Actions ────────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOutOfStock) return;
      addToCart(product, selectedWeight, 1);
    },
    [product, selectedWeight, addToCart, isOutOfStock],
  );

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToCart(product, selectedWeight, 1);
    },
    [product, selectedWeight, addToCart],
  );

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (quantity <= 1) {
        removeFromCart(product.id, selectedWeight);
      } else {
        updateQuantity(product.id, selectedWeight, -1);
      }
    },
    [product.id, selectedWeight, quantity, updateQuantity, removeFromCart],
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="group bg-white rounded-2xl border border-brand-cream-100/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      aria-label={product.name}
    >
      <div className="flex items-stretch gap-3 p-3 sm:p-3.5">

        {/* ── LEFT: Product Information ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-between min-w-0">

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {product.isBestSeller && !isOutOfStock && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide leading-none">
                ⭐ Best Seller
              </span>
            )}
            {product.isEggless && (
              <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                EGGLESS
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-red-50 text-red-500 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase leading-none">
                Sold Out
              </span>
            )}
          </div>

          {/* Product name */}
          <h3 className="font-playfair font-bold text-[13px] sm:text-sm text-brand-brown-950 leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* One-line description */}
          <p className="text-[11px] text-brand-brown-800/55 font-light mt-1 line-clamp-1 leading-snug">
            {product.description}
          </p>

          {/* Cake size selector (inline, compact) */}
          {isCakeWithMultiPrice && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {Object.keys(product.price as object).map((tier) => (
                <button
                  key={tier}
                  onClick={(e) => { e.stopPropagation(); setSelectedTier(tier); }}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    selectedTier === tier
                      ? 'bg-brand-gold-850 text-brand-brown-950 border-brand-gold-850 shadow-sm'
                      : 'bg-brand-cream-50 text-brand-brown-800/60 border-brand-cream-100 hover:border-brand-cream-300'
                  }`}
                  aria-pressed={selectedTier === tier}
                >
                  {getTierLabel(tier)}
                </button>
              ))}
            </div>
          )}

          {/* Price + ADD/Stepper row */}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            {/* Price */}
            <motion.span
              key={getPriceDisplay()}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="text-sm font-black text-brand-brown-950 flex-shrink-0"
            >
              ₹{getPriceDisplay()}
            </motion.span>

            {/* ADD ↔ stepper */}
            {isOutOfStock ? (
              <span className="text-[10px] font-semibold text-red-400 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex-shrink-0">
                Unavailable
              </span>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {quantity === 0 ? (
                  /* ADD button */
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    onClick={handleAdd}
                    className="flex items-center gap-1 bg-white border-2 border-brand-gold-850 text-brand-gold-700 text-[11px] font-black px-3 py-1 rounded-full hover:bg-brand-gold-850/8 active:scale-95 transition-all cursor-pointer select-none flex-shrink-0"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <Plus className="w-3 h-3 flex-shrink-0" strokeWidth={3} />
                    ADD
                  </motion.button>
                ) : (
                  /* Inline stepper [−] qty [+] */
                  <motion.div
                    key="stepper"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    className="flex items-center rounded-full overflow-hidden shadow-sm flex-shrink-0"
                    style={{ background: '#C9A227' }}
                    role="group"
                    aria-label="Quantity selector"
                  >
                    <button
                      onClick={handleDecrement}
                      className="w-8 h-8 flex items-center justify-center text-brand-brown-950 hover:bg-black/10 transition-colors cursor-pointer active:scale-90"
                      aria-label="Remove one"
                    >
                      <Minus className="w-3 h-3" strokeWidth={3} />
                    </button>

                    {/* Animated quantity counter */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={quantity}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="w-7 text-center text-xs font-black text-brand-brown-950 select-none leading-none"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {quantity}
                      </motion.span>
                    </AnimatePresence>

                    <button
                      onClick={handleIncrement}
                      className="w-8 h-8 flex items-center justify-center text-brand-brown-950 hover:bg-black/10 transition-colors cursor-pointer active:scale-90"
                      aria-label="Add one more"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── RIGHT: Product Image ──────────────────────────────────────────── */}
        <div className="flex-shrink-0 self-center">
          <div
            className="relative rounded-2xl overflow-hidden bg-brand-cream-100"
            style={{ width: 108, height: 108 }}
          >
            {/* Skeleton shimmer while image loads */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-brand-cream-100 animate-pulse" />
            )}

            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover"
              style={{
                opacity: imgLoaded ? 1 : 0,
                transform: 'scale(1)',
                transition: 'opacity 0.35s ease, transform 0.65s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
              }}
            />

            {/* Out-of-stock overlay on image */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/65 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                  Sold Out
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderCard;
