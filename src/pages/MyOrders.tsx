import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Clock,
  ArrowRight, RotateCcw, MessageCircle, FileText,
  MapPin, Sparkles, ChevronRight, Package, Store,
  CheckCircle2, Flame, Truck
} from 'lucide-react';
import { useBakeryDatabase, UnifiedOrder, isMockOrder } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const MyOrders: React.FC = () => {
  const { orders, products, settings } = useBakeryDatabase();
  const { profile, user, setIsAuthModalOpen } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialSearchPhone = searchParams.get('phone') || '';
  const initialSearchOrder = searchParams.get('order') || '';

  // Load saved local order history IDs from this browser/device
  const localSavedOrderIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('my_orders_history') || '[]');
    } catch {
      return [];
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'PICKUP'>('ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearchOrder || initialSearchPhone || '');
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);

  // Filter orders matching user, local history, or search query
  const matchingOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const userPhone10 = profile?.phone ? profile.phone.replace(/\D/g, '').slice(-10) : '';
    const userEmailLower = (user?.email || profile?.email || '').toLowerCase().trim();

    // Filter out any mock orders completely
    const validOrders = orders.filter(ord => !isMockOrder(ord));

    return validOrders.filter(ord => {
      const ordPhone10 = ord.phone ? ord.phone.replace(/\D/g, '').slice(-10) : '';
      const ordEmailLower = (ord.customerEmail || ord.email || '').toLowerCase().trim();
      const ordNumLower = (ord.orderNumber || '').toLowerCase();
      const ordIdLower = (ord.id || '').toLowerCase();
      const ordNameLower = (ord.customerName || '').toLowerCase();
      const itemNames = (ord.items || []).map(i => (i.productName || i.name || '').toLowerCase()).join(' ');

      // Check if order belongs to user or was placed on this device
      const isUserOrder = Boolean(
        (user?.id && (ord.userId === user.id || (ord as any).user_id === user.id)) ||
        (userPhone10 && userPhone10.length === 10 && ordPhone10 === userPhone10) ||
        (userEmailLower && ordEmailLower && ordEmailLower === userEmailLower) ||
        (localSavedOrderIds.includes(ord.id) || localSavedOrderIds.includes(ord.orderNumber))
      );

      // If user typed a search query
      if (q) {
        const matchesQuery =
          ordNumLower.includes(q) ||
          ordIdLower.includes(q) ||
          ordPhone10.includes(q) ||
          ordNameLower.includes(q) ||
          itemNames.includes(q);
        if (!matchesQuery) return false;
      } else {
        // When no search query: only show orders belonging to this user or device
        // If neither user nor local orders exist yet, we only match if user searched
        if (!user?.id && localSavedOrderIds.length === 0) {
          return false;
        }
        if (!isUserOrder) return false;
      }

      // Tab Filtering
      const normStatus = (String(ord.orderStatus || '')).toUpperCase().replace(/_/g, ' ');
      if (activeTab === 'ACTIVE') {
        return ['ORDER PLACED', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT FOR DELIVERY'].includes(normStatus);
      }
      if (activeTab === 'DELIVERED') {
        return ['DELIVERED', 'PICKED UP', 'COMPLETED'].includes(normStatus);
      }
      if (activeTab === 'PICKUP') {
        return ord.orderType === 'pickup';
      }

      return true;
    }).sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime());
  }, [orders, searchQuery, activeTab, profile, user, localSavedOrderIds]);

  // Set default selected order on load or update
  useEffect(() => {
    if (matchingOrders.length > 0) {
      if (!selectedOrder || !matchingOrders.some(o => o.id === selectedOrder.id)) {
        setSelectedOrder(matchingOrders[0]);
      }
    } else {
      setSelectedOrder(null);
    }
  }, [matchingOrders, selectedOrder]);

  const handleReorder = (order: UnifiedOrder) => {
    order.items?.forEach(item => {
      const matchedProd = products.find(p => p.id === (item.productId || item.id));
      if (matchedProd) {
        addToCart(matchedProd, item.selectedWeight || 'Standard', item.quantity || 1);
      }
    });
    setReorderedOrderId(order.id);
    setTimeout(() => {
      setReorderedOrderId(null);
      navigate('/menu');
    }, 1200);
  };

  const getWhatsAppSupportLink = (order: UnifiedOrder) => {
    const phone = (settings?.whatsappNumber || WHATSAPP_PHONE_NUMBER).replace(/[^0-9]/g, '');
    const msg = `Hello M.G. Iyengar Bakery, I have a question regarding my Order #${order.orderNumber || order.id?.slice(0, 8)} (${order.customerName}).`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Helper for human-friendly order status display
  const getStatusBadge = (status?: string) => {
    const s = String(status || '').toUpperCase().replace(/_/g, ' ');
    switch (s) {
      case 'DELIVERED':
      case 'PICKED UP':
      case 'COMPLETED':
        return { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'OUT FOR DELIVERY':
      case 'READY':
      case 'READY FOR PICKUP':
        return { label: 'Out for Delivery / Ready', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' };
      case 'PREPARING':
        return { label: 'Baking in Oven', bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500 animate-pulse' };
      default:
        return { label: 'Order Placed', bg: 'bg-[#C9A227]/15 text-[#2A0E0A] border-[#C9A227]/30', dot: 'bg-[#C9A227]' };
    }
  };

  const getStepIndex = (status?: string) => {
    const s = String(status || '').toUpperCase().replace(/_/g, ' ');
    switch (s) {
      case 'DELIVERED':
      case 'PICKED UP':
      case 'COMPLETED':
        return 3;
      case 'OUT FOR DELIVERY':
      case 'READY':
      case 'READY FOR PICKUP':
        return 2;
      case 'PREPARING':
        return 1;
      default:
        return 0; // ORDER_PLACED
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[92px] lg:pt-[96px] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page Header & Quick Search Bar ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C1A17]/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#C9A227]/15 text-[#2A0E0A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Personal Bakery Receipts</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#2A0E0A]">
              Order History
            </h1>
            <p className="text-xs sm:text-sm text-[#2C1A17]/65 mt-1">
              Track live orders, inspect digital invoices, or re-order your favorite bakery treats with one tap.
            </p>
          </div>

          {/* Quick Search & Auth Prompt */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C1A17]/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search orders or items…"
                className="w-full pl-8 pr-7 py-2 bg-white border border-[#2C1A17]/15 rounded-full text-xs font-semibold focus:outline-none focus:border-[#C9A227] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40 hover:text-[#2A0E0A] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="chip-btn flex items-center gap-1.5 px-4 py-2 bg-white border border-[#2C1A17]/20 hover:border-[#C9A227] text-[#2A0E0A] text-xs font-bold rounded-full shadow-2xs cursor-pointer transition-all min-h-0 min-w-0"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3 h-3 text-[#C9A227]" />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: `All Orders (${matchingOrders.length})` },
            { id: 'ACTIVE', label: 'Active & In Oven' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'PICKUP', label: 'Shop Pickup' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`chip-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer min-h-0 min-w-0 ${
                activeTab === tab.id
                  ? 'bg-[#2A0E0A] text-[#C9A227] shadow-sm'
                  : 'bg-white text-[#2C1A17]/65 hover:text-[#2A0E0A] border border-[#2C1A17]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Main Content: Order History ── */}
        {matchingOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#2C1A17]/10 space-y-4 max-w-xl mx-auto shadow-sm">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto text-[#C9A227] shadow-inner"
            >
              <ShoppingBag className="w-8 h-8" />
            </motion.div>
            <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#2A0E0A]">
              {searchQuery ? 'No Matching Orders' : 'No Previous Orders Yet'}
            </h3>
            <p className="text-xs text-[#2C1A17]/65 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'No orders found matching your search. Check your order number or clear search.'
                : 'When you order fresh cakes, hot savories, or chats, your live status and invoices will be saved here automatically.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5 justify-center">
              <button
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2A0E0A] text-[#C9A227] text-xs font-bold rounded-full cursor-pointer hover:bg-[#401C16] transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Browse Bakery Menu</span>
              </button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2.5 bg-white border border-[#2C1A17]/20 text-[#2A0E0A] text-xs font-bold rounded-full cursor-pointer hover:bg-[#FAF7F2] transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Order Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-[#2C1A17]/50 px-1">
                Your Orders List
              </h2>

              <div className="space-y-3 max-h-[750px] overflow-y-auto no-scrollbar pr-0.5">
                {matchingOrders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  const statusInfo = getStatusBadge(order.orderStatus);

                  return (
                    <motion.div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#C9A227] shadow-md ring-2 ring-[#C9A227]/20'
                          : 'bg-white/85 border-[#2C1A17]/10 hover:border-[#2C1A17]/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#2A0E0A] font-playfair">
                              #{order.orderNumber || order.id?.slice(0, 8)}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusInfo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                              <span>{statusInfo.label}</span>
                            </span>
                          </div>

                          <p className="text-[11px] text-[#2C1A17]/50 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C9A227]" />
                            {order.createdDate
                              ? new Date(order.createdDate).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })
                              : 'Recent'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-[#2A0E0A] font-playfair">
                            ₹{order.amount?.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[9px] text-[#2C1A17]/60 font-semibold bg-[#FAF7F2] border border-[#2C1A17]/10 px-2 py-0.5 rounded-full inline-block mt-1">
                            {order.orderType === 'pickup' ? 'Shop Pickup' : 'Mohanur Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Mini item list preview with image thumbnails */}
                      <div className="mt-3 pt-3 border-t border-[#2C1A17]/8 flex items-center justify-between text-xs text-[#2C1A17]/70">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                            {order.items?.slice(0, 3).map((it, idx) => (
                              it.image ? (
                                <img
                                  key={idx}
                                  src={it.image}
                                  alt={it.name || ''}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                />
                              ) : null
                            ))}
                          </div>
                          <span className="truncate text-[11px] font-medium text-[#2A0E0A]">
                            {order.items?.map(i => `${i.quantity}x ${i.productName || i.name}`).join(', ') || 'Bakery treats'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Order Details (7 cols) */}
            {selectedOrder && (
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#2C1A17]/10 space-y-6">

                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C1A17]/10 pb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                        Order Receipt Details
                      </span>
                      <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#2A0E0A]">
                        Order #{selectedOrder.orderNumber || selectedOrder.id?.slice(0, 8)}
                      </h2>
                      <p className="text-xs text-[#2C1A17]/55 mt-0.5">
                        Customer: <strong>{selectedOrder.customerName}</strong> • {selectedOrder.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowInvoiceModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#2C1A17]/15 rounded-xl text-xs font-bold text-[#2A0E0A] cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Tax Invoice</span>
                      </button>

                      <a
                        href={getWhatsAppSupportLink(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-bold text-green-800 cursor-pointer transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        <span>Help</span>
                      </a>
                    </div>
                  </div>

                  {/* Live Bakery 4-Step Tracker */}
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#2C1A17]/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A0E0A]">
                          Live Bakery Order Status
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getStatusBadge(selectedOrder.orderStatus).bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedOrder.orderStatus).dot}`} />
                        <span>{getStatusBadge(selectedOrder.orderStatus).label}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {/* Connecting line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#2C1A17]/10 -z-0" />
                      
                      {(() => {
                        const stepIndex = getStepIndex(selectedOrder.orderStatus);
                        const isPickup = selectedOrder.orderType === 'pickup';
                        const steps = [
                          { label: 'Received', sub: 'Order Confirmed', icon: CheckCircle2 },
                          { label: 'Baking', sub: 'In Hot Oven', icon: Flame },
                          { label: isPickup ? 'Ready' : 'On The Way', sub: isPickup ? 'At Counter' : 'Delivery Partner', icon: isPickup ? Store : Truck },
                          { label: isPickup ? 'Picked Up' : 'Delivered', sub: 'Enjoy Fresh!', icon: Sparkles },
                        ];

                        return steps.map((s, idx) => {
                          const IconComp = s.icon;
                          const isDone = idx <= stepIndex;
                          const isCurrent = idx === stepIndex;

                          return (
                            <div key={idx} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                                  isCurrent
                                    ? 'bg-[#2A0E0A] text-[#C9A227] ring-4 ring-[#C9A227]/25 scale-110'
                                    : isDone
                                    ? 'bg-[#C9A227] text-[#2A0E0A]'
                                    : 'bg-white border border-[#2C1A17]/20 text-[#2C1A17]/30'
                                }`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-bold mt-2 leading-tight ${isCurrent ? 'text-[#2A0E0A]' : isDone ? 'text-[#2A0E0A]/80' : 'text-[#2C1A17]/40'}`}>
                                {s.label}
                              </span>
                              <span className="text-[8px] text-[#2C1A17]/50 hidden sm:block mt-0.5 leading-none">
                                {s.sub}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#FAF7F2] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Order Type</span>
                      <span className="text-xs font-bold text-[#2A0E0A] mt-0.5 block capitalize">
                        {selectedOrder.orderType === 'pickup' ? 'Shop Pickup' : 'Home Delivery'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Order Date</span>
                      <span className="text-xs font-bold text-[#2A0E0A] mt-0.5 block">
                        {selectedOrder.createdDate || 'Recent'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Delivery Fee</span>
                      <span className="text-xs font-bold text-green-700 mt-0.5 block">
                        {selectedOrder.deliveryFee > 0 ? `₹${selectedOrder.deliveryFee}` : 'FREE'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-2xl">
                      <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-xs font-black text-[#2A0E0A] mt-0.5 block">
                        ₹{selectedOrder.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Ordered Items List with Price Snapshot */}
                  <div className="space-y-3 pt-2 border-t border-[#2C1A17]/10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60">
                      Ordered Products & Quantities
                    </h3>

                    <div className="space-y-2.5">
                      {selectedOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#2C1A17]/8 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName || item.name}
                                className="w-11 h-11 rounded-xl object-cover"
                              />
                            )}
                            <div>
                              <p className="font-bold text-[#2A0E0A]">
                                {item.productName || item.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-[#2C1A17]/60">
                                  Size: {item.selectedWeight}
                                </span>
                                <span className="text-[10px] text-[#2C1A17]/60">
                                  • Qty: {item.quantity}
                                </span>
                                <span className="text-[10px] font-semibold text-[#C9A227]">
                                  • ₹{item.price} each
                                </span>
                              </div>
                              {item.customizations && Object.entries(item.customizations).map(([k, v]) =>
                                v ? <p key={k} className="text-[10px] text-[#2C1A17]/40 mt-0.5">{k}: {v}</p> : null
                              )}
                            </div>
                          </div>

                          <span className="font-black text-[#2A0E0A] text-sm shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery / Address Info */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#2C1A17]/8 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2A0E0A]">
                      <MapPin className="w-4 h-4 text-[#C9A227]" />
                      <span>{selectedOrder.orderType === 'pickup' ? 'Shop Pickup Location' : 'Delivery Address'}</span>
                    </div>
                    <p className="text-xs text-[#2C1A17]/70 pl-6 leading-relaxed">
                      {selectedOrder.orderType === 'pickup'
                        ? (settings?.storeAddress || 'M.G. Iyengar Bakery & Chats, Main Road, Mohanur, Namakkal - 637015')
                        : `${selectedOrder.deliveryAddress || ''} ${selectedOrder.streetArea || ''}, ${selectedOrder.city || 'Mohanur'} - ${selectedOrder.pincode || '637015'}`}
                    </p>
                  </div>

                  {/* Reorder Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3.5 rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{reorderedOrderId === selectedOrder.id ? 'Added to Cart! Redirecting…' : 'Order Again (Add Items to Cart)'}</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── Invoice / Digital Receipt Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showInvoiceModal && selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5 border border-[#C9A227]/20"
            >
              {/* Receipt Header */}
              <div className="text-center border-b border-[#2C1A17]/10 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#2A0E0A] text-[#C9A227] flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#2A0E0A]">
                  M.G. Iyengar Bakery & Chats
                </h3>
                <p className="text-[10px] text-[#2C1A17]/60">Mohanur, Namakkal • WhatsApp: +91 {settings?.whatsappNumber || WHATSAPP_PHONE_NUMBER}</p>
                <p className="text-xs font-bold text-[#C9A227] mt-1">
                  Order Invoice & Receipt
                </p>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 text-xs text-[#2C1A17]/70 py-2 border-b border-[#2C1A17]/10 gap-2">
                <div>
                  <p><strong>Order No:</strong> #{selectedOrder.orderNumber || selectedOrder.id?.slice(0, 8)}</p>
                  <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {selectedOrder.createdDate ? new Date(selectedOrder.createdDate).toLocaleDateString('en-IN') : 'Recent'}</p>
                  <p><strong>Method:</strong> WhatsApp Order</p>
                  <p><strong>Type:</strong> {selectedOrder.orderType === 'pickup' ? 'PICKUP' : 'HOME DELIVERY'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2A0E0A]">{item.quantity}x {item.productName || item.name}</span>
                      <span className="text-[10px] text-[#2C1A17]/50 ml-1.5">({item.selectedWeight})</span>
                    </div>
                    <span className="font-semibold text-[#2A0E0A]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Breakdown */}
              <div className="border-t border-[#2C1A17]/10 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-[#2C1A17]/60">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN') || selectedOrder.amount}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-[#2C1A17]/60">
                    <span>Delivery Fee:</span>
                    <span>₹{selectedOrder.deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-[#2A0E0A] pt-1 border-t border-[#2C1A17]/10">
                  <span>Total Amount:</span>
                  <span className="text-[#C9A227]">₹{selectedOrder.amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-[#FAF7F2] hover:bg-[#F0E8D8] border border-[#2C1A17]/15 text-[#2A0E0A] font-bold rounded-2xl text-xs cursor-pointer transition-all"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 py-3 bg-[#2A0E0A] text-[#C9A227] font-bold rounded-2xl text-xs cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
