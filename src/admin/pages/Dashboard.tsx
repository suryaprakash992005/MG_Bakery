import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, TrendingUp, CheckCircle2,
  Truck, Users, DollarSign, AlertCircle, RefreshCw, BarChart3,
  LayoutDashboard
} from 'lucide-react';
import { useBakeryDatabase } from '../../context/DatabaseContext';

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'gold' | 'green' | 'blue' | 'red' | 'brown';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorMap = {
    gold:  { bg: 'bg-amber-50',  border: 'border-amber-200', icon: 'text-amber-600',  text: 'text-amber-800'  },
    green: { bg: 'bg-green-50',  border: 'border-green-200', icon: 'text-green-600',  text: 'text-green-800'  },
    blue:  { bg: 'bg-blue-50',   border: 'border-blue-200',  icon: 'text-blue-600',   text: 'text-blue-800'   },
    red:   { bg: 'bg-red-50',    border: 'border-red-200',   icon: 'text-red-500',    text: 'text-red-800'    },
    brown: { bg: 'bg-[#FAF6F0]', border: 'border-[#C9A227]/20', icon: 'text-[#C9A227]', text: 'text-[#2A0E0A]' },
  };
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${c.bg} border ${c.border} rounded-2xl p-5 space-y-3`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#2C1A17]/60 uppercase tracking-widest">{title}</p>
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-black ${c.text} font-playfair`}>{value}</p>
        {subtitle && <p className="text-[11px] text-[#2C1A17]/50 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

// ─── Order Status Badge ────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    'CONFIRMED':         'bg-blue-100 text-blue-700',
    'Confirmed':         'bg-blue-100 text-blue-700',
    'PREPARING':         'bg-amber-100 text-amber-700',
    'Preparing':         'bg-amber-100 text-amber-700',
    'READY':             'bg-green-100 text-green-700',
    'Ready':             'bg-green-100 text-green-700',
    'OUT FOR DELIVERY':  'bg-purple-100 text-purple-700',
    'DELIVERED':         'bg-green-200 text-green-800',
    'Delivered':         'bg-green-200 text-green-800',
    'PICKED UP':         'bg-green-200 text-green-800',
    'CANCELLED':         'bg-red-100 text-red-600',
    'Cancelled':         'bg-red-100 text-red-600',
    'PENDING PAYMENT':   'bg-gray-100 text-gray-600',
    'Pending':           'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const { orders } = useBakeryDatabase();

  const today = new Date().toISOString().split('T')[0];

  const todayOrders = useMemo(() =>
    orders.filter(o => o.createdDate?.startsWith(today)), [orders, today]);

  const todaySales = useMemo(() =>
    todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0), [todayOrders]);

  const pendingCount = useMemo(() =>
    orders.filter(o => ['CONFIRMED', 'Confirmed', 'PENDING PAYMENT', 'Pending'].includes(o.orderStatus || '')).length,
    [orders]);

  const preparingCount = useMemo(() =>
    orders.filter(o => ['PREPARING', 'Preparing'].includes(o.orderStatus || '')).length, [orders]);

  const readyCount = useMemo(() =>
    orders.filter(o => ['READY', 'Ready', 'READY FOR PICKUP'].includes(o.orderStatus || '')).length, [orders]);

  const deliveredCount = useMemo(() =>
    orders.filter(o => ['DELIVERED', 'Delivered', 'PICKED UP'].includes(o.orderStatus || '')).length, [orders]);

  const totalRevenue = useMemo(() =>
    orders
      .filter(o => ['DELIVERED', 'Delivered', 'PICKED UP'].includes(o.orderStatus || ''))
      .reduce((sum, o) => sum + (o.amount || 0), 0), [orders]);

  const uniqueCustomers = useMemo(() =>
    new Set(orders.map(o => o.phone)).size, [orders]);

  // Recent 10 orders
  const recentOrders = useMemo(() =>
    [...orders]
      .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
      .slice(0, 10), [orders]);

  // Status pipeline counts
  const pipeline = [
    { label: 'Pending', count: pendingCount, icon: AlertCircle, color: 'blue' as const },
    { label: 'Preparing', count: preparingCount, icon: RefreshCw, color: 'gold' as const },
    { label: 'Ready', count: readyCount, icon: CheckCircle2, color: 'green' as const },
    { label: 'Delivered', count: deliveredCount, icon: Truck, color: 'brown' as const },
  ];

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-[#C9A227]" />
            <h1 className="font-playfair text-2xl font-bold text-[#2A0E0A]">Dashboard</h1>
          </div>
          <p className="text-sm text-[#2C1A17]/50">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C9A227]">
          <BarChart3 className="w-4 h-4" />
          <span>Live Dashboard</span>
        </div>
      </div>

      {/* Today's Stats */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/50">Today's Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Orders" value={todayOrders.length} subtitle="New orders today" icon={ShoppingBag} color="brown" />
          <StatCard title="Today's Revenue" value={`₹${todaySales.toLocaleString('en-IN')}`} subtitle="Collected today" icon={DollarSign} color="gold" />
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} subtitle="All time (delivered)" icon={TrendingUp} color="green" />
          <StatCard title="Customers" value={uniqueCustomers} subtitle="Unique phone numbers" icon={Users} color="blue" />
        </div>
      </section>

      {/* Order Pipeline */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/50">Order Pipeline</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pipeline.map(({ label, count, icon, color }) => (
            <StatCard key={label} title={label} value={count} subtitle={`${label} orders`} icon={icon} color={color} />
          ))}
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/50">Recent Orders</h2>
        <div className="bg-white rounded-2xl border border-[#2C1A17]/8 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF6F0] border-b border-[#2C1A17]/8">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#2C1A17]/50">Order #</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#2C1A17]/50">Customer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#2C1A17]/50">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#2C1A17]/50">Type</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#2C1A17]/50">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#2C1A17]/50">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm text-[#2C1A17]/50">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-[#2C1A17]/5 hover:bg-[#FAF6F0] transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-bold text-[#2A0E0A]">
                        #{order.orderNumber || order.id?.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-[#2A0E0A]">{order.customerName}</p>
                        <p className="text-[10px] text-[#2C1A17]/50">{order.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-[#2A0E0A]">
                        ₹{order.amount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${
                          order.orderType === 'pickup'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.orderType || 'delivery'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.orderStatus || 'Pending'} />
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[#2C1A17]/50">
                        {order.createdDate
                          ? new Date(order.createdDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : '–'}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
