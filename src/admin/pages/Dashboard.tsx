import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { useAdminRouter } from '../hooks/useAdminRouter';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Package, 
  Calendar, 
  Users2, 
  ArrowRight,
  ClipboardList,
  ChevronRight,
  X
} from 'lucide-react';
import { OrderStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { orders, products, updateOrderStatus } = useAdminState();
  const { navigate } = useAdminRouter();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Dynamic calculations from live state
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const activeProductsCount = products.filter(p => p.isAvailable).length;
  
  // Static-dynamic blend for premium display
  const ordersToday = 42;
  const revenueToday = orders
    .filter(o => o.orderStatus !== 'Cancelled' && o.createdDate.startsWith('2026-06-23'))
    .reduce((sum, o) => sum + o.amount, 0) + 12450; // blend live + baseline

  const kpis = [
    {
      title: 'Orders Today',
      value: ordersToday,
      change: '+12%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'from-amber-500 to-brand-gold-500',
      textColor: 'text-brand-gold-700'
    },
    {
      title: 'Revenue Today',
      value: `₹${revenueToday.toLocaleString('en-IN')}`,
      change: '+8.4%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Pending Orders',
      value: pendingOrdersCount,
      change: pendingOrdersCount > 5 ? '+15%' : '-8%',
      isPositive: pendingOrdersCount <= 5,
      icon: Clock,
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-700'
    },
    {
      title: 'Active Products',
      value: activeProductsCount,
      change: '+2%',
      isPositive: true,
      icon: Package,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-700'
    },
    {
      title: 'Weekly Revenue',
      value: '₹98,450',
      change: '+14.2%',
      isPositive: true,
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-700'
    },
    {
      title: 'Returning Customers',
      value: '78%',
      change: '+4.5%',
      isPositive: true,
      icon: Users2,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-700'
    }
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'Accepted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Accepted</span>;
      case 'Preparing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Preparing</span>;
      case 'Ready':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Ready</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">Out for Delivery</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-red-700 border border-rose-200">Cancelled</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'Paid') {
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Paid</span>;
    }
    if (status === 'Failed') {
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Failed</span>;
    }
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Unpaid</span>;
  };

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8 select-none">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#2C1717] to-[#120707] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-brand-gold-500/10 to-transparent pointer-events-none" />
        <div className="space-y-1 z-10">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-white tracking-wide">
            Welcome Back, Chef!
          </h2>
          <p className="text-xs md:text-sm text-[#F3EDE2]/60 font-light leading-relaxed">
            Here's what's happening at M.G. Iyengar Bakery today. You have <span className="text-[#D4AF37] font-semibold">{pendingOrdersCount} orders</span> awaiting review.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="bg-brand-gold-850 hover:bg-brand-gold-600 text-[#1A1110] font-semibold text-xs px-5 py-3 rounded-full transition-all duration-300 transform active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 z-10 hover:text-white"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Manage Live Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:border-[#D4AF37]/35"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-brand-gold-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{kpi.title}</span>
                  <span className="text-3xl font-playfair font-bold text-slate-800 block">{kpi.value}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#1A1110] group-hover:text-[#D4AF37] transition-all duration-300 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  kpi.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {kpi.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-playfair text-lg font-bold text-slate-800">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Overview of latest checkouts and walk-in receipts</p>
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-semibold text-[#D4AF37] hover:text-[#B89B1C] transition-colors flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Product Ordered</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {recentOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-slate-50/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="py-4 px-6 font-mono text-slate-800 font-bold">{order.id}</td>
                  <td className="py-4 px-6 text-slate-800 font-semibold">{order.customerName}</td>
                  <td className="py-4 px-6 truncate max-w-[200px]">{order.orderedProduct}</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">₹{order.amount}</td>
                  <td className="py-4 px-6">{getPaymentStatusBadge(order.paymentStatus)}</td>
                  <td className="py-4 px-6 text-center">{getStatusBadge(order.orderStatus)}</td>
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                      title="Quick View Details"
                    >
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal (Dynamic sheet) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 font-mono">{selectedOrder.id}</span>
                <h3 className="font-playfair text-lg font-bold text-slate-800 mt-1">Order Summary</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 py-6 space-y-6">
              
              {/* Status pill & update */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Delivery Status</span>
                <div className="mt-2 flex justify-between items-center">
                  {getStatusBadge(selectedOrder.orderStatus)}
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>

                {/* Accept/Reject buttons if Pending */}
                {selectedOrder.orderStatus === 'Pending' && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'Accepted');
                        setSelectedOrder({ ...selectedOrder, orderStatus: 'Accepted' });
                      }}
                      className="bg-brand-gold-850 hover:bg-brand-gold-600 text-[#1A1110] text-xs font-semibold py-2.5 rounded-lg transition-all"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'Cancelled');
                        setSelectedOrder({ ...selectedOrder, orderStatus: 'Cancelled' });
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2.5 rounded-lg border border-red-100 transition-all"
                    >
                      Reject Order
                    </button>
                  </div>
                )}

                {/* Progress flow controls */}
                {selectedOrder.orderStatus !== 'Pending' && selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Delivered' && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status</label>
                    <div className="flex flex-wrap gap-2">
                      {(['Preparing', 'Ready', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, st);
                            setSelectedOrder({ ...selectedOrder, orderStatus: st });
                          }}
                          className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium border transition-all ${
                            selectedOrder.orderStatus === st
                              ? 'bg-[#1A1110] text-white border-[#1A1110]'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Customer Details</h4>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <p><span className="text-slate-400">Name:</span> {selectedOrder.customerName}</p>
                  <p><span className="text-slate-400">Phone:</span> {selectedOrder.phone}</p>
                  <p className="leading-relaxed"><span className="text-slate-400">Address:</span> {selectedOrder.deliveryAddress}</p>
                </div>
              </div>

              {/* Items details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Items Ordered</h4>
                <div className="flex justify-between items-center bg-[#FAF8F5] border border-slate-100 rounded-xl p-3 text-xs font-medium">
                  <div>
                    <p className="text-slate-800 font-semibold">{selectedOrder.orderedProduct}</p>
                    <p className="text-slate-400 mt-0.5">Qty: {selectedOrder.quantity}</p>
                  </div>
                  <span className="text-slate-800 font-bold text-sm">₹{selectedOrder.amount}</span>
                </div>
              </div>

              {/* Payment methods */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Logistics & Payment</h4>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <p><span className="text-slate-400">Method:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="text-slate-400">Receipt Type:</span> Home Delivery</p>
                  <p><span className="text-slate-400">Created At:</span> {new Date(selectedOrder.createdDate).toLocaleString('en-IN')}</p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <button 
                onClick={() => {
                  setSelectedOrder(null);
                  navigate('/admin/orders');
                }}
                className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl text-center transition-all"
              >
                Go to Orders Console
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
