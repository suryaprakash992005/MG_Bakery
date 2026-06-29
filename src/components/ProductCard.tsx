import React, { useState } from 'react';
import { Product } from '../types';
import { AddToCartButton } from './AddToCartButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, PhoneCall, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import BorderGlow from './BorderGlow';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { settings } = useBakeryDatabase();

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
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shake, setShake] = useState(false);
  const [added, setAdded] = useState(false);

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

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleAddFromModal = (e: React.MouseEvent) => {
    if (product.status === 'Out of Stock') {
      triggerShake();
      return;
    }

    // Capture modal image and trigger fly transition to cart
    const container = (e.currentTarget as HTMLElement).closest('.max-w-lg') || document.body;
    const imgElement = container?.querySelector('img') as HTMLImageElement;
    if (imgElement) {
      const startRect = imgElement.getBoundingClientRect();
      import('../utils/animationHelper').then(({ triggerFlyToCart }) => {
        triggerFlyToCart(startRect, imgElement.src);
      });
    }

    addToCart(product, isCakeWithMultiPrice ? getTierLabel(selectedTier) : 'Standard', 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappLink = `https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
    `Hello ${settings?.bakeryName || 'M.G. Iyengar Bakery'}, I would like to order "${product.name}"${
      isCakeWithMultiPrice ? ` size: ${getTierLabel(selectedTier)}` : ''
    } for ₹${getPriceDisplay()}.`
  )}`;

  return (
    <>
      {/* ----------------- DESKTOP CARD VIEW (PREVIOUS STYLE) ----------------- */}
      <div className="hidden lg:block h-full">
        <BorderGlow
          className="h-full group"
          backgroundColor="#ffffff"
          glowColor="46 64 52"
          borderRadius={24}
          glowRadius={30}
          glowIntensity={0.8}
          coneSpread={20}
          animated={false}
          colors={['#C9A227', '#2A0E0A', '#A46E6E']}
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
                        className={`text-[10px] font-semibold px-2 sm:px-2.5 py-1 rounded-full transition-all border cursor-pointer ${
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
      </div>

      {/* ----------------- MOBILE CARD VIEW (PREMIUM REDESIGN WITH SHEET MODAL) ----------------- */}
      <div className="block lg:hidden h-full">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="flex flex-col h-full w-full justify-between bg-white rounded-[25px] overflow-hidden border border-brand-cream-100/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer select-none group animate-fade-in-up"
        >
          {/* Product Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream-100/30">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />

            {product.status === 'Out of Stock' && (
              <div className="absolute inset-0 bg-[#2A0E0A]/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="text-white font-playfair border-2 border-brand-gold-800/80 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold bg-[#2A0E0A]/50">
                  Sold Out
                </span>
              </div>
            )}

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 justify-between items-start pointer-events-none">
              <div className="flex flex-col gap-1.5">
                {product.isBestSeller && (
                  <span className="bg-[#C9A227] text-[#2A0E0A] text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Best Seller
                  </span>
                )}
                {product.tags?.slice(0, 1).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#2A0E0A]/90 text-white text-[9px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {product.isEggless && (
                <span 
                  className="bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm backdrop-blur-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 block"></span>
                  EGGLESS
                </span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col flex-grow justify-between">
            <div>
              <h3 className="font-playfair text-lg font-bold text-brand-brown-950 group-hover:text-brand-gold-850 transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-xs text-brand-brown-800/60 font-light mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-cream-100/50">
              {/* Cake Tier Selector */}
              {isCakeWithMultiPrice && (
                <div 
                  className="flex flex-wrap items-center gap-1.5 mb-4"
                  onClick={(e) => e.stopPropagation()} // Prevent opening details modal when selecting weight
                >
                  {Object.keys(product.price as object).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`text-[10px] font-semibold px-3 py-1 rounded-full transition-all border cursor-pointer ${
                        selectedTier === tier
                          ? 'bg-[#C9A227] text-[#2A0E0A] border-[#C9A227] shadow-sm'
                          : 'bg-brand-cream-50 text-brand-brown-800/70 border-brand-cream-100 hover:border-brand-cream-200'
                      }`}
                    >
                      {getTierLabel(tier)}
                    </button>
                  ))}
                </div>
              )}

              {/* Pricing & Add to Cart Action */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#2A0E0A]/40 block font-semibold uppercase tracking-wider">
                    Price
                  </span>
                  <span className="text-lg font-bold text-[#2A0E0A] mt-0.5 block">
                    ₹{getPriceDisplay()}
                  </span>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <AddToCartButton
                    product={product}
                    selectedWeight={isCakeWithMultiPrice ? getTierLabel(selectedTier) : 'Standard'}
                    className="px-4 py-2.5 rounded-full text-[11px] font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Premium Details Sheet Modal (Mobile Only) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2A0E0A]/70 backdrop-blur-sm">
            {/* Dark sheet overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 cursor-zoom-out"
            />

            {/* Main Sheet panel content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-full max-w-lg bg-[#FAF7F2] rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-brand-cream-100 flex flex-col z-10 max-h-[92dvh] sm:max-h-[85dvh] font-poppins"
            >
              {/* Image Showcase Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream-100/50">
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md text-[#2A0E0A] hover:bg-white flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-[#FAF7F2]/30"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Heart Favorite Toggle Button */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md text-[#2A0E0A] hover:bg-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  aria-label="Toggle favorite"
                >
                  <motion.div
                    animate={{ scale: isFavorite ? [1, 1.4, 1] : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#C9A227] text-[#C9A227]' : 'text-brand-brown-800'}`} />
                  </motion.div>
                </button>
              </div>

              {/* Scrollable details wrapper */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow pb-24">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {product.isBestSeller && (
                      <span className="bg-[#C9A227]/15 text-[#C9A227] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Best Seller
                      </span>
                    )}
                    {product.isEggless && (
                      <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 block"></span>
                        Eggless
                      </span>
                    )}
                  </div>
                  <h2 className="font-playfair text-2xl font-bold text-[#2A0E0A]">
                    {product.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-brown-800/80 font-light leading-relaxed font-poppins">
                    {product.description}
                  </p>
                </div>

                {/* Weight Options Selector */}
                {isCakeWithMultiPrice && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[#2A0E0A]/40 uppercase tracking-widest block font-poppins">
                      Select Size / Weight Option
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(product.price as object).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(tier)}
                          className={`text-xs font-bold px-4 py-2 rounded-full transition-all border cursor-pointer ${
                            selectedTier === tier
                              ? 'bg-[#C9A227] text-[#2A0E0A] border-[#C9A227] shadow-sm'
                              : 'bg-brand-cream-50 text-brand-brown-800/70 border-brand-cream-100 hover:border-brand-cream-200'
                          }`}
                        >
                          {getTierLabel(tier)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Micro Details Row */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-brand-cream-100/50">
                  <div>
                    <span className="text-[10px] text-brand-brown-800/40 uppercase tracking-wider block">Category</span>
                    <span className="text-xs font-bold text-brand-brown-950 mt-1 block">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-brown-800/40 uppercase tracking-wider block">Availablity</span>
                    <span className={`text-xs font-bold mt-1 block ${product.status === 'Out of Stock' ? 'text-red-500' : 'text-green-600'}`}>
                      {product.status || 'In Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Sticky Panel */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-brand-cream-100 flex items-center justify-between gap-4 z-[25]">
                {/* Price tag */}
                <div>
                  <span className="text-[10px] text-[#2A0E0A]/40 font-semibold uppercase tracking-wider block">
                    Total Price
                  </span>
                  <motion.span 
                    key={getPriceDisplay()}
                    animate={shake ? { x: [-5, 5, -5, 5, 0] } : { scale: [0.95, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-black text-[#2A0E0A] mt-0.5 block"
                  >
                    ₹{getPriceDisplay()}
                  </motion.span>
                </div>

                {/* WhatsApp & Cart Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#2A0E0A] hover:bg-brand-cream-100 flex items-center justify-center border border-brand-cream-200 transition-colors shadow-sm cursor-pointer"
                    title="Order Direct on WhatsApp"
                  >
                    <PhoneCall className="w-5 h-5 text-[#C9A227]" />
                  </a>

                  <button
                    onClick={(e) => handleAddFromModal(e)}
                    className={`relative overflow-hidden font-bold transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer h-12 px-6 rounded-full text-sm ${
                      added
                        ? 'bg-[#C9A227] text-[#2A0E0A] shadow-[#C9A227]/20'
                        : 'bg-[#2A0E0A] text-white hover:bg-[#2A0E0A]/95 hover:text-[#C9A227]'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
