import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  X,
  Phone,
  Mail,
  ShoppingBag,
  IndianRupee,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useBakeryDatabase, UnifiedCustomer, UnifiedOrder, isMockCustomer } from '../../context/DatabaseContext';

interface CustomerDetailModalProps {
  customer: UnifiedCustomer;
  orders: UnifiedOrder[];
  onClose: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, orders, onClose }) => {
  const custPhoneClean = (customer.phone || '').replace(/\D/g, '');
  const customerOrders = orders.filter(o =>
    (o.userId && o.userId === customer.userId) ||
    (custPhoneClean && o.phone && o.phone.replace(/\D/g, '') === custPhoneClean)
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 mb-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2A0E0A] to-[#401C16] p-6 rounded-t-2xl text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A227] flex items-center justify-center text-[#2A0E0A] font-bold text-2xl">
              {(customer.name || 'C')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-xl">{customer.name || 'Unknown Customer'}</h2>
              <p className="text-white/80 text-sm">{customer.phone}</p>
              {customer.email && <p className="text-white/60 text-xs">{customer.email}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{customer.totalOrders}</p>
              <p className="text-xs text-white/70">Total Orders</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">₹{customer.totalSpent.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/70">Total Spent</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">₹{Math.round(customer.avgOrderValue).toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/70">Average Order</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Customer Info */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#2C1A17]/6">
            <div>
              <p className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider mb-1">Registration Date</p>
              <p className="text-xs font-semibold text-[#2A0E0A]">{formatDate(customer.registeredAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider mb-1">First Order</p>
              <p className="text-xs font-semibold text-[#2A0E0A]">{customer.firstOrderAt ? formatDate(customer.firstOrderAt) : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider mb-1">Last Order</p>
              <p className="text-xs font-semibold text-[#2A0E0A]">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : '—'}</p>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-sm font-bold text-[#2A0E0A] mb-3">Order History ({customerOrders.length})</h3>
            {customerOrders.length === 0 ? (
              <div className="bg-[#FAF7F2] rounded-xl p-6 text-center">
                <ShoppingBag className="w-8 h-8 text-[#2C1A17]/20 mx-auto mb-2" />
                <p className="text-xs text-[#2C1A17]/50">No previous orders recorded for this customer yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {customerOrders.map(order => (
                  <div key={order.id} className="bg-[#FAF7F2] rounded-xl p-3.5 border border-[#2C1A17]/6">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2A0E0A]">#{order.orderNumber || order.id?.slice(0, 8)}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          order.orderType === 'pickup' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.orderType === 'pickup' ? 'Pickup' : 'Home Delivery'}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-[#2A0E0A]">₹{order.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-[#2C1A17]/60">
                      {order.orderedProduct || (order.items?.map(i => `${i.quantity}x ${i.productName || i.name}`).join(', ')) || 'Bakery Items'}
                    </p>
                    <p className="text-[10px] text-[#2C1A17]/40 mt-1">
                      {order.createdDate} • {order.orderType === 'pickup' ? 'Shop Pickup' : (order.deliveryAddress || 'Mohanur')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Customers: React.FC = () => {
  const { customers, orders, fetchCustomers, fetchOrdersFromSupabase } = useBakeryDatabase();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UnifiedCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchCustomers(), fetchOrdersFromSupabase()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const validCustomers = customers.filter(c => !isMockCustomer(c));

  const filtered = validCustomers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  // Stats
  const totalCustomers = validCustomers.length;
  const thisMonth = validCustomers.filter(c => {
    if (!c.registeredAt) return false;
    const d = new Date(c.registeredAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const returning = validCustomers.filter(c => c.totalOrders > 1).length;
  const topSpender = validCustomers[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#FAF6F0]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2A0E0A]">
            Customer Management
          </h1>
          <p className="text-sm text-[#2C1A17]/50 mt-0.5">
            {totalCustomers} registered customers
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#2A0E0A] text-[#C9A227] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#401C16] transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'New This Month', value: thisMonth, icon: Calendar, color: 'bg-green-50 text-green-700' },
          { label: 'Returning (2+ Orders)', value: returning, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
          { label: 'Top Spender', value: topSpender ? `₹${topSpender.totalSpent.toLocaleString('en-IN')}` : '—', icon: Award, color: 'bg-amber-50 text-amber-700' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="bg-white rounded-2xl p-4 border border-[#2C1A17]/8 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#2A0E0A]">{stat.value}</p>
            <p className="text-xs text-[#2C1A17]/50 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            <X className="w-4 h-4 text-[#2C1A17]/40" />
          </button>
        )}
      </div>

      {/* Customer Table / List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#C9A227] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#2C1A17]/8 p-12 text-center">
          <Users className="w-12 h-12 text-[#2C1A17]/20 mx-auto mb-3" />
          <p className="font-semibold text-[#2A0E0A]">{search ? 'No customers match your search' : 'No customers yet'}</p>
          <p className="text-sm text-[#2C1A17]/50 mt-1">
            {search ? 'Try a different search term' : 'Customers will appear here once they register and place orders'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#2C1A17]/8 shadow-sm overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#FAF7F2] border-b border-[#2C1A17]/8 text-[11px] font-bold text-[#2C1A17]/50 uppercase tracking-wider">
            <span>Customer</span>
            <span>Contact</span>
            <span>Orders</span>
            <span>Total Spent</span>
            <span>Last Order</span>
            <span></span>
          </div>

          <div className="divide-y divide-[#2C1A17]/6">
            {filtered.map((customer, idx) => (
              <motion.div
                key={customer.userId || customer.phone || `cust-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedCustomer(customer)}
                className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-[#FAF7F2] transition-all cursor-pointer items-center"
              >
                {/* Name + Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/40 flex items-center justify-center font-bold text-[#2A0E0A] shrink-0">
                    {(customer.name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2A0E0A] text-sm">{customer.name || '—'}</p>
                    <p className="text-[11px] text-[#2C1A17]/40">Since {customer.registeredAt ? new Date(customer.registeredAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#2C1A17]/30" />
                    <span className="text-sm text-[#2C1A17]">{customer.phone || '—'}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#2C1A17]/30" />
                      <span className="text-xs text-[#2C1A17]/60 truncate max-w-[140px]">{customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Orders */}
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#2C1A17]/30 hidden md:block" />
                  <span className="font-semibold text-[#2A0E0A]">{customer.totalOrders}</span>
                </div>

                {/* Total Spent */}
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-green-600 hidden md:block" />
                  <span className="font-bold text-green-700">₹{customer.totalSpent.toLocaleString('en-IN')}</span>
                </div>

                {/* Last Order */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#2C1A17]/30 hidden md:block" />
                  <span className="text-xs text-[#2C1A17]/60">
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                      : '—'}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-[#2C1A17]/30 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            orders={orders}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
