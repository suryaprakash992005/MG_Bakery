import React from 'react';
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
            className="fixed top-0 right-0 bottom-0 h-full w-[92vw] sm:w-[88vw] max-w-[430px] bg-gradient-to-b from-[#FFFDFB] via-[#FCFAF7] to-[#FAF8F5] shadow-2xl z-[101] flex flex-col border-l border-brand-gold-250/20 rounded-l-[2rem] md:rounded-l-[2.5rem] overflow-hidden"
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
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 hover:text-brand-brown-950 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* ── Bakery Freshness & Quality Banner ── */}
            {cartItems.length > 0 && (
              <div className="bg-gradient-to-r from-[#FAF6F0] via-[#FFF9EE] to-[#FAF6F0] border-b border-[#C9A227]/20 px-4 py-2.5 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2A0E0A]">
                  <span className="w-6 h-6 rounded-full bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227] shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] font-medium text-[#2C1A17]/85">
                    Freshly baked & handcrafted with love in Mohanur
                  </span>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#C9A227] bg-white px-2.5 py-0.5 rounded-full border border-[#C9A227]/25 shadow-xs shrink-0">
                  Daily Fresh
                </span>
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
                  <button
                    onClick={() => { setIsCartOpen(false); navigate('/menu'); }}
                    className="px-6 py-3 bg-[#2A0E0A] text-[#C9A227] text-xs font-bold rounded-full cursor-pointer hover:bg-[#401C16] transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <AnimatePresence initial={false}>
                    {cartItems.map(item => (
                      <motion.div
                        key={`${item.id}-${item.selectedWeight}`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex gap-3.5 p-4 bg-white rounded-3xl border border-brand-cream-100/40 shadow-sm hover:shadow-md hover:border-[#C9A227]/25 transition-all duration-300 relative group overflow-hidden"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-cream-100 shrink-0 shadow-sm border border-brand-cream-200/30">
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
                            <div className="flex items-center border border-brand-cream-200/60 rounded-full bg-brand-cream-100/30 p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedWeight, -1)}
                                className="p-1 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 active:scale-90 transition-all cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-brand-brown-950">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedWeight, 1)}
                                className="p-1 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 active:scale-90 transition-all cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-brand-brown-950">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons (top right) */}
                        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedWeight)}
                            className="text-brand-brown-800/30 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full cursor-pointer transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => saveForLater(item.id, item.selectedWeight)}
                            className="text-brand-brown-800/30 hover:text-brand-gold-700 hover:bg-brand-cream-100 p-1.5 rounded-full cursor-pointer transition-all"
                            title="Save for Later"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
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
              <div className="p-5 border-t border-brand-cream-100 bg-white space-y-3.5 shadow-2xl shrink-0">

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
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        if (!user) {
                          setAuthModalMessage('Please sign in or register with your mobile number to complete your order.');
                          setAuthModalTab('login');
                          setIsAuthModalOpen(true);
                        }
                        navigate('/checkout');
                      }}
                      className="w-full bg-[#2A0E0A] hover:bg-[#3D140E] text-[#FAF7F2] py-3.5 px-5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all duration-300 active:scale-[0.98] shadow-xl shadow-[#2A0E0A]/15 cursor-pointer group overflow-hidden relative"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227]">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide text-white">Proceed to Checkout</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#C9A227] text-[#2A0E0A] px-3 py-1 rounded-xl text-xs font-extrabold shadow-sm">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#C9A227] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <div className="flex items-center justify-between px-1 pt-1">
                      <button
                        onClick={clearCart}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#2C1A17]/40 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Clear Bag</span>
                      </button>
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
