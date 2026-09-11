import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Home as HomeIcon,
  Store,
  Phone,
  Search,
  Eye,
  Calendar,
  X,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { useBakeryDatabase, UnifiedOrder } from '../../context/DatabaseContext';

export const Orders: React.FC = () => {
  const { orders, updateOrderStatus, fetchOrdersFromSupabase } = useBakeryDatabase();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalOrder, setActiveModalOrder] = useState<UnifiedOrder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrdersFromSupabase();
    setIsRefreshing(false);
  };

  // Filter orders based on status tab & search query
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'All') return true;
    const s = (order.orderStatus || '').toUpperCase();
    if (selectedFilter === 'Order Placed') return s.includes('PLACED') || s.includes('PENDING');
    if (selectedFilter === 'Confirmed') return s === 'CONFIRMED';
    if (selectedFilter === 'Preparing') return s === 'PREPARING';
    if (selectedFilter === 'Ready / Out') return s.includes('READY') || s.includes('OUT');
    if (selectedFilter === 'Delivered') return s.includes('DELIVERED') || s.includes('PICKED');
    if (selectedFilter === 'Cancelled') return s === 'CANCELLED';

    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('PAID') || s.includes('DELIVERED') || s.includes('PICKED UP')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (s.includes('PREPARING') || s.includes('READY')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (s.includes('CONFIRMED') || s.includes('OUT FOR DELIVERY')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (s.includes('CANCELLED') || s.includes('FAILED')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#2C1A17]/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold-850 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4 text-brand-gold-850" />
            <span>Orders Management</span>
          </div>
          <h1 className="font-playfair text-2xl font-extrabold text-[#2C1A17] mt-1">
            Customer Orders
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF6F0] hover:bg-[#F3EDE2] border border-[#2C1A17]/10 rounded-2xl text-xs font-bold text-[#2A0E0A] cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
          <div className="bg-[#FAF6F0] border border-[#2C1A17]/10 rounded-2xl px-4 py-2 text-xs font-bold text-[#2C1A17]">
            Total Orders: <strong className="text-brand-gold-850 text-sm ml-1">{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {['All', 'Order Placed', 'Confirmed', 'Preparing', 'Ready / Out', 'Delivered', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === tab
                  ? 'bg-[#2A0E0A] text-[#C9A227] shadow-md'
                  : 'bg-white text-[#2C1A17]/70 hover:bg-[#FAF6F0] border border-[#2C1A17]/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search order #, name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#2C1A17]/40 absolute left-3 top-3" />
        </div>
      </div>

      {/* Orders List Table / Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#2C1A17]/10 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#2C1A17]/40 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">No Orders Found</h3>
          <p className="text-xs text-[#2C1A17]/60 max-w-sm mx-auto font-light">
            No customer orders match the selected status or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const isDelivery = order.orderType === 'delivery';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-[#2C1A17]/10 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C1A17]/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-extrabold bg-[#2A0E0A] text-[#C9A227] px-3 py-1 rounded-xl">
                      {order.orderNumber || `#${order.id}`}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                      order.paymentStatus === 'PAID' || order.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>

                  <div className="text-xs text-[#2C1A17]/50 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>{order.createdDate}</span>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Customer Info */}
                  <div className="md:col-span-4 space-y-1">
                    <h4 className="font-bold text-sm text-[#2C1A17]">{order.customerName}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#2C1A17]/70 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
                      <a href={`tel:${order.phone}`} className="hover:underline font-bold text-[#2A0E0A]">{order.phone}</a>
                    </div>
                  </div>

                  {/* Order Type & Address */}
                  <div className="md:col-span-5 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A0E0A]">
                      {isDelivery ? <HomeIcon className="w-3.5 h-3.5 text-[#C9A227]" /> : <Store className="w-3.5 h-3.5 text-[#C9A227]" />}
                      <span>{isDelivery ? 'Home Delivery (Mohanur)' : 'Shop Pickup'}</span>
                    </div>
                    <p className="text-xs text-[#2C1A17]/70 line-clamp-2 font-light">
                      {isDelivery ? order.deliveryAddress || 'Mohanur Address' : 'M.G. Iyengar Bakery Shop'}
                    </p>
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#2C1A17]/5">
                    <div>
                      <span className="text-[10px] text-[#2C1A17]/50 font-bold uppercase block">Total</span>
                      <span className="font-playfair text-lg font-bold text-[#2A0E0A]">₹{order.amount}</span>
                    </div>

                    <button
                      onClick={() => setActiveModalOrder(order)}
                      className="px-4 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#2A0E0A] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                {/* Items Summary Line */}
                <div className="bg-[#FAF6F0] p-3 rounded-2xl text-xs flex items-center justify-between text-[#2C1A17]/80 font-medium">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span className="line-clamp-1">{order.orderedProduct || `${order.items.length} items`}</span>
                  </div>

                  {/* Lifecycle Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(order.orderStatus === 'ORDER PLACED' || order.orderStatus === 'ORDER_PLACED' || order.orderStatus === 'PENDING PAYMENT') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer shadow-xs"
                      >
                        Accept & Confirm
                      </button>
                    )}
                    {order.orderStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.orderStatus === 'PREPARING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, isDelivery ? 'OUT FOR DELIVERY' : 'READY FOR PICKUP')}
                        className="px-3 py-1 rounded-lg bg-[#2A0E0A] text-[#C9A227] font-bold text-[10px] cursor-pointer"
                      >
                        {isDelivery ? 'Out for Delivery' : 'Ready for Pickup'}
                      </button>
                    )}
                    {(order.orderStatus === 'OUT FOR DELIVERY' || order.orderStatus === 'READY FOR PICKUP') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, isDelivery ? 'DELIVERED' : 'PICKED UP')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                      >
                        {isDelivery ? 'Mark Delivered' : 'Mark Picked Up'}
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {activeModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#2C1A17]/10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveModalOrder(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#FAF6F0] text-[#2C1A17]/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-extrabold bg-[#2A0E0A] text-[#C9A227] px-3.5 py-1.5 rounded-xl">
                  {activeModalOrder.orderNumber || `#${activeModalOrder.id}`}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${getStatusBadgeClass(activeModalOrder.orderStatus)}`}>
                  {activeModalOrder.orderStatus}
                </span>
              </div>

              <div className="space-y-3 text-xs border-y border-[#2C1A17]/10 py-4">
                <div className="flex justify-between">
                  <span className="text-[#2C1A17]/60">Customer Name</span>
                  <span className="font-bold text-[#2C1A17]">{activeModalOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A17]/60">Phone Number</span>
                  <a href={`tel:${activeModalOrder.phone}`} className="font-bold text-[#2A0E0A] underline">{activeModalOrder.phone}</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A17]/60">Order Type</span>
                  <span className="font-bold text-[#2C1A17] capitalize">{activeModalOrder.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A17]/60">Payment Method</span>
                  <span className="font-bold text-[#2C1A17] uppercase">{activeModalOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A17]/60">Payment Status</span>
                  <span className="font-bold text-emerald-700 uppercase">{activeModalOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2C1A17]/60">Address</span>
                  <span className="font-bold text-[#2C1A17] text-right max-w-xs">{activeModalOrder.deliveryAddress || 'Pickup from Store'}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between bg-[#FAF6F0] p-3 rounded-2xl">
                <span className="font-bold text-[#2C1A17] text-xs">Update Status:</span>
                <select
                  value={activeModalOrder.orderStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    updateOrderStatus(activeModalOrder.id, newStatus);
                    setActiveModalOrder({ ...activeModalOrder, orderStatus: newStatus });
                  }}
                  className="bg-white border border-[#2C1A17]/20 rounded-xl px-3 py-1.5 text-xs font-bold text-[#2A0E0A] focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="ORDER PLACED">ORDER PLACED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                  <option value="READY FOR PICKUP">READY FOR PICKUP</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="PICKED UP">PICKED UP</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs text-[#2C1A17] uppercase tracking-wider">Ordered Items</h5>
                {activeModalOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF6F0] text-xs">
                    <div>
                      <span className="font-bold text-[#2C1A17]">{item.quantity}x {item.productName || item.name}</span>
                      <span className="block text-[10px] text-[#C9A227] font-semibold">{item.selectedWeight}</span>
                    </div>
                    <span className="font-bold text-[#2C1A17]">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Total & Action controls */}
              <div className="pt-2 border-t border-[#2C1A17]/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#2C1A17]/50 font-bold uppercase block">Grand Total</span>
                  <span className="font-playfair text-xl font-bold text-[#2A0E0A]">₹{activeModalOrder.amount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${activeModalOrder.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${activeModalOrder.customerName}, regarding your order #${activeModalOrder.orderNumber || activeModalOrder.id} with M.G. Iyengar Bakery...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      updateOrderStatus(activeModalOrder.id, 'CANCELLED');
                      setActiveModalOrder(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setActiveModalOrder(null)}
                    className="px-5 py-2 rounded-xl bg-[#2A0E0A] text-[#C9A227] font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
