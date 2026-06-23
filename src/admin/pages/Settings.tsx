import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { 
  Save, 
  Store, 
  Phone, 
  MessageCircle, 
  MapPin, 
  DollarSign, 
  Clock, 
  CalendarOff,
  CheckCircle2
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, setSettings } = useAdminState();
  const [successMsg, setSuccessMsg] = useState('');

  // Local Form state
  const [bakeryName, setBakeryName] = useState(settings.bakeryName);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [deliveryCharge, setDeliveryCharge] = useState(settings.deliveryCharge);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl);
  const [businessHours, setBusinessHours] = useState(settings.businessHours);
  const [holidaySettings, setHolidaySettings] = useState(settings.holidaySettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    setSettings({
      bakeryName,
      phone,
      whatsappNumber,
      storeAddress,
      deliveryCharge: Number(deliveryCharge),
      instagramUrl,
      facebookUrl,
      businessHours,
      holidaySettings
    });

    setSuccessMsg('Business settings updated successfully!');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Store Management Settings</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Configure operational business constants, WhatsApp redirection numbers, and delivery tariffs</p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: Business Profile */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4.5 h-4.5 text-brand-gold-700" />
            <span>Bakery Profile</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bakery Name</label>
              <input
                type="text"
                required
                value={bakeryName}
                onChange={(e) => setBakeryName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Baking & Store Hours</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Logistics & Charge */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4.5 h-4.5 text-brand-gold-700" />
            <span>Logistics & Address</span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Physical Address</label>
              <input
                type="text"
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Standard Delivery Charge (₹)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  min={0}
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Social Contacts & WhatsApp API */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-4.5 h-4.5 text-brand-gold-700" />
            <span>Social Handles & Contacts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Ordering Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instagram URL Link</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F3EDE2]/30 group-focus-within:text-[#D4AF37] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facebook URL Link</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F3EDE2]/30 group-focus-within:text-[#D4AF37] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Holiday & Calendar settings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CalendarOff className="w-4.5 h-4.5 text-brand-gold-700" />
            <span>Holiday & Closures Settings</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual Closures & Special Notes</label>
            <textarea
              value={holidaySettings}
              onChange={(e) => setHolidaySettings(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
            />
          </div>
        </div>

        {/* Form Actions Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 hover:text-white font-semibold text-xs px-6 py-3.5 rounded-full shadow-md flex items-center gap-2 transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4.5 h-4.5 text-brand-gold-850" />
            <span>Save Settings Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
};

