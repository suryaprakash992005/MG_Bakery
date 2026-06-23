import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { AdminCustomer } from '../types';
import { 
  Search, 
  Users2, 
  Crown, 
  Sparkles, 
  IndianRupee, 
  Phone, 
  Mail,
  Calendar,
  Filter,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers } = useAdminState();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'VIP' | 'Regular' | 'New'>('All');

  // Dynamic KPI Stats
  const totalCount = customers.length;
  const vipCount = customers.filter(c => c.type === 'VIP').length;
  const totalSpend = customers.reduce((sum, c) => sum + c.lifetimeSpend, 0);
  const avgSpend = totalCount > 0 ? Math.round(totalSpend / totalCount) : 0;

  const getCustomerBadge = (type: AdminCustomer['type']) => {
    switch (type) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-brand-gold-50 text-brand-gold-700 border border-brand-gold-200 shadow-sm animate-pulse">
            <Crown className="w-3 h-3 text-brand-gold-600 fill-brand-gold-500" />
            <span>VIP Patron</span>
          </span>
        );
      case 'Regular':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <TrendingUp className="w-3 h-3" />
            <span>Regular</span>
          </span>
        );
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-650 border border-slate-200">
            <Sparkles className="w-3 h-3 text-slate-400" />
            <span>New Customer</span>
          </span>
        );
      default:
        return null;
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    const matchesType = typeFilter === 'All' || c.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-playfair font-bold text-slate-800">Customer Relationship Directory</h2>
        <p className="text-xs text-[#A38848] font-bold mt-0.5">Track repeat patronage patterns, total customer spending logs, and VIP tiers</p>
      </div>

      {/* CRM Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Profiles</span>
            <span className="text-2xl font-playfair font-black text-slate-800 block">{totalCount} Customers</span>
          </div>
          <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
            <Users2 className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">VIP Tier Patrons</span>
            <span className="text-2xl font-playfair font-black text-brand-gold-700 block">{vipCount} VIPs</span>
          </div>
          <div className="w-11 h-11 bg-brand-gold-50 border border-brand-gold-150 rounded-xl flex items-center justify-center text-brand-gold-700 shadow-sm">
            <Crown className="w-5.5 h-5.5 fill-brand-gold-500/20" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Customer Spend</span>
            <span className="text-2xl font-playfair font-black text-emerald-700 block">₹{avgSpend.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shadow-sm">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Email, Phone..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-full py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all focus:bg-white"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto justify-start md:justify-end pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 pr-2 text-xs font-bold text-slate-400 uppercase">
            <Filter className="w-4 h-4 text-slate-300" />
            <span>Tier:</span>
          </div>
          {(['All', 'VIP', 'Regular', 'New'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTypeFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                typeFilter === filter
                  ? 'bg-brand-gold-850 text-[#1A1110] border-brand-gold-500 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
              }`}
            >
              {filter === 'All' ? 'All Tiers' : filter}
            </button>
          ))}
        </div>

      </div>

      {/* CRM Database Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
                <th className="py-4 px-6">Customer Profile</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6 text-center">Total Orders</th>
                <th className="py-4 px-6">Lifetime Value</th>
                <th className="py-4 px-6">Last Active</th>
                <th className="py-4 px-6 text-center">Status Tier</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/25 transition-colors">
                    
                    {/* Customer Info Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-gold-50 border border-brand-gold-150 text-brand-gold-700 font-bold font-playfair text-sm flex items-center justify-center">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold text-sm leading-snug">{cust.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{cust.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contacts Details */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <a href={`tel:${cust.phone}`} className="text-slate-700 hover:text-[#D4AF37] flex items-center gap-1 font-semibold leading-none">
                          <Phone className="w-3.5 h-3.5 text-slate-350" />
                          <span>{cust.phone}</span>
                        </a>
                        <a href={`mailto:${cust.email}`} className="text-slate-400 hover:text-slate-650 flex items-center gap-1 font-normal">
                          <Mail className="w-3.5 h-3.5 text-slate-300" />
                          <span>{cust.email}</span>
                        </a>
                      </div>
                    </td>

                    {/* Total Orders count */}
                    <td className="py-4 px-6 text-center text-slate-700 font-bold">
                      {cust.totalOrders}
                    </td>

                    {/* Lifetime Value spend */}
                    <td className="py-4 px-6 text-slate-800 font-extrabold">
                      ₹{cust.lifetimeSpend.toLocaleString('en-IN')}
                    </td>

                    {/* Last active Date */}
                    <td className="py-4 px-6 text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        <span>{cust.lastOrderDate}</span>
                      </span>
                    </td>

                    {/* Customer status Badge */}
                    <td className="py-4 px-6 text-center">
                      {getCustomerBadge(cust.type)}
                    </td>

                    {/* WhatsApp Shortcut */}
                    <td className="py-4 px-6 text-right">
                      <a
                        href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${cust.name}, this is M.G. Iyengar Bakery. Thank you for your continued patronage! We are delighted to have you as part of our family.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center text-slate-400 font-semibold">
                    No customers found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
