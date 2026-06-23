import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { CustomCakeOrder } from '../types';
import { 
  Check, 
  X, 
  IndianRupee, 
  Calendar, 
  Scale, 
  MessageSquare,
  ShieldQuestion,
  ExternalLink
} from 'lucide-react';


export const CustomOrders: React.FC = () => {
  const { customOrders, updateCustomOrderStatus } = useAdminState();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(customOrders[0]?.id || null);
  const [quotePriceInput, setQuotePriceInput] = useState<string>('');

  const activeOrder = customOrders.find(item => item.id === selectedOrderId);

  const handleApprove = (id: string) => {
    const price = quotePriceInput ? Number(quotePriceInput) : activeOrder?.quotedPrice || 2500;
    updateCustomOrderStatus(id, 'Approved', price);
    setQuotePriceInput('');
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this custom cake request?')) {
      updateCustomOrderStatus(id, 'Rejected');
    }
  };

  const handleQuotationChange = (id: string) => {
    if (!quotePriceInput) return;
    updateCustomOrderStatus(id, 'Quoted', Number(quotePriceInput));
  };

  const getStatusBadge = (status: CustomCakeOrder['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Awaiting Quote</span>;
      case 'Quoted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Quoted / Pending Approval</span>;
      case 'Approved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Approved & Ordered</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-red-700 border border-rose-200">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-playfair font-bold text-slate-800">Custom Cakes Consultation Board</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Review custom wedding cake sketches, birthday theme details, set pricing quotations, and communicate with clients</p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Inquiries list/table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-playfair text-base font-bold text-slate-800">Inbound Custom Requests</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">All customer custom uploads and delivery dates</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
                  <th className="py-4 px-6 w-16 text-center">Sketch</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Theme Type</th>
                  <th className="py-4 px-6">Weight</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Price Quote</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {customOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-slate-50/30 transition-all cursor-pointer ${
                      selectedOrderId === order.id ? 'bg-brand-gold-50/20 border-l-2 border-brand-gold-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setQuotePriceInput(order.quotedPrice ? order.quotedPrice.toString() : '');
                    }}
                  >
                    
                    {/* Tiny Image Circle */}
                    <td className="py-3 px-6 text-center">
                      <div className="w-9 h-9 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 mx-auto shadow-inner">
                        <img src={order.referenceImage} alt={order.theme} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-6 font-bold text-slate-800">{order.customerName}</td>
                    
                    {/* Theme */}
                    <td className="py-3 px-6 truncate max-w-[140px]" title={order.theme}>{order.theme}</td>

                    {/* Weight */}
                    <td className="py-3 px-6 text-slate-500 font-bold">{order.weight}</td>

                    {/* Delivery date */}
                    <td className="py-3 px-6 text-slate-500 font-semibold">{order.deliveryDate}</td>

                    {/* Price Quoted */}
                    <td className="py-3 px-6 text-slate-800 font-extrabold">
                      {order.quotedPrice ? `₹${order.quotedPrice}` : <span className="text-slate-400 italic">Not set</span>}
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-6 text-center">{getStatusBadge(order.status)}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Consultation Card (1 col) */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden sticky top-20">
          {activeOrder ? (
            <div className="flex flex-col">
              
              {/* Reference Image Preview Header */}
              <div className="h-48 relative overflow-hidden bg-slate-100 border-b border-slate-100 flex items-center justify-center">
                <img src={activeOrder.referenceImage} alt={activeOrder.theme} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-[#1A1110]/85 text-brand-gold-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-sm">
                  Reference Sketch
                </div>
              </div>

              {/* Consultation Details */}
              <div className="p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono block uppercase">{activeOrder.id}</span>
                  <h3 className="font-playfair text-lg font-bold text-slate-800 mt-1 leading-snug">{activeOrder.theme}</h3>
                  <div className="mt-2.5 flex items-center gap-4">
                    {getStatusBadge(activeOrder.status)}
                  </div>
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Requested weight</span>
                    <span className="text-slate-800 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{activeOrder.weight}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Target Date</span>
                    <span className="text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{activeOrder.deliveryDate}</span>
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Special Baking Instructions</span>
                  <p className="bg-[#FAF8F5] border border-slate-100 rounded-xl p-3.5 text-slate-600 leading-relaxed font-medium italic">
                    "{activeOrder.instructions || 'No special instructions given.'}"
                  </p>
                </div>

                {/* Quotation pricing setter */}
                {activeOrder.status !== 'Approved' && activeOrder.status !== 'Rejected' && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Set Price Quotation</span>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        value={quotePriceInput}
                        onChange={(e) => setQuotePriceInput(e.target.value)}
                        placeholder="E.g. 3500"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#D4AF37]/50 rounded-xl py-2.5 pl-9 pr-24 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuotationChange(activeOrder.id)}
                        className="absolute right-1.5 inset-y-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Set Quote
                      </button>
                    </div>
                  </div>
                )}

                {/* Approval buttons */}
                <div className="space-y-3 pt-2">
                  {activeOrder.status === 'Pending' || activeOrder.status === 'Quoted' ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(activeOrder.id)}
                        className="flex-1 bg-brand-gold-850 hover:bg-brand-gold-600 text-[#1A1110] font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:text-white"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Dispatch</span>
                      </button>
                      <button
                        onClick={() => handleReject(activeOrder.id)}
                        className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        title="Reject Inquiry"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : null}

                  {/* Contact button */}
                  <a
                    href={`https://wa.me/${activeOrder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${activeOrder.customerName}, this is M.G. Iyengar Bakery regarding your custom cake request for "${activeOrder.theme}". We have reviewed your design submission and set the quotation to ₹${activeOrder.quotedPrice || '3500'}. Let us know your confirmation!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Discuss details on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-semibold space-y-3">
              <ShieldQuestion className="w-12 h-12 text-slate-200 mx-auto" />
              <p>Select a custom inquiry to inspect sketch design details and quote pricing.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
