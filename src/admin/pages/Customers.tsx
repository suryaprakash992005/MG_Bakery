import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Mail, Phone, Calendar, ShoppingBag, X, ChevronRight, ShoppingCart 
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useBakeryDatabase } from '../../context/DatabaseContext';

interface CustomerStats {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  totalOrders: number;
  totalSpent: number;
}

export const Customers: React.FC = () => {
  const { orders } = useBakeryDatabase();
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 1. Fetch all customer profiles from Supabase profiles table
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (customersError) throw customersError;

      if (customersData) {
        const aggregated: CustomerStats[] = customersData.map((cust: any) => ({
          id: cust.id,
          name: cust.full_name,
          email: cust.email,
          phone: cust.phone || 'N/A',
          created_at: cust.created_at,
          totalOrders: cust.total_orders,
          totalSpent: Number(cust.total_spent)
        }));
        setCustomers(aggregated);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [orders]);

  // Find selected customer object and their specific orders
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedCustomerOrders = selectedCustomer 
    ? orders.filter(o => o.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-8 font-poppins select-none relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-[#2C1A17] tracking-wide">
            Registered Customers
          </h1>
          <p className="text-xs text-[#2C1A17]/60 mt-1 font-medium">
            Manage bakery customer accounts, check order counts, and inspect spending histories
          </p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="text-xs font-semibold text-brand-gold-700 bg-brand-gold-50 px-3 py-1.5 rounded-full border border-brand-gold-100 cursor-pointer"
        >
          Refresh Profiles
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#2C1A17]/50 mt-3 font-medium">Loading customer metrics...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl py-16 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-brand-cream-50 rounded-full flex items-center justify-center text-brand-gold-800/40 mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-playfair text-base font-bold text-[#2C1A17]">No Registered Customers</h3>
            <p className="text-xs text-[#2C1A17]/50 max-w-xs mx-auto mt-1 font-light">
              Customer accounts will appear here automatically when they sign up on the storefront.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#2C1A17]/50 border-b border-[#2C1A17]/5 bg-[#FAF6F0]/20 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4 pl-6">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4 text-center">Total Orders</th>
                  <th className="p-4 text-right pr-6">Money Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C1A17]/5">
                {customers.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCustomerId(c.id)}
                    className="hover:bg-[#FAF6F0]/40 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6 font-bold text-[#2C1A17] flex items-center gap-2">
                      {c.name}
                      <ChevronRight className="w-3.5 h-3.5 text-[#2C1A17]/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </td>
                    <td className="p-4 text-[#2C1A17]/70 font-light">{c.email}</td>
                    <td className="p-4 text-[#2C1A17]/70 font-semibold">{c.phone}</td>
                    <td className="p-4 text-center font-bold text-[#2C1A17]">{c.totalOrders}</td>
                    <td className="p-4 text-right font-bold text-[#2C1A17] pr-6">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sliding Customer Details Side Panel Overlay */}
      <AnimatePresence>
        {selectedCustomerId && selectedCustomer && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomerId(null)}
              className="fixed inset-0 bg-brand-brown-950/45 backdrop-blur-sm z-[100] cursor-pointer"
            />
            
            {/* Sidebar Details Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 left-auto h-full w-[90vw] max-w-lg bg-[#FAF6F0] shadow-2xl border-l border-[#2C1A17]/10 z-[101] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#2C1A17]/10 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-cream-50 border border-brand-cream-100 rounded-xl flex items-center justify-center text-brand-gold-800 shrink-0">
                    <Users className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-sm font-bold text-[#2C1A17]">Customer Account Details</h3>
                    <p className="text-[10px] text-[#2C1A17]/40 font-medium">UUID: {selectedCustomer.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 rounded-full hover:bg-brand-cream-100 text-brand-brown-850 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Profile Details Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Profile fields summary */}
                <div className="bg-white border border-[#2C1A17]/5 rounded-2xl p-5 space-y-3.5 shadow-sm">
                  <h4 className="font-playfair text-xs font-bold text-[#2C1A17] border-b border-[#2C1A17]/5 pb-2 uppercase tracking-wide">
                    Profile Info
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#2C1A17]/40 uppercase text-[9px] font-bold block">Full Name</span>
                      <p className="text-[#2C1A17] font-semibold mt-0.5">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <span className="text-[#2C1A17]/40 uppercase text-[9px] font-bold block">Joined Date</span>
                      <p className="text-[#2C1A17] font-semibold mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold-700" />
                        {new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#2C1A17]/40 uppercase text-[9px] font-bold block">Email Address</span>
                      <p className="text-[#2C1A17] font-semibold mt-0.5 flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#2C1A17]/40" />
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#2C1A17]/40 uppercase text-[9px] font-bold block">Phone Contact</span>
                      <p className="text-[#2C1A17] font-semibold mt-0.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#2C1A17]/40" />
                        {selectedCustomer.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-[#2C1A17]/5 rounded-2xl p-4 shadow-sm text-center">
                    <span className="text-[#2C1A17]/40 uppercase text-[9px] font-bold block">Total Orders Count</span>
                    <p className="text-xl font-bold text-[#2C1A17] mt-1 flex items-center justify-center gap-1.5 text-brand-gold-800">
                      <ShoppingBag className="w-5 h-5 text-brand-gold-700" />
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>
                  <div className="bg-white border border-[#2C1A17]/5 rounded-2xl p-4 shadow-sm text-center">
                    <span className="text-[#2C1A17]/40 uppercase text-[9px] font-bold block">Total Revenue Generated</span>
                    <p className="text-xl font-bold text-emerald-700 mt-1">
                      ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Cronological past orders timeline */}
                <div className="bg-white border border-[#2C1A17]/5 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-playfair text-xs font-bold text-[#2C1A17] border-b border-[#2C1A17]/5 pb-2 uppercase tracking-wide">
                    Previous Order Timeline
                  </h4>

                  {selectedCustomerOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#2C1A17]/40 font-light flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="w-6 h-6 text-brand-cream-200" />
                      No order record found for this profile.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedCustomerOrders.map((order) => {
                        const dateStr = new Date(order.createdDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <div 
                            key={order.id}
                            className="p-3 border border-[#2C1A17]/5 bg-[#FAF6F0]/20 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#2C1A17]">
                              <span className="font-bold">{order.id}</span>
                              <span className="text-[10px] text-[#2C1A17]/40">{dateStr}</span>
                            </div>
                            
                            <p className="text-[11px] text-[#2C1A17]/70 font-light leading-snug">
                              {order.orderedProduct}
                            </p>

                            <div className="flex items-center justify-between border-t border-[#2C1A17]/5 pt-2 mt-1">
                              <span className="font-bold text-[#2C1A17]">₹{order.amount}</span>
                              
                              <div className="flex items-center gap-2">
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                  order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-brand-gold-800'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                  order.orderStatus === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : order.orderStatus === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-brand-cream-100 text-brand-gold-850'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
