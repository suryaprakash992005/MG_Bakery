import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { OrderStatus } from '../types';
import { 
  Search, 
  Phone, 
  Calendar,
  XCircle,
  ExternalLink
} from 'lucide-react';


export const Orders: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPaymentStatus } = useAdminState();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderedProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);

    let matchesStatus = true;
    if (statusFilter === 'Pending') matchesStatus = order.orderStatus === 'Pending';
    else if (statusFilter === 'Active') {
      matchesStatus = ['Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(order.orderStatus);
    }
    else if (statusFilter === 'Completed') matchesStatus = order.orderStatus === 'Delivered';
    else if (statusFilter === 'Cancelled') matchesStatus = order.orderStatus === 'Cancelled';

    return matchesSearch && matchesStatus;
  });

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Available status steps for changing status manually
  const allStatuses: OrderStatus[] = [
    'Pending',
    'Accepted',
    'Preparing',
    'Ready',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-playfair font-bold text-slate-800">Orders Management Console</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Manage live order requests, preparation tracking, and delivery dispatches</p>
      </div>

      {/* Stats Quick Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Name, Phone..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-full py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all focus:bg-white"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto justify-start md:justify-end pb-1 md:pb-0">
          {(['All', 'Pending', 'Active', 'Completed', 'Cancelled'] as const).map((filter) => {
            let count = 0;
            if (filter === 'All') count = orders.length;
            else if (filter === 'Pending') count = orders.filter(o => o.orderStatus === 'Pending').length;
            else if (filter === 'Active') count = orders.filter(o => ['Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.orderStatus)).length;
            else if (filter === 'Completed') count = orders.filter(o => o.orderStatus === 'Delivered').length;
            else if (filter === 'Cancelled') count = orders.filter(o => o.orderStatus === 'Cancelled').length;

            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-brand-gold-850 text-[#1A1110] border-brand-gold-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
                }`}
              >
                <span>{filter}</span>
                <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                  statusFilter === filter ? 'bg-[#1A1110] text-[#D4AF37]' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Screen Layout (Table + Side details panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Orders Table Column */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
          activeOrder ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Ordered Item</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Order Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-slate-50/40 transition-all cursor-pointer ${
                        selectedOrderId === order.id ? 'bg-brand-gold-50/20 border-l-2 border-brand-gold-500' : ''
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="py-4 px-6 font-mono text-slate-800 font-bold">{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{order.customerName}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{order.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 truncate max-w-[150px]" title={order.orderedProduct}>
                        {order.orderedProduct}
                        {order.quantity > 1 && <span className="text-slate-400 text-[10px] ml-1">x{order.quantity}</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-800 font-bold">₹{order.amount}</td>
                      <td className="py-4 px-6">{getPaymentStatusBadge(order.paymentStatus)}</td>
                      <td className="py-4 px-6">{getStatusBadge(order.orderStatus)}</td>
                      
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        {order.orderStatus === 'Pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Accepted')}
                              className="px-2 py-1 bg-brand-gold-850 hover:bg-brand-gold-600 text-[#1A1110] rounded text-[10px] font-bold transition-all cursor-pointer hover:text-white"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-bold border border-red-100 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="relative inline-block text-left group">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-brand-gold-500 cursor-pointer"
                            >
                              {allStatuses.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center text-slate-400 font-semibold">
                      No orders found matching this query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Details Panel */}
        {activeOrder && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6 lg:col-span-1 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 font-mono">{activeOrder.id}</span>
                <h3 className="font-playfair text-base font-bold text-slate-800 mt-0.5">Order Console Details</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)}
                className="w-7 h-7 rounded-full border border-slate-100 hover:bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Status change actions */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Controls</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Current Status:</span>
                  {getStatusBadge(activeOrder.orderStatus)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Payment State:</span>
                  <div className="flex gap-1.5 items-center">
                    {getPaymentStatusBadge(activeOrder.paymentStatus)}
                    <select
                      value={activeOrder.paymentStatus}
                      onChange={(e) => updateOrderPaymentStatus(activeOrder.id, e.target.value as any)}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Pending">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 pt-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Step Status Forward</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allStatuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => updateOrderStatus(activeOrder.id, st)}
                        className={`text-[9px] px-2 py-1 rounded font-bold border transition-all ${
                          activeOrder.orderStatus === st
                            ? 'bg-[#1A1110] text-[#D4AF37] border-[#1A1110] shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200/70'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer coordinates */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
              <div className="space-y-3 bg-[#FAF8F5] border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-400 min-w-[50px]">Name:</span>
                  <span className="text-slate-800 font-bold">{activeOrder.customerName}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-400 min-w-[50px]">Phone:</span>
                  <a href={`tel:${activeOrder.phone}`} className="text-[#D4AF37] hover:underline flex items-center gap-1 font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{activeOrder.phone}</span>
                  </a>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-slate-400 min-w-[50px]">Address:</span>
                  <span className="text-slate-600 font-medium leading-relaxed">{activeOrder.deliveryAddress}</span>
                </div>
              </div>
            </div>

            {/* Items details */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cart Contents</span>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-800 font-bold">{activeOrder.orderedProduct}</p>
                  <p className="text-slate-400 mt-1 font-semibold">Quantity: {activeOrder.quantity}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Ordered: {new Date(activeOrder.createdDate).toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <span className="text-slate-800 font-black text-sm shrink-0 pl-2">₹{activeOrder.amount}</span>
              </div>
            </div>

            {/* Quick Action Actions */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${activeOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${activeOrder.customerName}, regarding your M.G. Iyengar Bakery Order ${activeOrder.id} of "${activeOrder.orderedProduct}" totaling ₹${activeOrder.amount}. We are updating its status to "${activeOrder.orderStatus}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Message Client</span>
              </a>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
