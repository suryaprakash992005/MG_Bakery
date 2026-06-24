import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import { OptimizedImage } from './OptimizedImage';

export const CartDrawer: React.FC = React.memo(() => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItemsCount,
  } = useCart();

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    let detailsText = '';
    cartItems.forEach((item) => {
      const weightDisplay = item.selectedWeight === 'single' || item.selectedWeight === 'Standard'
        ? ''
        : ` (${item.selectedWeight})`;
      
      detailsText += `• *${item.name}*${weightDisplay}\n`;
      detailsText += `  Qty: ${item.quantity} | Price: ₹${item.price * item.quantity}\n\n`;
    });

    const text = `🍰 *NEW ORDER - M.G. IYENGAR BAKERY* 🍰
----------------------------------------------
Hello, I would like to place an order.

📦 *ORDER ITEMS:*
${detailsText}----------------------------------------------
💵 *TOTAL AMOUNT:* *₹${totalAmount}*
----------------------------------------------

Please confirm availability and share payment/pickup details.
Thank you!`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const drawerVariants = {
    closed: isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 },
    open: isMobile
      ? { y: 0, x: 0, transition: { type: 'tween' as const, duration: 0.4, ease: 'easeOut' as any } }
      : { x: 0, y: 0, transition: { type: 'tween' as const, duration: 0.4, ease: 'easeOut' as any } },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-brand-brown-950/40 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Cart Drawer */}
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            className="fixed bottom-0 left-0 right-0 top-auto h-[80vh] max-h-[80vh] w-full rounded-t-[2.5rem] bg-brand-cream-50 shadow-2xl z-[101] flex flex-col border-t border-brand-cream-100 lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:h-full lg:max-h-full lg:max-w-md lg:rounded-none lg:border-l lg:border-t-0"
          >
            {/* Mobile Sheet Handle */}
            <div className="w-12 h-1.5 bg-brand-brown-800/10 rounded-full mx-auto mt-3 lg:hidden shrink-0" />
            {/* Header */}
            <div className="p-6 border-b border-brand-cream-100/80 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-brand-gold-850" />
                <h2 className="font-playfair text-lg font-bold text-brand-brown-950">
                  Shopping Bag ({totalItemsCount})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-brand-cream-100/50 text-brand-brown-800 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-cream-100 flex items-center justify-center text-brand-brown-800/40">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-base font-bold text-brand-brown-950">
                      Your bag is empty
                    </h3>
                    <p className="text-xs text-brand-brown-850/50 mt-1 font-light max-w-xs">
                      Explore our premium cakes and bakery selections to add items to your cart.
                    </p>
                  </div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedWeight}`}
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-brand-cream-100/40 shadow-sm relative group overflow-hidden"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                      />
                    </div>

                    {/* Item Content */}
                    <div className="flex-grow flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-xs font-bold text-brand-brown-950 leading-tight">
                          {item.name}
                        </h4>
                        <span className="inline-block text-[10px] font-semibold bg-brand-cream-100 text-brand-brown-850 px-2 py-0.5 rounded-full mt-1.5">
                          {item.selectedWeight === 'single' || item.selectedWeight === 'Standard'
                            ? 'Standard'
                            : item.selectedWeight}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-brand-cream-100 rounded-full bg-brand-cream-50/50 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedWeight, -1)}
                            className="p-1 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 active:scale-90 transition-all cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-brand-brown-950">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedWeight, 1)}
                            className="p-1 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 active:scale-90 transition-all cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-bold text-brand-brown-950">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedWeight)}
                      className="absolute top-3 right-3 text-brand-brown-800/40 hover:text-brand-orange-500 transition-colors p-1 rounded-md hover:bg-brand-cream-50 cursor-pointer"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-brand-cream-100 bg-white space-y-4 shadow-lg shadow-brand-brown-950/5">
                <div className="flex items-center justify-between text-brand-brown-950">
                  <span className="text-xs font-medium text-brand-brown-800/60">Subtotal</span>
                  <span className="text-lg font-bold">₹{totalAmount}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-brand-brown-950 hover:bg-brand-brown-900 text-brand-cream-50 hover:text-brand-gold-850 py-3.5 px-6 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-md shadow-brand-brown-950/15 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-brand-gold-850" />
                    <span>Checkout & Order on WhatsApp</span>
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-[10px] font-semibold text-brand-brown-800/40 hover:text-brand-orange-500 py-1.5 transition-colors cursor-pointer"
                  >
                    Empty Cart
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});
