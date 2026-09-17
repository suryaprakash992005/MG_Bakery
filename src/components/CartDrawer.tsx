import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Plus, Minus, Trash2, ShoppingBag,
  Bookmark, BookmarkCheck,
  ShoppingCart, Sparkles, RotateCcw,
  Package, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';

// ─── Saved Items Section ──────────────────────────────────────────────────────

const SavedItemsSection: React.FC = () => {
  const { savedItems, moveToCart, removeSavedItem } = useCart();

  if (savedItems.length === 0) return null;

  return (
    <div className="shrink-0 border-t border-brand-cream-100/60">
      <div className="px-5 py-3 bg-brand-cream-50/50">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-3.5 h-3.5 text-brand-gold-700" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown-950/70">
            Saved for Later ({savedItems.length})
          </span>
        </div>
      </div>

      <div className="px-5 pb-3 space-y-2.5 max-h-52 overflow-y-auto no-scrollbar">
        <AnimatePresence>
          {savedItems.map(item => (
            <motion.div
              key={`saved-${item.id}-${item.selectedWeight}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              className="flex gap-3 p-3 bg-white rounded-2xl border border-brand-cream-100/40 shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-cream-100 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow min-w-0">
                <h5 className="text-[11px] font-bold text-brand-brown-950 truncate">{item.name}</h5>
                <span className="text-[9px] font-bold bg-brand-cream-100 text-brand-brown-800/70 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                  {item.selectedWeight === 'Standard' ? 'Standard' : item.selectedWeight}
                </span>
                <p className="text-xs font-bold text-brand-brown-950 mt-1">₹{item.price}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end justify-between shrink-0">
                <button
                  onClick={() => removeSavedItem(item.id, item.selectedWeight)}
                  className="text-brand-brown-800/30 hover:text-red-500 p-1 rounded-full cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveToCart(item.id, item.selectedWeight)}
                  className="text-[9px] font-bold text-brand-brown-950 bg-brand-cream-100 hover:bg-brand-gold-100 border border-brand-cream-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap"
                >
                  Move to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Truck Animation Checkout Button ──────────────────────────────────────────
const TruckAnimationCheckoutButton: React.FC<{
  totalAmount: number;
  onProceed: () => void;
  disabled?: boolean;
}> = ({ totalAmount, onProceed, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'driving' | 'ready'>('idle');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    setPhase('driving');

    // After truck drives across (~900ms)
    setTimeout(() => {
      setPhase('ready');
    }, 900);

    // Navigate to checkout after animation finishes (~1200ms)
    setTimeout(() => {
      onProceed();
      setTimeout(() => {
        setIsAnimating(false);
        setPhase('idle');
      }, 400);
    }, 1200);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isAnimating}
      whileTap={!isAnimating ? { scale: 0.98 } : {}}
      className="relative w-full h-[54px] rounded-2xl overflow-hidden bg-[#2A0E0A] border border-[#C9A227]/40 shadow-xl shadow-[#2A0E0A]/20 cursor-pointer group transition-all"
    >
      {/* ── IDLE STATE CONTENT ── */}
      <motion.div
        animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? -15 : 0 }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 flex items-center justify-between px-4 sm:px-5 z-10"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: [-8, 8, -8, 0] }}
            className="w-8 h-8 rounded-xl bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227] shadow-inner shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.div>
          <div className="text-left">
            <span className="text-[13px] sm:text-sm font-bold tracking-wide text-white block leading-tight">
              Proceed to Checkout
            </span>
            <span className="text-[9px] text-[#C9A227] font-medium block leading-tight">
              Fresh Mohanur bakery order
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-[#C9A227] text-[#2A0E0A] px-3 py-1.5 rounded-xl text-xs font-black shadow-md">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 text-[#C9A227]" />
          </motion.div>
        </div>
      </motion.div>

      {/* ── DRIVING ROAD ANIMATION STAGE ── */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-[#1A0704] via-[#2A0E0A] to-[#1A0704] flex items-center overflow-hidden z-20"
          >
            {/* Asphalt road line */}
            <div className="absolute bottom-2.5 left-0 right-0 h-[3px] bg-[#3E1611]">
              <motion.div
                animate={{ x: [-28, 0] }}
                transition={{ repeat: Infinity, duration: 0.28, ease: 'linear' }}
                className="w-[200%] h-full flex gap-3"
              >
                {Array.from({ length: 40 }).map((_, i) => (
                  <span key={i} className="inline-block w-4 h-full bg-[#C9A227]/75 rounded-full shrink-0" />
                ))}
              </motion.div>
            </div>

            {/* Road status text */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
              {phase === 'driving' ? (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#C9A227] block"
                  />
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#FAF7F2] tracking-wider uppercase font-poppins">
                    Speeding to Checkout…
                  </span>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#C9A227]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready! Redirecting…</span>
                </motion.div>
              )}
            </div>

            {/* Animated Delivery Truck moving Left to Right */}
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 440 }}
              transition={{
                duration: 1.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute bottom-2.5 flex items-end"
            >
              {/* Smoke puffs behind rear wheel */}
              <div className="relative w-4 h-4 mr-0.5 mb-1 pointer-events-none">
                <motion.span
                  animate={{
                    opacity: [0.8, 0],
                    scale: [0.4, 1.4],
                    x: [-2, -20],
                    y: [-1, -4],
                  }}
                  transition={{ repeat: Infinity, duration: 0.35 }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-white/35 block"
                />
                <motion.span
                  animate={{
                    opacity: [0.8, 0],
                    scale: [0.3, 1.2],
                    x: [-3, -26],
                    y: [0, -6],
                  }}
                  transition={{ repeat: Infinity, duration: 0.45, delay: 0.1 }}
                  className="absolute w-2 h-2 rounded-full bg-[#C9A227]/40 block"
                />
              </div>

              {/* Bakery Delivery Truck SVG */}
              <motion.div
                animate={{ y: [0, -1.5, 0, -1, 0] }}
                transition={{ repeat: Infinity, duration: 0.25, ease: 'easeInOut' }}
              >
                <svg width="56" height="30" viewBox="0 0 56 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Headlight beam */}
                  <polygon points="50,18 56,15 56,22 50,19" fill="#FFF275" opacity="0.75" />
                  <circle cx="50" cy="18.5" r="1.5" fill="#FFE24A" />

                  {/* Truck Body (Cargo / Bakery Box) */}
                  <rect x="2" y="5" width="32" height="18" rx="3" fill="#FAF7F2" stroke="#2A0E0A" strokeWidth="1.2" />
                  <rect x="3" y="3.5" width="30" height="2" rx="1" fill="#C9A227" />

                  {/* Bakery Logo Emblem on cargo */}
                  <rect x="7" y="8.5" width="22" height="11" rx="2" fill="#2A0E0A" />
                  <text x="18" y="16.5" fill="#C9A227" fontSize="7" fontWeight="bold" fontFamily="serif" textAnchor="middle">
                    M.G.
                  </text>

                  {/* Truck Cabin */}
                  <path d="M34 9H44.5L50 16V23H34V9Z" fill="#C9A227" stroke="#2A0E0A" strokeWidth="1.2" />
                  <path d="M36 11H43.5L47.5 16H36V11Z" fill="#2A0E0A" opacity="0.85" />

                  {/* Bumpers */}
                  <rect x="49" y="20" width="3" height="3" rx="1" fill="#716056" />
                  <rect x="0" y="19" width="3" height="3.5" rx="1" fill="#716056" />

                  {/* Rear Wheel */}
                  <g transform="translate(10, 23)">
                    <circle cx="0" cy="0" r="5" fill="#1A0D0B" stroke="#8C827A" strokeWidth="1.2" />
                    <motion.g
                      animate={{ rotate: 720 }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                    >
                      <circle cx="0" cy="0" r="2.2" fill="#C9A227" />
                      <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#FAF7F2" strokeWidth="0.8" />
                      <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#FAF7F2" strokeWidth="0.8" />
                    </motion.g>
                  </g>

                  {/* Front Wheel */}
                  <g transform="translate(42, 23)">
                    <circle cx="0" cy="0" r="5" fill="#1A0D0B" stroke="#8C827A" strokeWidth="1.2" />
                    <motion.g
                      animate={{ rotate: 720 }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                    >
                      <circle cx="0" cy="0" r="2.2" fill="#C9A227" />
                      <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#FAF7F2" strokeWidth="0.8" />
                      <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#FAF7F2" strokeWidth="0.8" />
                    </motion.g>
                  </g>
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ─── Main CartDrawer ──────────────────────────────────────────────────────────

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems, savedItems, isCartOpen, setIsCartOpen,
    removeFromCart, updateQuantity, clearCart,
    saveForLater,
    totalAmount, totalItemsCount,
  } = useCart();
  const { settings } = useBakeryDatabase();
  const { user, setIsAuthModalOpen, setAuthModalTab, setAuthModalMessage } = useAuth();

  // ── Animations ────────────────────────────────────────────────────────────

  const drawerVariants = {
    closed: { x: '100%', opacity: 0.8 },
    open: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring' as const, damping: 32, stiffness: 300 },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 30 } },
    exit: { opacity: 0, x: 50, scale: 0.92, transition: { duration: 0.2 } },
  };

  const handleCheckoutProceed = () => {
    setIsCartOpen(false);
    if (!user) {
      setAuthModalMessage('Please sign in or register with your mobile number to complete your order.');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
    }
    navigate('/checkout');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-brand-brown-950/40 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            className="fixed top-0 right-0 bottom-0 h-full w-full sm:w-[88vw] max-w-[430px] bg-gradient-to-b from-[#FFFDFB] via-[#FCFAF7] to-[#FAF8F5] shadow-2xl z-[101] flex flex-col border-l border-brand-gold-250/20 rounded-l-none sm:rounded-l-[2rem] md:rounded-l-[2.5rem] overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="p-5 border-b border-brand-cream-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                  className="w-10 h-10 rounded-full bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] shadow-md"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                </motion.div>
                <div>
                  <h2 className="font-playfair text-base font-extrabold text-brand-brown-950 leading-tight">
                    Your Shopping Bag
                  </h2>
                  <span className="block text-[9px] text-[#C9A227] font-extrabold uppercase tracking-widest mt-0.5">
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                    {savedItems.length > 0 && ` · ${savedItems.length} saved`}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 hover:text-brand-brown-950 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4.5 h-4.5" />
              </motion.button>
            </div>

            {/* ── Bakery Free Delivery & Quality Progress Banner ── */}
            {cartItems.length > 0 && (
              <div className="bg-gradient-to-r from-[#FAF6F0] via-[#FFF9EE] to-[#FAF6F0] border-b border-[#C9A227]/25 px-4 py-2.5 shrink-0">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2A0E0A] mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227] shrink-0">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <span className="text-[11px] font-bold text-[#2A0E0A]">
                      {totalAmount >= 499
                        ? '🎉 Free Mohanur Priority Delivery Unlocked!'
                        : `Add ₹${(499 - totalAmount).toLocaleString('en-IN')} more for Free Delivery`}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#C9A227] bg-white px-2 py-0.5 rounded-full border border-[#C9A227]/30 shadow-xs">
                    {totalAmount >= 499 ? 'UNLOCKED' : `${Math.round((totalAmount / 499) * 100)}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-brand-cream-200/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalAmount / 499) * 100, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#C9A227] to-[#E5C158] rounded-full"
                  />
                </div>
              </div>
            )}

            {/* ── Cart Items ── */}
            <div className="flex-grow overflow-y-auto no-scrollbar">
              {cartItems.length === 0 ? (
                // Empty state
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-6 py-10">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -6, 6, 0], y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, repeatDelay: 0.5 }}
                    className="w-24 h-24 rounded-full bg-brand-cream-100/60 flex items-center justify-center text-brand-brown-950/65 shadow-inner"
                  >
                    <ShoppingBag className="w-10 h-10" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="font-playfair text-lg font-black text-brand-brown-950">Your Bag is Empty</h3>
                    <p className="text-xs text-brand-brown-800/60 font-light leading-relaxed max-w-xs">
                      Treat yourself to fresh cakes, hot pastries, and our handcrafted bakery items.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsCartOpen(false); navigate('/menu'); }}
                    className="px-6 py-3 bg-[#2A0E0A] text-[#C9A227] text-xs font-bold rounded-full cursor-pointer hover:bg-[#401C16] transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Browse Menu
                  </motion.button>
                </div>
              ) : (
                <div className="p-4 sm:p-5 space-y-3">
                  <AnimatePresence initial={false}>
                    {cartItems.map(item => (
                      <motion.div
                        key={`${item.id}-${item.selectedWeight}`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex gap-3.5 p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-brand-cream-100 shadow-xs hover:shadow-md hover:border-[#C9A227]/30 transition-all duration-300 relative group overflow-hidden"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-cream-100 shrink-0 shadow-xs border border-brand-cream-200/30">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h4 className="text-xs font-bold text-brand-brown-950 leading-snug pr-6 truncate">
                              {item.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span className="inline-block text-[9px] font-bold bg-[#FAF6F0] text-[#C9A227] border border-brand-gold-250/20 px-2 py-0.5 rounded-full">
                                {item.selectedWeight === 'Standard' ? 'Standard' : item.selectedWeight}
                              </span>
                              {/* Customizations Summary */}
                              {item.customizations?.eggPreference && (
                                <span className="text-[9px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                  {item.customizations.eggPreference}
                                </span>
                              )}
                              {item.customizations?.flavor && (
                                <span className="text-[9px] font-semibold text-brand-brown-800/60 bg-brand-cream-50 border border-brand-cream-100 px-2 py-0.5 rounded-full">
                                  {item.customizations.flavor}
                                </span>
                              )}
                            </div>
                            {item.customizations?.cakeMessage && (
                              <p className="text-[9px] text-brand-brown-800/50 mt-1 italic truncate">
                                "{item.customizations.cakeMessage}"
                              </p>
                            )}
                          </div>

                          {/* Quantity + Price Row */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-brand-cream-200/80 rounded-full bg-brand-cream-50 p-0.5 shadow-xs">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.1, backgroundColor: '#FAF7F2' }}
                                onClick={() => updateQuantity(item.id, item.selectedWeight, -1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-brand-brown-800 hover:text-[#2A0E0A] transition-colors cursor-pointer min-h-0 min-w-0"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </motion.button>
                              <span className="w-7 text-center text-xs font-black text-brand-brown-950 block select-none">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.1, backgroundColor: '#C9A227', color: '#2A0E0A' }}
                                onClick={() => updateQuantity(item.id, item.selectedWeight, 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-brand-brown-800 hover:text-[#2A0E0A] transition-colors cursor-pointer min-h-0 min-w-0"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </motion.button>
                            </div>
                            <span className="text-xs font-bold text-brand-brown-950">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons (top right) */}
                        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                          <motion.button
                            whileHover={{ scale: 1.2, rotate: -10 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => removeFromCart(item.id, item.selectedWeight)}
                            className="chip-btn text-brand-brown-800/35 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full cursor-pointer transition-colors min-h-0 min-w-0"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => saveForLater(item.id, item.selectedWeight)}
                            className="chip-btn text-brand-brown-800/35 hover:text-[#C9A227] hover:bg-[#C9A227]/10 p-1.5 rounded-full cursor-pointer transition-colors min-h-0 min-w-0"
                            title="Save for Later"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Saved for Later Section ── */}
            <SavedItemsSection />

            {/* ── Footer: Summary + Actions ── */}
            {cartItems.length > 0 && (
              <div
                className="p-4 sm:p-5 border-t border-brand-cream-100 bg-white space-y-3.5 shadow-2xl shrink-0"
                style={{
                  paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
                }}
              >

                {/* Clean & Elegant Bill Summary Card */}
                <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#2C1A17]/8 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#2C1A17]/75">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Package className="w-3.5 h-3.5 text-[#C9A227]" />
                      Items Subtotal ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-bold text-[#2A0E0A]">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#2C1A17]/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                      Delivery & Pickup
                    </span>
                    <span className="text-[10px] font-semibold text-[#C9A227] bg-white border border-[#C9A227]/25 px-2 py-0.5 rounded-full shadow-2xs">
                      Selected at Checkout
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[#2C1A17]/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#2C1A17]/50 uppercase tracking-widest block">
                        Subtotal Payable
                      </span>
                      <span className="text-[10px] text-[#C9A227] font-semibold">
                        Inclusive of all taxes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-playfair text-[#2A0E0A] tracking-tight">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                {settings.emergencyDisableOrdering ? (
                  <div className="bg-rose-50 border border-rose-150 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-rose-700">Orders Temporarily Closed</p>
                    <p className="text-[10px] text-rose-600 mt-1 font-light leading-normal">
                      We are currently not accepting new orders. Please check back later!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Interactive Delivery Truck Checkout Button */}
                    <TruckAnimationCheckoutButton
                      totalAmount={totalAmount}
                      onProceed={handleCheckoutProceed}
                    />

                    <div className="flex items-center justify-between px-1 pt-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearCart}
                        className="chip-btn text-[10px] font-bold uppercase tracking-wider text-[#2C1A17]/40 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 min-h-0 min-w-0"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Clear Bag</span>
                      </motion.button>
                      <span className="text-[10px] text-[#2C1A17]/50 font-medium flex items-center gap-1">
                        <span>✨ Direct WhatsApp Ordering</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
