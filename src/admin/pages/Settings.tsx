import React, { useState } from 'react';
import { useBakeryDatabase } from '../../context/DatabaseContext';
import { 
  Save, 
  Store, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  CalendarOff,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Plus,
  Trash2,
  Move
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings,
    categories,
    saveCategory,
    deleteCategory,
    reorderCategories
  } = useBakeryDatabase();

  const [successMsg, setSuccessMsg] = useState('');

  // Store profile form state
  const [bakeryName, setBakeryName] = useState(settings.bakeryName);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [deliveryCharge, setDeliveryCharge] = useState(settings.deliveryCharge);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl);
  const [businessHours, setBusinessHours] = useState(settings.businessHours);
  const [holidaySettings, setHolidaySettings] = useState(settings.holidaySettings);
  
  // Emergency and slides controls
  const [emergencyDisableOrdering, setEmergencyDisableOrdering] = useState(settings.emergencyDisableOrdering || false);
  const [isSliderEnabled, setIsSliderEnabled] = useState(settings.isSliderEnabled || false);

  // Category manager states
  const [newCatName, setNewCatName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    updateSettings({
      bakeryName,
      phone,
      whatsappNumber,
      storeAddress,
      deliveryCharge: Number(deliveryCharge),
      instagramUrl,
      facebookUrl,
      businessHours,
      holidaySettings,
      emergencyDisableOrdering,
      isSliderEnabled
    });

    setSuccessMsg('System settings updated successfully!');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  // Category Actions
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    // Check duplication
    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert('This category already exists!');
      return;
    }

    saveCategory({
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      displayPriority: categories.length + 1
    });

    setNewCatName('');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This might cause products under this category to lose their parent category classification.`)) {
      deleteCategory(id);
    }
  };

  // Drag and drop categories
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...categories].sort((a,b) => (a.displayPriority || 99) - (b.displayPriority || 99));
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, movedItem);
    reorderCategories(reordered);
    setDraggedIndex(null);
  };

  const sortedCategories = [...categories].sort((a,b) => (a.displayPriority || 99) - (b.displayPriority || 99));

  return (
    <div className="space-y-8 select-none font-poppins animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Store Settings & Management</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Configure operational business constants, emergency closures, and product category catalog structures.</p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* EMERGENCY ORDER LOCKOUT CARD */}
      <div className={`border-2 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-350 ${
        emergencyDisableOrdering 
          ? 'bg-rose-50 border-rose-300/80 text-rose-800' 
          : 'bg-white border-slate-200/80 text-slate-800'
      }`}>
        <div className="space-y-1.5 max-w-xl">
          <h3 className="font-playfair text-lg font-bold flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${emergencyDisableOrdering ? 'text-red-650 animate-bounce' : 'text-slate-450'}`} />
            <span>Emergency Ordering Override Switch</span>
          </h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            Toggle this block to temporarily disable checkouts across the entire customer storefront website (e.g. during sudden high volume, private holiday breaks, or natural grid closures).
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 py-2.5 px-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lockout Checkout</span>
          <label className="relative flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emergencyDisableOrdering}
              onChange={(e) => setEmergencyDisableOrdering(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-250 peer-checked:bg-red-600 rounded-full flex items-center transition-all p-0.5 cursor-pointer">
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${emergencyDisableOrdering ? 'translate-x-4' : ''}`} />
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Settings Form Column */}
        <form onSubmit={handleSaveSettings} className="space-y-6 lg:col-span-2">
          
          {/* SECTION 1: Business Profile */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store className="w-4.5 h-4.5 text-brand-gold-700" />
              <span>Bakery Profile</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Bakery Name</label>
                <input
                  type="text"
                  required
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Baking & Store Hours</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                    <Clock className="w-4 h-4" />
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
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Store Physical Address</label>
                <input
                  type="text"
                  required
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block">Standard Delivery Charge (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                  />
                </div>
                
                {/* Homepage Slider Enable Switch */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block">Homepage Banner Slider</label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 h-[38px]">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Enable Slider</span>
                    <input
                      type="checkbox"
                      checked={isSliderEnabled}
                      onChange={(e) => setIsSliderEnabled(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Contacts & WhatsApp Ordering */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-4.5 h-4.5 text-brand-gold-700" />
              <span>Ordering Contacts & Handles</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#D4AF37]">
                    <Phone className="w-4 h-4" />
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
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">WhatsApp Ordering Number</label>
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
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Instagram Link</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Facebook Link</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Holiday & closures notes */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CalendarOff className="w-4.5 h-4.5 text-brand-gold-700" />
              <span>Holiday & Closure Announcements</span>
            </h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Public notices shown to customers</label>
              <textarea
                value={holidaySettings}
                onChange={(e) => setHolidaySettings(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all focus:bg-white leading-normal"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 hover:text-white font-semibold text-xs px-6 py-3.5 rounded-full shadow-md flex items-center gap-2 transition-all duration-300 transform active:scale-95 cursor-pointer border-none"
            >
              <Save className="w-4.5 h-4.5 text-brand-gold-850" />
              <span>Save settings changes</span>
            </button>
          </div>

        </form>

        {/* CATEGORY MANAGER COLUMN */}
        <div className="space-y-6 lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FolderTree className="w-4.5 h-4.5 text-brand-gold-700" />
              <span>Category Manager</span>
            </h3>
            <p className="text-[10px] text-slate-450 leading-relaxed font-light">
              Add new categories, delete old classifications, or drag the items to reorder the storefront filters loop.
            </p>

            {/* List of categories */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {sortedCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs font-semibold text-slate-700 hover:border-brand-gold-300/40 cursor-grab active:cursor-grabbing transition-all hover:bg-slate-100/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Move className="w-3.5 h-3.5 text-slate-400 cursor-move shrink-0" />
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded w-5 text-center">{idx + 1}</span>
                    <span className="text-slate-800 font-bold">{cat.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 rounded text-slate-400 hover:text-red-650 hover:bg-red-50 border-none bg-transparent cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="border-t border-slate-100 pt-4 mt-6 flex gap-2">
            <input
              type="text"
              required
              placeholder="New category..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-grow bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none transition-all focus:bg-white"
            />
            <button
              type="submit"
              className="bg-[#1A1110] text-[#F3EDE2] font-semibold text-xs px-3 rounded-xl flex items-center justify-center hover:text-white transition-all cursor-pointer border-none shrink-0"
              title="Add Category"
            >
              <Plus className="w-4 h-4 text-brand-gold-850" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
