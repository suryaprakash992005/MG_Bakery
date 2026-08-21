import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Phone, Clock, CheckCircle2,
  ArrowRight, RotateCcw, MessageCircle, FileText,
  MapPin, Sparkles, ChevronRight, Package
} from 'lucide-react';
import { useBakeryDatabase, UnifiedOrder } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ─── Status Pipeline Steps ────────────────────────────────────────────────────

const ORDER_STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Bakery received your order' },
  { key: 'PREPARING', label: 'Baking & Preparing', desc: 'Fresh in the oven' },
  { key: 'READY', label: 'Quality Packed', desc: 'Ready & sanitized' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery / Ready', desc: 'On the way to you' },
  { key: 'DELIVERED', label: 'Delivered / Picked Up', desc: 'Enjoy your fresh treats!' },
];

const getStageIndex = (status?: string): number => {
  if (!status) return 0;
  const s = status.toUpperCase();
  if (['DELIVERED', 'PICKED UP'].includes(s)) return 4;
  if (['OUT FOR DELIVERY', 'OUT_FOR_DELIVERY', 'READY FOR PICKUP'].includes(s)) return 3;
  if (['READY'].includes(s)) return 2;
  if (['PREPARING'].includes(s)) return 1;
  return 0; // CONFIRMED or PENDING
};

export const MyOrders: React.FC = () => {
  const { orders, products } = useBakeryDatabase();
  const { profile, user, setIsAuthModalOpen } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialSearchPhone = searchParams.get('phone') || profile?.phone || '';
  const initialSearchOrder = searchParams.get('order') || '';

  const [searchPhone, setSearchPhone] = useState(initialSearchPhone);
  const [searchOrderNum, setSearchOrderNum] = useState(initialSearchOrder);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);

  // Filter orders matching current phone or user
  const matchingOrders = useMemo(() => {
    const p = searchPhone.trim().replace(/\D/g, '');
    const o = searchOrderNum.trim().toLowerCase();

    return orders.filter(ord => {
      const matchPhone = p ? ord.phone?.includes(p) : false;
      const matchOrder = o ? ord.orderNumber?.toLowerCase().includes(o) || ord.id?.toLowerCase().includes(o) : false;

      if (p && o) return matchPhone && matchOrder;
      if (p) return matchPhone;
      if (o) return matchOrder;

      // Default: match logged in user phone if any
      if (profile?.phone) {
        return ord.phone?.includes(profile.phone.replace(/\D/g, ''));
      }
      return false;
    }).sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime());
  }, [orders, searchPhone, searchOrderNum, profile]);

  // Set default selected order on load
  useEffect(() => {
    if (matchingOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(matchingOrders[0]);
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
    const msg = `Hello M.G. Iyengar Bakery, I need help with my Order #${order.orderNumber || order.id?.slice(0, 8)} (${order.customerName}).`;
    return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[92px] lg:pt-[96px] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C1A17]/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#C9A227]/15 text-[#2A0E0A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Customer Order Hub</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#2A0E0A]">
              My Orders & Live Tracking
            </h1>
            <p className="text-sm text-[#2C1A17]/60 mt-1">
              Track live baking status, view receipts, and re-order your favorite bakery items.
            </p>
          </div>

          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 bg-white border border-[#2C1A17]/15 hover:border-[#C9A227] text-[#2A0E0A] text-xs font-bold rounded-full shadow-sm cursor-pointer transition-all"
            >
              <span>Sign In for Auto-Saved Orders</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
            </button>
          )}
        </div>

        {/* ── Order Lookup Bar ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#2C1A17]/10 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60">
            Find Your Orders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
              <input
                type="tel"
                placeholder="Search by Mobile Number"
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
              <input
                type="text"
                placeholder="Or Search by Order Number (#MG-...)"
                value={searchOrderNum}
                onChange={e => setSearchOrderNum(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            <button
              onClick={() => {
                if (profile?.phone) setSearchPhone(profile.phone);
              }}
              className="bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3 px-6 rounded-2xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Orders</span>
            </button>
          </div>
        </div>

        {/* ── Main Content Grid ───────────────────────────────────────────────── */}
        {matchingOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2C1A17]/10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto text-[#2C1A17]/40">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-playfair text-xl font-bold text-[#2A0E0A]">
              {searchPhone || searchOrderNum ? 'No Orders Found' : 'Enter Your Phone Number to View Orders'}
            </h3>
            <p className="text-xs text-[#2C1A17]/60 max-w-sm mx-auto">
              {searchPhone || searchOrderNum
                ? 'We could not find any orders matching those details. Please verify your phone or order number.'
                : 'Enter the mobile number used when placing your bakery order to track live progress and download invoices.'}
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A0E0A] text-[#C9A227] text-xs font-bold rounded-full cursor-pointer hover:bg-[#401C16] transition-all"
            >
              <span>Explore Bakery Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Orders List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60 px-1">
                Found {matchingOrders.length} Order{matchingOrders.length !== 1 ? 's' : ''}
              </h2>

              <div className="space-y-3">
                {matchingOrders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  const stageIdx = getStageIndex(order.orderStatus);

                  return (
                    <motion.div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#C9A227] shadow-md ring-2 ring-[#C9A227]/20'
                          : 'bg-white/80 border-[#2C1A17]/10 hover:border-[#2C1A17]/25'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2A0E0A]">
                              #{order.orderNumber || order.id?.slice(0, 8)}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              order.orderType === 'pickup' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {order.orderType || 'Delivery'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#2C1A17]/50 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.createdDate
                              ? new Date(order.createdDate).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })
                              : 'Recent'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-[#2A0E0A]">
                            ₹{order.amount?.toLocaleString('en-IN')}
                          </p>
                          <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                            stageIdx === 4
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.orderStatus || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Mini item list preview */}
                      <div className="mt-3 pt-3 border-t border-[#2C1A17]/8 flex items-center justify-between text-xs text-[#2C1A17]/70">
                        <span className="truncate max-w-[200px] text-[11px]">
                          {order.items?.map(i => `${i.quantity}x ${i.productName || i.name}`).join(', ') || 'Bakery items'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Order Details & Live Stepper (7 cols) */}
            {selectedOrder && (
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#2C1A17]/10 space-y-6">

                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C1A17]/10 pb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                        Active Live Tracking
                      </span>
                      <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#2A0E0A]">
                        Order #{selectedOrder.orderNumber || selectedOrder.id?.slice(0, 8)}
                      </h2>
                      <p className="text-xs text-[#2C1A17]/55 mt-0.5">
                        Recipient: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowInvoiceModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#2C1A17]/15 rounded-xl text-xs font-bold text-[#2A0E0A] cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Bill / Receipt</span>
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

                  {/* Live Progress Stepper */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60">
                      Live Order Status
                    </h3>

                    <div className="relative pl-8 space-y-6 before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-[2px] before:bg-[#2C1A17]/15">
                      {ORDER_STAGES.map((stg, idx) => {
                        const currentStageIdx = getStageIndex(selectedOrder.orderStatus);
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stg.key} className="relative flex items-start gap-3.5">
                            {/* Dot / Icon */}
                            <div
                              className={`absolute -left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-[#C9A227] text-[#2A0E0A] ring-4 ring-[#C9A227]/20 shadow-sm'
                                  : 'bg-[#FAF7F2] border-2 border-[#2C1A17]/20 text-transparent'
                              }`}
                            >
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div className="pl-1">
                              <p className={`text-xs font-bold ${isCurrent ? 'text-[#2A0E0A] text-sm' : isDone ? 'text-[#2A0E0A]' : 'text-[#2C1A17]/40'}`}>
                                {stg.label}
                                {isCurrent && (
                                  <span className="ml-2 text-[9px] font-black uppercase tracking-wider bg-[#C9A227] text-[#2A0E0A] px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-[#2C1A17]/50 mt-0.5">
                                {stg.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="space-y-3 pt-2 border-t border-[#2C1A17]/10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60">
                      Items in this Order
                    </h3>

                    <div className="space-y-2.5">
                      {selectedOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-2xl border border-[#2C1A17]/8 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName || item.name}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            )}
                            <div>
                              <p className="font-bold text-[#2A0E0A]">
                                {item.productName || item.name}
                              </p>
                              <p className="text-[10px] text-[#2C1A17]/50">
                                Size: {item.selectedWeight} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <span className="font-black text-[#2A0E0A]">
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
                      <span>{selectedOrder.orderType === 'pickup' ? 'Pickup Location' : 'Delivery Address'}</span>
                    </div>
                    <p className="text-xs text-[#2C1A17]/70 pl-6 leading-relaxed">
                      {selectedOrder.orderType === 'pickup'
                        ? 'M.G. Iyengar Bakery & Chats, Main Road, Mohanur, Namakkal - 637015'
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
                <p className="text-[10px] text-[#2C1A17]/60">Mohanur, Namakkal • Phone: +91 {WHATSAPP_PHONE_NUMBER}</p>
                <p className="text-xs font-bold text-[#C9A227] mt-1">
                  Tax Invoice / Digital Receipt
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
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdDate).toLocaleDateString('en-IN')}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod || 'Online'} ({selectedOrder.paymentStatus})</p>
                  <p><strong>Type:</strong> {selectedOrder.orderType?.toUpperCase()}</p>
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
                  <span>Total Amount Paid:</span>
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
