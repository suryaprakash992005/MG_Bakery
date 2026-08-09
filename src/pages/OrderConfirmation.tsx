import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ShoppingBag,
  Home as HomeIcon,
  Store,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Printer
} from 'lucide-react';
import { useBakeryDatabase, UnifiedOrder } from '../context/DatabaseContext';

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, settings } = useBakeryDatabase();
  const [currentOrder, setCurrentOrder] = useState<UnifiedOrder | null>(null);

  useEffect(() => {
    if (orderId) {
      const match = orders.find(
        o => o.orderNumber === orderId || o.id === orderId || o.orderNumber === `#${orderId}`
      );
      if (match) {
        setCurrentOrder(match);
      } else if (orders.length > 0) {
        // Fallback to most recent order if matching by id string
        setCurrentOrder(orders[0]);
      }
    }
  }, [orderId, orders]);

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-playfair text-2xl font-bold text-[#2A0E0A] mb-2">Finding Your Order...</h2>
        <p className="text-xs text-[#2A0E0A]/60 max-w-sm mb-6">
          Thank you for ordering with M.G. Iyengar Bakery!
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="px-8 py-3 rounded-full bg-[#2A0E0A] text-[#C9A227] font-bold text-xs hover:bg-[#401C16] transition-all cursor-pointer shadow-md"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const isDelivery = currentOrder.orderType === 'delivery';

  return (
    <div className="min-h-screen bg-[#FAF6F0] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 🎉 CONFIRMATION CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2C1A17]/10 shadow-xl text-center space-y-5 relative overflow-hidden"
        >
          {/* Top Decorative Sparkles */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Order Successfully Placed!</span>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          {/* Main Title & Order Number */}
          <div className="space-y-1">
            <h1 className="font-playfair text-3xl font-extrabold text-[#2C1A17]">
              🎉 Order Confirmed!
            </h1>
            <p className="text-xs text-[#2C1A17]/60 font-light">
              Thank you, <strong className="text-[#2C1A17] font-semibold">{currentOrder.customerName}</strong>! Your bakery order has been received and confirmed.
            </p>
            <div className="pt-2">
              <span className="inline-block font-mono text-sm font-bold bg-[#2A0E0A] text-[#C9A227] px-4 py-1.5 rounded-xl shadow-sm">
                Order Number: {currentOrder.orderNumber}
              </span>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-4 border-t border-[#2C1A17]/10">
            <div className="p-3 bg-[#FAF6F0] rounded-2xl">
              <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Payment Status</span>
              <span className="text-xs font-extrabold text-emerald-700 uppercase flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentOrder.paymentStatus}
              </span>
            </div>

            <div className="p-3 bg-[#FAF6F0] rounded-2xl">
              <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Order Type</span>
              <span className="text-xs font-bold text-[#2C1A17] flex items-center gap-1 mt-0.5">
                {isDelivery ? <HomeIcon className="w-3.5 h-3.5 text-[#C9A227]" /> : <Store className="w-3.5 h-3.5 text-[#C9A227]" />}
                {isDelivery ? 'Home Delivery' : 'Shop Pickup'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF6F0] rounded-2xl">
              <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Total Amount</span>
              <span className="text-xs font-bold text-[#2C1A17] mt-0.5 block">₹{currentOrder.amount}</span>
            </div>

            <div className="p-3 bg-[#FAF6F0] rounded-2xl">
              <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Order Status</span>
              <span className="text-xs font-bold text-[#2A0E0A] mt-0.5 block">{currentOrder.orderStatus}</span>
            </div>
          </div>
        </motion.div>

        {/* ORDER ITEMS & ADDRESS BREAKDOWN */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2C1A17]/10 shadow-sm space-y-6">
          <h3 className="font-playfair text-lg font-bold text-[#2C1A17] border-b border-[#2C1A17]/5 pb-3 flex items-center justify-between">
            <span>Ordered Items</span>
            <span className="text-xs text-[#C9A227] font-semibold">{currentOrder.items.length} items</span>
          </h3>

          <div className="space-y-3">
            {currentOrder.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6F0]/60 border border-[#2C1A17]/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0">
                    {item.quantity}x
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#2C1A17]">{item.productName || item.name}</h5>
                    <span className="text-[10px] font-semibold text-[#C9A227] bg-[#2A0E0A] px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      {item.selectedWeight}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-xs text-[#2C1A17]">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Delivery or Pickup Details */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#2C1A17]/10 space-y-2 text-xs">
            <h4 className="font-bold text-xs text-[#2C1A17] flex items-center gap-2">
              {isDelivery ? <MapPin className="w-4 h-4 text-[#C9A227]" /> : <Store className="w-4 h-4 text-[#C9A227]" />}
              <span>{isDelivery ? 'Delivery Address' : 'Shop Pickup Location'}</span>
            </h4>
            <p className="text-xs text-[#2C1A17]/80 font-light leading-relaxed pl-6">
              {isDelivery ? currentOrder.deliveryAddress : settings.storeAddress}
            </p>
            {!isDelivery && (
              <p className="text-[11px] text-[#2C1A17]/60 pl-6 pt-1">
                Store Hours: {settings.openingTime || '9:00 AM'} - {settings.closingTime || '10:00 PM'} | Contact: {settings.whatsappNumber}
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white border border-[#2C1A17]/15 hover:bg-[#FAF6F0] text-[#2C1A17] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => navigate('/menu')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#2A0E0A]/20"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
