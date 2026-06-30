import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, ArrowLeft, Landmark, ChevronRight, Gift, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';

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
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  // Form states
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Free delivery threshold config
  const DELIVERY_THRESHOLD = 300;
  const remainingForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - totalAmount);
  const deliveryProgressPercentage = Math.min(100, (totalAmount / DELIVERY_THRESHOLD) * 100);

  // Reset checkout mode when drawer closes
  React.useEffect(() => {
    if (!isCartOpen) {
      setIsCheckoutMode(false);
    }
  }, [isCartOpen]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
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
    const createdOrder = addOrder({
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
    closed: { x: '100%', opacity: 0.8 },
    open: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring' as const, damping: 32, stiffness: 300 }
    },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 30 } },
    exit: { opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }
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
            className="fixed top-0 right-0 bottom-0 left-auto h-full w-[92vw] sm:w-[88vw] max-w-[430px] bg-gradient-to-b from-[#FFFDFB] via-[#FCFAF7] to-[#FAF8F5] shadow-2xl z-[101] flex flex-col border-l border-brand-gold-250/20 rounded-l-[2rem] md:rounded-l-[2.5rem] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-brand-cream-100 bg-white flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-3">
                {isCheckoutMode ? (
                  <button 
                    onClick={() => setIsCheckoutMode(false)}
                    className="p-1.5 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 mr-1 active:scale-95 transition-transform cursor-pointer"
                    aria-label="Back to cart list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <motion.div 
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                    className="w-10 h-10 rounded-full bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] shadow-md"
                  >
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </motion.div>
                )}
                <div>
                  <h2 className="font-playfair text-base font-extrabold text-brand-brown-950 leading-tight">
                    {isCheckoutMode ? 'Customer Details' : 'Your Shopping Bag'}
                  </h2>
                  {!isCheckoutMode && (
                    <span className="block text-[9px] text-[#C9A227] font-extrabold uppercase tracking-widest mt-0.5">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-brand-cream-100 text-brand-brown-800 hover:text-brand-brown-950 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Myntra-style Free Delivery Progress Tracker */}
            {!isCheckoutMode && cartItems.length > 0 && (
              <div className="bg-[#FAF5EC] border-b border-brand-cream-100/70 p-4 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-brown-950">
                    <Gift className="w-3.5 h-3.5 text-brand-gold-700 animate-pulse" />
                    {remainingForFreeDelivery > 0 ? (
                      <span>Add <strong className="text-brand-gold-700">₹{remainingForFreeDelivery}</strong> more for Free Delivery</span>
                    ) : (
                      <span className="text-[#2E7D32]">Congrats! You unlocked Free Delivery! 🎉</span>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-brown-800/50 font-bold uppercase">{Math.round(deliveryProgressPercentage)}%</span>
                </div>
                <div className="w-full h-2 bg-brand-cream-200/60 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${deliveryProgressPercentage}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-brand-gold-500 to-[#C9A227] rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Cart Content or Checkout Form */}
            {!isCheckoutMode ? (
              // --- 1. CART ITEMS LIST VIEW ---
              <>
                <div className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-6">
                      <div className="relative">
                        <motion.div 
                          animate={{ 
                            rotate: [0, -8, 8, -6, 6, 0],
                            y: [0, -4, 0] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2.2, 
                            repeatDelay: 0.5 
                          }}
                          className="w-24 h-24 rounded-full bg-brand-cream-100/60 flex items-center justify-center text-brand-brown-950/65 shadow-inner cursor-pointer"
                        >
                          <ShoppingBag className="w-10 h-10" />
                        </motion.div>
                        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#C9A227] flex items-center justify-center text-xs font-black text-[#FAF7F2] shadow-md">
                          0
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-playfair text-lg font-black text-brand-brown-950 tracking-wide">
                          Your Bag is Empty
                        </h3>
                        <p className="text-xs text-brand-brown-800/60 font-light leading-relaxed max-w-xs">
                          Treat yourself to our artisan cupcakes, hot pastries, fresh bread, and customize your celebration cakes today.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div layout className="space-y-3">
                      <AnimatePresence initial={false}>
                        {cartItems.map((item) => (
                          <motion.div
                            key={`${item.id}-${item.selectedWeight}`}
                            variants={listItemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                            className="flex gap-4 p-4 bg-white rounded-3xl border border-brand-cream-100/40 shadow-sm hover:shadow-md hover:border-[#C9A227]/25 transition-all duration-300 relative group overflow-hidden"
                          >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-cream-100 shrink-0 shadow-sm border border-brand-cream-200/30">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>

                            <div className="flex-grow flex flex-col justify-between py-0.5">
                              <div>
                                <h4 className="text-xs font-bold text-brand-brown-950 leading-snug pr-6">
                                  {item.name}
                                </h4>
                                <span className="inline-block text-[9px] font-bold bg-[#FAF6F0] text-[#C9A227] border border-brand-gold-250/20 px-2 py-0.5 rounded-full mt-1.5">
                                  {item.selectedWeight === 'single' || item.selectedWeight === 'Standard'
                                    ? 'Standard'
                                    : item.selectedWeight}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-3">
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

                            <button
                              onClick={() => removeFromCart(item.id, item.selectedWeight)}
                              className="absolute top-3 right-3 text-brand-brown-800/40 hover:text-brand-orange-500 hover:bg-brand-cream-50 p-1.5 rounded-full cursor-pointer transition-all"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="p-5 border-t border-brand-cream-100 bg-white space-y-4 shadow-lg shrink-0">
                    
                    {/* Price Details Accordion Breakdown */}
                    <div className="border border-brand-cream-200/50 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setShowPriceDetails(!showPriceDetails)}
                        className="w-full flex items-center justify-between p-3.5 bg-brand-cream-50/50 text-xs font-bold text-brand-brown-950 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-brand-gold-700" />
                          <span>Price Details ({totalItemsCount} items)</span>
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showPriceDetails ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showPriceDetails && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-white px-4 border-t border-brand-cream-100/50 text-[11px] text-brand-brown-800/80 space-y-2.5"
                          >
                            <div className="pt-3 flex justify-between">
                              <span>Total MRP</span>
                              <span className="font-semibold text-brand-brown-950">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              {remainingForFreeDelivery === 0 ? (
                                <span className="font-bold text-[#2E7D32]">FREE</span>
                              ) : (
                                <span className="font-semibold text-brand-brown-950">₹40</span>
                              )}
                            </div>
                            <div className="flex justify-between pb-3 text-xs font-bold text-brand-brown-950 border-t border-brand-cream-100/40 pt-2.5">
                              <span>Total Amount</span>
                              <span>₹{totalAmount}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between text-brand-brown-950 py-1">
                      <div>
                        <span className="text-[10px] font-bold text-brand-brown-800/45 uppercase tracking-widest block">Total Payable</span>
                        <span className="text-[10px] text-[#C9A227] font-semibold">inclusive of all taxes</span>
                      </div>
                      <span className="text-2xl font-bold font-playfair">₹{totalAmount}</span>
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
                          className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] py-4 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-lg shadow-[#2A0E0A]/10 cursor-pointer group overflow-hidden relative"
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                          <Send className="w-4 h-4 text-[#C9A227] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-350" />
                          <span>Proceed to Checkout</span>
                        </button>
                        <button
                          onClick={clearCart}
                          className="w-full text-center text-[9px] font-bold uppercase tracking-wider text-brand-brown-850/40 hover:text-brand-orange-500 py-1 transition-colors cursor-pointer"
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
                <div className="flex-grow overflow-y-auto p-5 space-y-5 no-scrollbar">
                  <div className="bg-brand-cream-100/50 border border-brand-cream-200/50 rounded-2xl p-4 flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#C9A227] shadow-sm shrink-0">
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
                      className="w-full bg-white border border-brand-cream-200 focus:border-[#C9A227] rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none transition-all"
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
                      className="w-full bg-white border border-brand-cream-200 focus:border-[#C9A227] rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none transition-all"
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
                      className="w-full bg-white border border-brand-cream-200 focus:border-[#C9A227] rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none transition-all leading-normal"
                    />
                  </div>
                </div>

                {/* Form Footer */}
                <div className="p-5 border-t border-brand-cream-100 bg-white space-y-3 shadow-lg shrink-0">
                  <div className="flex justify-between items-center text-brand-brown-950 mb-1 text-xs">
                    <span className="font-medium text-brand-brown-800/50">Total Payable Amount</span>
                    <span className="font-bold text-base">₹{totalAmount}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] py-4 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-lg shadow-[#2A0E0A]/10 cursor-pointer group overflow-hidden relative"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                    <Send className="w-4 h-4 text-[#C9A227] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-350" />
                    <span>Confirm Order & Send WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCheckoutMode(false)}
                    className="w-full text-center text-[9px] font-bold uppercase tracking-wider text-brand-brown-850/40 hover:text-brand-brown-800 py-1 transition-colors cursor-pointer"
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
