import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, ArrowLeft, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';

export const CartDrawer: React.FC = () => {
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

  const { addOrder, settings } = useBakeryDatabase();
  const { profile } = useAuth();

  const [isCheckoutMode, setIsCheckoutMode] = useState(false);

  // Form states
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Sync profile details if logged in
  useEffect(() => {
    if (profile) {
      setCustName(profile.name || '');
      setCustPhone(profile.phone || '');
    } else {
      setCustName('');
      setCustPhone('');
    }
  }, [profile]);

  // Reset checkout mode when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      setIsCheckoutMode(false);
    }
  }, [isCartOpen]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !custName || !custPhone) return;

    const orderItemsSummary = cartItems
      .map(item => {
        const weightDisplay = item.selectedWeight === 'single' || item.selectedWeight === 'Standard'
          ? ''
          : ` (${item.selectedWeight})`;
        return `${item.name}${weightDisplay} x${item.quantity}`;
      })
      .join(', ');

    // 1. Create order record in dashboard database
    const createdOrder = await addOrder({
      customerName: custName,
      phone: custPhone,
      deliveryAddress: custAddress || 'Store Pickup',
      orderedProduct: orderItemsSummary,
      amount: totalAmount,
      paymentMethod: 'UPI / Offline',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        selectedWeight: item.selectedWeight,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    });

    // 2. Build professional WhatsApp message
    let itemsText = '';
    cartItems.forEach((item) => {
      const weightDisplay = item.selectedWeight === 'single' || item.selectedWeight === 'Standard'
        ? ''
        : ` (${item.selectedWeight})`;
      itemsText += `• *${item.name}*${weightDisplay}\n  Qty: ${item.quantity} | Price: ₹${item.price * item.quantity}\n\n`;
    });

    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const whatsappText = `🍰 *ORDER CONFIRMED - M.G. IYENGAR BAKERY* 🍰
----------------------------------------------
*Order ID:* ${createdOrder.id}
*Date:* ${todayStr}

👤 *CUSTOMER DETAILS:*
• *Name:* ${custName}
• *Phone:* ${custPhone}
• *Address:* ${custAddress || 'Store Pickup / Handover'}

📦 *ORDER ITEMS:*
${itemsText}----------------------------------------------
💵 *TOTAL AMOUNT:* *₹${totalAmount}*
----------------------------------------------
Thank you for your order! Please share payment details (UPI/Online) for verification.
We look forward to serving you!`;

    // 3. Clear shopping cart and close drawer
    clearCart();
    setIsCheckoutMode(false);
    setIsCartOpen(false);

    // 4. Open WhatsApp
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber || '919345586112'}?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const drawerVariants = {
    closed: { x: '100%' },
    open: {
      x: 0,
      transition: { type: 'spring' as const, damping: 30, stiffness: 280 }
    },
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
            className="fixed top-0 right-0 bottom-0 left-auto h-full w-[85vw] max-w-md bg-brand-cream-50 shadow-2xl z-[101] flex flex-col border-l border-brand-cream-100 rounded-l-[2rem] lg:rounded-none"
          >
            {/* Mobile Sheet Handle */}
            <div className="w-12 h-1.5 bg-brand-brown-800/10 rounded-full mx-auto mt-3 lg:hidden shrink-0" />
            
            {/* Header */}
            <div className="p-6 border-b border-brand-cream-100/80 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isCheckoutMode ? (
                  <button 
                    onClick={() => setIsCheckoutMode(false)}
                    className="p-1 rounded-full hover:bg-brand-cream-100/50 text-brand-brown-800 mr-1"
                    aria-label="Back to cart list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <ShoppingBag className="w-5 h-5 text-brand-gold-850" />
                )}
                <h2 className="font-playfair text-lg font-bold text-brand-brown-950">
                  {isCheckoutMode ? 'Customer Details' : `Shopping Bag (${totalItemsCount})`}
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

            {/* Cart Content or Checkout Form */}
            {!isCheckoutMode ? (
              // --- 1. CART ITEMS LIST VIEW ---
              <>
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
                    <AnimatePresence initial={false}>
                      {cartItems.map((item) => (
                        <motion.div
                          key={`${item.id}-${item.selectedWeight}`}
                          initial={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ 
                            opacity: 0, 
                            height: 0, 
                            paddingTop: 0, 
                            paddingBottom: 0, 
                            marginTop: 0, 
                            marginBottom: 0, 
                            scale: 0.9, 
                            transition: { duration: 0.25, ease: 'easeInOut' } 
                          }}
                          className="flex gap-4 p-4 bg-white rounded-2xl border border-brand-cream-100/40 shadow-sm relative group overflow-hidden"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-cream-100 shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

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

                              <span className="text-xs font-bold text-brand-brown-950">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id, item.selectedWeight)}
                            className="absolute top-3 right-3 text-brand-brown-800/40 hover:text-brand-orange-500 transition-colors p-1 rounded-md hover:bg-brand-cream-50 cursor-pointer"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="p-6 border-t border-brand-cream-100 bg-white space-y-4 shadow-lg shadow-brand-brown-950/5">
                    <div className="flex items-center justify-between text-brand-brown-950">
                      <span className="text-xs font-medium text-brand-brown-800/60">Subtotal</span>
                      <span className="text-lg font-bold">₹{totalAmount}</span>
                    </div>

                    {settings.emergencyDisableOrdering ? (
                      <div className="bg-rose-50 border border-rose-150 rounded-2xl p-4 text-center">
                        <p className="text-xs font-bold text-rose-700">Orders Temporarily Closed</p>
                        <p className="text-[10px] text-rose-600 mt-1 font-light leading-normal">
                          We are currently not accepting new orders. Please check back later or call direct!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => setIsCheckoutMode(true)}
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
                    )}
                  </div>
                )}
              </>
            ) : (
              // --- 2. CUSTOMER DETAILS CHECKOUT FORM ---
              <form onSubmit={handleCheckoutSubmit} className="flex-grow flex flex-col justify-between overflow-hidden">
                <div className="flex-grow overflow-y-auto p-6 space-y-5">
                  <div className="bg-brand-cream-100/50 border border-brand-cream-200/50 rounded-2xl p-4 flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-brand-gold-700 shadow-sm shrink-0">
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-brown-950">Almost Done!</p>
                      <p className="text-[10px] text-brand-brown-800/60 leading-normal font-light">
                        Please provide your contact details. Your order will be stored in our system and opened on WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Customer Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-brown-850 uppercase tracking-widest block">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-white border border-brand-cream-200 focus:border-brand-gold-500 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none transition-all"
                    />
                  </div>

                  {/* Customer Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-brown-850 uppercase tracking-widest block">WhatsApp Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full bg-white border border-brand-cream-200 focus:border-brand-gold-500 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none transition-all"
                    />
                  </div>

                  {/* Customer Address / Pickup info */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-brown-850 uppercase tracking-widest block">Delivery Address / Pickup Instructions</label>
                    <textarea
                      placeholder="E.g. Store Pickup, or home delivery details..."
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-brand-cream-200 focus:border-brand-gold-500 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none transition-all leading-normal"
                    />
                  </div>
                </div>

                {/* Form Footer */}
                <div className="p-6 border-t border-brand-cream-100 bg-white space-y-3 shadow-lg">
                  <div className="flex justify-between items-center text-brand-brown-950 mb-1 text-xs">
                    <span className="font-medium text-brand-brown-800/50">Total Payable Amount</span>
                    <span className="font-bold text-base">₹{totalAmount}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-gold-850 hover:bg-brand-gold-600 text-brand-brown-950 hover:text-white py-3.5 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm Order & Send WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCheckoutMode(false)}
                    className="w-full text-center text-[10px] font-semibold text-brand-brown-800/40 hover:text-brand-brown-800 py-1 transition-colors cursor-pointer"
                  >
                    Back to Bag
                  </button>
                </div>
              </form>
            )}

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
