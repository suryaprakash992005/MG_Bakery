import React, { useState, useEffect } from 'react';
import { useBakeryDatabase } from '../../context/DatabaseContext';
import { 
  Save, 
  Store, 
  MessageCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Map,
  ShieldAlert
} from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings
  } = useBakeryDatabase();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Editable settings fields
  const [bakeryName, setBakeryName] = useState(settings.bakeryName);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [openingTime, setOpeningTime] = useState(settings.openingTime || '9:00 AM');
  const [closingTime, setClosingTime] = useState(settings.closingTime || '10:00 PM');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [googleMapsLink, setGoogleMapsLink] = useState(settings.googleMapsLink || '');

  // Synchronize input fields when settings load from Supabase
  useEffect(() => {
    if (settings) {
      setBakeryName(settings.bakeryName || '');
      setWhatsappNumber(settings.whatsappNumber || '');
      setStoreAddress(settings.storeAddress || '');
      setOpeningTime(settings.openingTime || '9:00 AM');
      setClosingTime(settings.closingTime || '10:00 PM');
      setInstagramUrl(settings.instagramUrl || '');
      setGoogleMapsLink(settings.googleMapsLink || '');
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      await updateSettings({
        ...settings,
        bakeryName,
        whatsappNumber,
        storeAddress,
        openingTime,
        closingTime,
        googleMapsLink,
        instagramUrl,
        // Backwards compatibility for businessHours string
        businessHours: `${openingTime} - ${closingTime}`
      });

      setSuccessMsg('Website settings saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setErrorMsg(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 select-none">
      
      {/* Header */}
      <div className="bg-white border border-[#2C1A17]/10 p-6 rounded-2xl shadow-sm">
        <h2 className="font-playfair text-2xl font-bold text-[#2C1A17]">Settings</h2>
        <p className="text-xs text-[#2C1A17]/65 mt-1">Configure your bakery website profile and contact links.</p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-250 text-rose-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-[#2C1A17] flex items-center gap-2 border-b border-[#2C1A17]/5 pb-3">
            <Store className="w-4.5 h-4.5 text-brand-gold-800" />
            <span>Bakery Profile</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Bakery Name</label>
            <input
              type="text"
              required
              value={bakeryName}
              onChange={(e) => setBakeryName(e.target.value)}
              className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Address & Location Card */}
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-[#2C1A17] flex items-center gap-2 border-b border-[#2C1A17]/5 pb-3">
            <MapPin className="w-4.5 h-4.5 text-brand-gold-800" />
            <span>Address & Location Link</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Store Address</label>
              <textarea
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                rows={2}
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all leading-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Google Maps Location Link</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-gold-700">
                  <Map className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours Card */}
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-[#2C1A17] flex items-center gap-2 border-b border-[#2C1A17]/5 pb-3">
            <Clock className="w-4.5 h-4.5 text-brand-gold-800" />
            <span>Store Hours</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Opening Time</label>
              <input
                type="text"
                required
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="E.g., 9:00 AM"
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Closing Time</label>
              <input
                type="text"
                required
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="E.g., 10:00 PM"
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Ordering Contact & Handles Card */}
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-playfair text-base font-bold text-[#2C1A17] flex items-center gap-2 border-b border-[#2C1A17]/5 pb-3">
            <MessageCircle className="w-4.5 h-4.5 text-brand-gold-800" />
            <span>Contacts & Handles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">WhatsApp Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-gold-700">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Instagram Link</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-gold-700">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 bg-[#1E110F] text-[#FAF6F0] hover:bg-brand-brown-900 font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition-all border-none cursor-pointer ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Save className="w-4 h-4 text-brand-gold-500" />
            <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
