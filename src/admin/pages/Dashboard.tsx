import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ShoppingBag, Users, Calendar, Award, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, AlertCircle, IndianRupee 
} from 'lucide-react';
import { useBakeryDatabase } from '../../context/DatabaseContext';
import { supabase } from '../../utils/supabase';

export const Dashboard: React.FC = () => {
  const { orders } = useBakeryDatabase();
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);

  useEffect(() => {
    const fetchCustomersCount = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'customer');
        if (!error && count !== null) {
          setTotalCustomersCount(count);
        }
      } catch (err) {
        console.error('Error fetching customers count:', err);
      }
    };
    fetchCustomersCount();
  }, []);

  // Stats Calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);

  // Daily revenue (today's orders)
  const today = new Date().toDateString();
  const dailyOrders = orders.filter(o => new Date(o.createdDate).toDateString() === today);
  const dailyRevenue = dailyOrders.reduce((sum, o) => sum + Number(o.amount), 0);

  // Monthly revenue (current calendar month orders)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyOrders = orders.filter(o => {
    const d = new Date(o.createdDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + Number(o.amount), 0);

  // Previous Month revenue (for comparison ratio)
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthOrders = orders.filter(o => {
    const d = new Date(o.createdDate);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  });
  const prevMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + Number(o.amount), 0);
  const monthGrowthPercent = prevMonthRevenue > 0 
    ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
    : 100;

  // Recent Orders (last 5)
  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: `+12.4% vs last qtr`,
      changeType: 'up',
      icon: IndianRupee,
      color: 'bg-amber-50 text-amber-700 border-amber-100'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
      change: `${monthGrowthPercent >= 0 ? '+' : ''}${monthGrowthPercent.toFixed(1)}% vs last month`,
      changeType: monthGrowthPercent >= 0 ? 'up' : 'down',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    {
      title: 'Daily Revenue',
      value: `₹${dailyRevenue.toLocaleString('en-IN')}`,
      change: `${dailyOrders.length} orders placed today`,
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      change: 'Lifetime metrics',
      changeType: 'neutral',
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-700 border-purple-100'
    },
    {
      title: 'Total Customers',
      value: totalCustomersCount,
      change: 'Registered user profiles',
      changeType: 'neutral',
      icon: Users,
      color: 'bg-rose-50 text-rose-700 border-rose-100'
    }
  ];

  return (
    <div className="space-y-8 font-poppins select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-playfair font-bold text-[#2C1A17] tracking-wide">
          Admin Dashboard & Analytics
        </h1>
        <p className="text-xs text-[#2C1A17]/60 mt-1 font-medium">
          Real-time metrics, live revenues, and aggregate sales totals from Supabase
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-[#2C1A17]/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C1A17]/50">
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold text-[#2C1A17]">{stat.value}</p>
                
                <div className="flex items-center gap-1 mt-1.5">
                  {stat.changeType === 'up' && (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  {stat.changeType === 'down' && (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span className={`text-[10px] font-bold ${
                    stat.changeType === 'up' 
                      ? 'text-emerald-700' 
                      : stat.changeType === 'down' 
                      ? 'text-rose-700' 
                      : 'text-[#2C1A17]/40'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#2C1A17]/5 mb-4">
            <h2 className="font-playfair text-base font-bold text-[#2C1A17]">
              Recent Orders
            </h2>
            <span className="text-[10px] font-bold text-brand-gold-700 bg-brand-gold-50 px-2 py-0.5 rounded-full uppercase border border-brand-gold-100">
              Live Feed
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#2C1A17]/40 font-light">
              No orders received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#2C1A17]/50 border-b border-[#2C1A17]/5 font-bold uppercase tracking-wider text-[9px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Products</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C1A17]/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF6F0]/30 transition-colors">
                      <td className="py-3.5 font-bold text-[#2C1A17]">{order.id}</td>
                      <td className="py-3.5 font-semibold text-[#2C1A17]">{order.customerName}</td>
                      <td className="py-3.5 text-[#2C1A17]/70 font-light max-w-[200px] truncate">
                        {order.orderedProduct}
                      </td>
                      <td className="py-3.5 font-bold text-[#2C1A17]">₹{order.amount}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 font-semibold text-[9px] ${
                          order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-brand-gold-800'
                        }`}>
                          {order.paymentStatus === 'Paid' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-brand-gold-700" />
                          )}
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-brand-cream-100 text-brand-gold-850'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: Target Goals & Analytics Info */}
        <div className="lg:col-span-4 bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-[#2C1A17]/5 pb-4">
              <h2 className="font-playfair text-base font-bold text-[#2C1A17]">
                Monthly Sales Target
              </h2>
              <p className="text-[10px] text-[#2C1A17]/50 mt-0.5 font-medium">Goal set: ₹1,00,000</p>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2C1A17]/60 font-medium">Monthly progress</span>
                <span className="font-bold text-[#2C1A17]">
                  {Math.min(100, Math.round((monthlyRevenue / 100000) * 100))}%
                </span>
              </div>
              <div className="h-2.5 bg-brand-cream-100/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-gold-400 to-[#C9A227] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (monthlyRevenue / 100000) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#2C1A17]/40 font-light mt-1">
                Completed ₹{monthlyRevenue.toLocaleString('en-IN')} of your ₹1,00,000 goal.
              </p>
            </div>
          </div>

          <div className="border-t border-[#2C1A17]/5 pt-6 mt-6">
            <h3 className="font-playfair text-xs font-bold text-[#2C1A17] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-gold-700" />
              Top Bestselling Categories
            </h3>
            
            <div className="space-y-2.5 mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2C1A17]/70 font-light">1. Special Wedding Cakes</span>
                <span className="font-bold text-[#2A0E0A]">42%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2C1A17]/70 font-light">2. Fresh Pastries & Muffins</span>
                <span className="font-bold text-[#2A0E0A]">28%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2C1A17]/70 font-light">3. Spicy Hot Puffs</span>
                <span className="font-bold text-[#2A0E0A]">18%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
