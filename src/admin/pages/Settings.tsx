import React, { useState, useEffect, useRef } from 'react';
import { useBakeryDatabase } from '../../context/DatabaseContext';
import { 
  Save, 
  Store, 
  MessageCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Map,
  ShieldAlert,
  Video,
  Upload,
  Film
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
  const [heroVideoUrl, setHeroVideoUrl] = useState(settings.heroVideoUrl || '/Like_this_make_and_give_the_.mp4');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setHeroVideoUrl(settings.heroVideoUrl || '/Like_this_make_and_give_the_.mp4');
    }
  }, [settings]);

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (.mp4, .webm, .mov)');
      return;
    }

    // Create a local blob URL or file path URL
    const videoObjUrl = URL.createObjectURL(file);
    setHeroVideoUrl(videoObjUrl);
    setSuccessMsg(`Video file "${file.name}" selected! Click "Save Settings" to apply.`);
  };

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
        heroVideoUrl,
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
        <p className="text-xs text-[#2C1A17]/65 mt-1">Configure your bakery website profile, homepage background video, and contact links.</p>
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
        
        {/* 🎬 Homepage Hero Background Video Card */}
        <div className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#2C1A17]/5 pb-3">
            <h3 className="font-playfair text-base font-bold text-[#2C1A17] flex items-center gap-2">
              <Video className="w-4.5 h-4.5 text-brand-gold-800" />
              <span>Homepage Background Video</span>
            </h3>
            <span className="text-[10px] bg-brand-gold-100 text-brand-gold-900 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live Background
            </span>
          </div>

          <p className="text-xs text-[#2C1A17]/60 leading-relaxed">
            Upload or provide the URL of the background video that plays on your website homepage.
          </p>

          {/* Video Preview Player */}
          {heroVideoUrl && (
            <div className="relative rounded-xl overflow-hidden border border-[#2C1A17]/10 bg-black aspect-video max-h-56 w-full shadow-inner">
              <video
                key={heroVideoUrl}
                src={heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#1E110F]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-xs">
                <Film className="w-3 h-3 text-brand-gold-400" />
                <span>Live Video Preview</span>
              </div>
            </div>
          )}

          {/* Video URL & Upload Controls */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Video URL or Local Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="/Like_this_make_and_give_the_.mp4 or https://..."
                  className="flex-1 bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:bg-white transition-all font-mono"
                />
                
                {/* File Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleVideoFileUpload}
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF6F0] hover:bg-brand-gold-50 border border-[#2C1A17]/15 text-[#2C1A17] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                  title="Upload Video File from Computer"
                >
                  <Upload className="w-3.5 h-3.5 text-brand-gold-800" />
                  <span>Choose File</span>
                </button>
              </div>
              <p className="text-[10px] text-[#2C1A17]/50 mt-1">
                Formats supported: MP4, WebM, MOV. You can pick a video file from your device or type a URL.
              </p>
            </div>
          </div>
        </div>

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
