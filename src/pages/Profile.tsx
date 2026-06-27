import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, ShoppingBag, LogOut, ChevronDown, ChevronUp, Clock, 
  MapPin, ShieldCheck, CheckCircle2, AlertCircle, ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

interface OrderItem {
  id: string;
  name: string;
  selected_weight: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  created_at: string;
  ordered_product: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_address?: string;
  items?: OrderItem[];
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchUserOrders = async () => {
    if (!user) return;
    setFetchingOrders(true);
    try {
      // 1. Fetch orders for this authenticated customer
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        // 2. Fetch order items for these orders
        const orderIds = ordersData.map(o => o.id);
        
        if (orderIds.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (itemsError) throw itemsError;

          // Merge items into their parent orders
          const merged: Order[] = ordersData.map(order => ({
            ...order,
            items: (itemsData || []).filter(item => item.order_id === order.id)
          }));
          setOrders(merged);
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setFetchingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.amount), 0);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-[#FAF7F2]/40 min-h-screen font-poppins px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Profile Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#2A0E0A]/10 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-cream-50 border border-brand-cream-100 flex items-center justify-center text-brand-gold-800">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-playfair text-xl sm:text-2xl font-bold text-[#2A0E0A]">
                  {profile?.name || 'Customer Profile'}
                </h1>
                {isAdmin && (
                  <span className="text-[9px] font-bold tracking-widest bg-brand-brown-950 text-brand-gold-850 px-2 py-0.5 rounded-full uppercase border border-brand-gold-850/30 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-brand-gold-850" />
                    Admin Account
                  </span>
                )}
              </div>
              <p className="text-xs text-[#2A0E0A]/50 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email}
              </p>
              {profile?.phone && (
                <p className="text-xs text-[#2A0E0A]/50 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/products')}
                className="flex-grow md:flex-grow-0 px-5 py-2.5 bg-brand-brown-950 text-brand-gold-850 font-semibold text-xs rounded-xl hover:bg-brand-brown-900 border border-brand-brown-900 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                Go to Admin Portal
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex-grow md:flex-grow-0 px-5 py-2.5 bg-[#FAF7F2] text-[#2A0E0A]/80 font-semibold text-xs rounded-xl hover:bg-brand-cream-50 border border-brand-cream-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout Session
            </button>
          </div>
        </motion.div>

        {/* Profile Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-[#2A0E0A]/10 rounded-2.5xl p-6 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-cream-50 flex items-center justify-center text-brand-gold-800 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#2A0E0A]/40 font-bold">Total Orders</span>
              <p className="text-xl font-bold text-[#2A0E0A] mt-0.5">{orders.length}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-[#2A0E0A]/10 rounded-2.5xl p-6 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <span className="text-lg font-bold">₹</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#2A0E0A]/40 font-bold">Total Spent</span>
              <p className="text-xl font-bold text-[#2A0E0A] mt-0.5">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#2A0E0A]/10 rounded-2.5xl p-6 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-cream-100/50 flex items-center justify-center text-brand-gold-800 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#2A0E0A]/40 font-bold">Member Since</span>
              <p className="text-sm font-bold text-[#2A0E0A] mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'June 2026'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Order History Listing Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-[#2A0E0A]/10 rounded-3xl p-6 sm:p-8 shadow-sm"
        >
          <div className="border-b border-[#2A0E0A]/5 pb-5 mb-6 flex items-center justify-between">
            <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#2A0E0A]">
              My Order History
            </h2>
            <button 
              onClick={fetchUserOrders}
              className="text-xs font-semibold text-brand-gold-700 hover:text-brand-gold-800 transition-colors"
            >
              Refresh Logs
            </button>
          </div>

          {fetchingOrders ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#2A0E0A]/50 mt-3 font-medium">Fetching orders from Supabase...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 bg-brand-cream-50 rounded-full flex items-center justify-center text-brand-gold-800/40 mx-auto">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-playfair text-base font-bold text-[#2A0E0A]">No Orders Placed Yet</h3>
                <p className="text-xs text-[#2A0E0A]/50 max-w-xs mx-auto mt-1 font-light">
                  Browse our catalog and order celebration cakes or bakery products to see your logs.
                </p>
                <Link to="/menu" className="btn-primary inline-flex text-xs px-5 py-2.5 mt-5">
                  Explore Menu
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={order.id}
                    className="border border-[#2A0E0A]/5 bg-[#FAF7F2]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#C9A227]/30"
                  >
                    {/* Header Summary Row */}
                    <div 
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-cream-50 border border-brand-cream-100 rounded-xl flex items-center justify-center text-brand-gold-850 shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2A0E0A]">{order.id}</p>
                          <p className="text-[10px] text-[#2A0E0A]/40 mt-0.5">{dateStr}</p>
                        </div>
                      </div>

                      {/* Product Summary Preview */}
                      <div className="flex-grow max-w-md hidden md:block">
                        <p className="text-xs text-[#2A0E0A]/70 truncate font-light">
                          {order.ordered_product}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#2A0E0A]">₹{Number(order.amount).toLocaleString('en-IN')}</p>
                          <span className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                            order.order_status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.order_status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-brand-cream-100 text-brand-gold-800'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>

                        <div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#2A0E0A]/40" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#2A0E0A]/40" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Order Items Section */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-[#2A0E0A]/5 bg-white"
                        >
                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 border-b border-[#2A0E0A]/5">
                              {order.delivery_address && (
                                <div className="space-y-1">
                                  <span className="font-bold text-[#2A0E0A]/50 uppercase tracking-wider text-[9px] block">
                                    Delivery Address
                                  </span>
                                  <p className="text-[#2A0E0A] flex items-start gap-1">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-gold-700" />
                                    {order.delivery_address}
                                  </p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <span className="font-bold text-[#2A0E0A]/50 uppercase tracking-wider text-[9px] block">
                                  Payment Info
                                </span>
                                <div className="flex items-center gap-2 text-[#2A0E0A] flex-wrap">
                                  <span className="bg-brand-cream-50 text-brand-brown-850 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                    {order.payment_method}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 font-semibold text-[10px] ${
                                    order.payment_status === 'Paid' ? 'text-emerald-700' : 'text-brand-gold-800'
                                  }`}>
                                    {order.payment_status === 'Paid' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <AlertCircle className="w-3.5 h-3.5" />
                                    )}
                                    {order.payment_status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Item Rows */}
                            <div className="space-y-3">
                              <span className="font-bold text-[#2A0E0A]/50 uppercase tracking-wider text-[9px] block mb-1">
                                Ordered Products
                              </span>
                              {order.items?.map((item) => (
                                <div 
                                  key={item.id}
                                  className="flex items-center justify-between gap-4 py-2 border-b border-dashed border-[#2A0E0A]/5 last:border-b-0 last:pb-0"
                                >
                                  <div className="flex items-center gap-3">
                                    {item.image_url && (
                                      <img 
                                        src={item.image_url} 
                                        alt={item.name}
                                        className="w-10 h-10 object-cover rounded-lg bg-brand-cream-50"
                                      />
                                    )}
                                    <div>
                                      <p className="text-xs font-bold text-[#2A0E0A]">{item.name}</p>
                                      <span className="inline-block text-[9px] font-semibold text-brand-brown-850/60 mt-0.5">
                                        Weight/Size: {item.selected_weight}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right text-xs">
                                    <p className="font-semibold text-[#2A0E0A]">₹{item.price} × {item.quantity}</p>
                                    <p className="font-bold text-[#2A0E0A] mt-0.5">₹{item.price * item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};
