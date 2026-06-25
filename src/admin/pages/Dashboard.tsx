import React from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { useAdminRouter } from '../hooks/useAdminRouter';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Clock, 
  Calendar, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { products } = useAdminState();
  const { navigate } = useAdminRouter();

  // Dynamic calculations from live state
  const activeProductsCount = products.filter(p => p.isAvailable).length;

  const kpis = [
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
      title: 'Menu Categories',
      value: '7 Categories',
      change: 'Fully Stocked',
      isPositive: true,
      icon: ClipboardList,
      color: 'from-amber-500 to-brand-gold-500',
      textColor: 'text-brand-gold-700'
    },
    {
      title: 'Store Hours',
      value: '9:00 AM - 10:00 PM',
      change: '7 Days a Week',
      isPositive: true,
      icon: Clock,
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-700'
    },
    {
      title: 'Baking Batches',
      value: '2 Batches Daily',
      change: 'Fresh Out of Oven',
      isPositive: true,
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-700'
    }
  ];

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
            Here's what's happening at M.G. Iyengar Bakery today. You have <span className="text-[#D4AF37] font-semibold">{activeProductsCount} products</span> active.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/products')}
          className="bg-brand-gold-850 hover:bg-brand-gold-600 text-[#1A1110] font-semibold text-xs px-5 py-3 rounded-full transition-all duration-300 transform active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 z-10 hover:text-white"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Manage Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <span className="text-xl md:text-2xl font-playfair font-bold text-slate-800 block truncate" title={kpi.value.toString()}>{kpi.value}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#1A1110] group-hover:text-[#D4AF37] transition-all duration-300 shadow-sm shrink-0">
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
                <span className="text-[10px] text-slate-400 font-medium">status</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Administration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Management Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="space-y-3">
            <h3 className="font-playfair text-xl font-bold text-slate-800">Products Catalog</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Add new celebration cakes, update pricing tiers, adjust daily baking availability status, and upload product photos.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/products')}
            className="mt-6 bg-[#1A1110] hover:bg-[#2C1717] text-brand-gold-850 hover:text-white font-semibold text-xs py-3 px-6 rounded-xl transition-all duration-300 w-fit flex items-center gap-1.5 cursor-pointer"
          >
            <span>Go to Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gallery Showcases Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="space-y-3">
            <h3 className="font-playfair text-xl font-bold text-slate-800">Gallery Manager</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Update store showcase images, celebration party photos, cake visual portfolio, and filter categories.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/gallery-manager')}
            className="mt-6 bg-[#1A1110] hover:bg-[#2C1717] text-brand-gold-850 hover:text-white font-semibold text-xs py-3 px-6 rounded-xl transition-all duration-300 w-fit flex items-center gap-1.5 cursor-pointer"
          >
            <span>Go to Gallery Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
