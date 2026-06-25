import React, { useState } from 'react';
import { useBakeryDatabase, UnifiedBanner } from '../../context/DatabaseContext';
import { ImageUploader } from '../components/ImageUploader';
import { 
  Plus, 
  Trash2, 
  X, 
  Edit3, 
  FolderOpen,
  Eye,
  EyeOff,
  Move
} from 'lucide-react';

export const BannerManager: React.FC = () => {
  const { 
    banners: allBanners, 
    saveBanner, 
    deleteBanner, 
    reorderBanners 
  } = useBakeryDatabase();

  // Modals / forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<UnifiedBanner | null>(null);

  // Form inputs
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [displayPriority, setDisplayPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [isPromotion, setIsPromotion] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const banners = [...allBanners].sort((a, b) => (a.displayPriority || 99) - (b.displayPriority || 99));

  const handleOpenAdd = () => {
    setImage('');
    setTitle('');
    setSubtitle('');
    setDisplayPriority(banners.length + 1);
    setIsActive(true);
    setIsPromotion(false);
    setShowAddForm(true);
  };

  const handleOpenEdit = (b: UnifiedBanner) => {
    setCurrentBanner(b);
    setImage(b.image);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setDisplayPriority(b.displayPriority);
    setIsActive(b.isActive);
    setIsPromotion(b.isPromotion || false);
    setIsEditOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    saveBanner({
      id: currentBanner ? currentBanner.id : `b-${Date.now()}`,
      image,
      title: title || undefined,
      subtitle: subtitle || undefined,
      displayPriority: Number(displayPriority) || banners.length + 1,
      isActive,
      isPromotion
    });

    // Reset
    setImage('');
    setTitle('');
    setSubtitle('');
    setShowAddForm(false);
    setIsEditOpen(false);
    setCurrentBanner(null);
  };

  // Drag & drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...banners];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, movedItem);
    reorderBanners(reordered);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-8 select-none font-poppins animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Homepage Banner Slideshow</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage promotional sliders, festival special announcements, and visual hero banners.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 font-semibold text-xs px-5 py-3 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:text-white border-none"
        >
          <Plus className="w-4 h-4 text-brand-gold-850" />
          <span>Upload Banner Slide</span>
        </button>
      </div>

      {/* Slide grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upload box */}
        {showAddForm && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col justify-between h-[450px] animate-fade-in">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Banner Image</span>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSubmit} className="space-y-3.5 my-3 overflow-y-auto pr-1 flex-grow">
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Slide Background Banner" 
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Slide Title Caption (Optional)"
                className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Slide Subtitle / Promo details"
                className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={1}
                  value={displayPriority}
                  onChange={(e) => setDisplayPriority(Number(e.target.value))}
                  placeholder="Priority Order"
                  className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all font-bold"
                  title="Display Priority"
                />
                
                {/* Active switch */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 bg-white">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Active</span>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#1A1110] text-[#F3EDE2] font-semibold text-xs py-2.5 rounded-xl hover:text-white transition-all cursor-pointer border-none mt-2"
              >
                Save Slide
              </button>
            </form>
          </div>
        )}

        {/* Existing banners */}
        {banners.map((b, idx) => (
          <div 
            key={b.id} 
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            className={`bg-white border border-slate-200/85 rounded-3xl shadow-sm overflow-hidden h-[450px] flex flex-col justify-between group hover:border-[#D4AF37]/35 transition-all cursor-grab active:cursor-grabbing ${
              !b.isActive ? 'opacity-70 bg-slate-50/50' : ''
            }`}
          >
            {/* Image Frame */}
            <div className="h-56 relative bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border-b border-slate-100">
              <img src={b.image} alt={b.title || 'Slide'} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-[#1A1110]/80 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1">
                {b.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{b.isActive ? 'Active' : 'Muted'}</span>
              </div>
              <div className="absolute top-3 right-3 bg-white/95 text-slate-800 px-2 py-0.5 rounded text-[9px] font-bold shadow-sm flex items-center gap-1">
                <Move className="w-3 h-3 text-slate-400" />
                <span>Priority: {b.displayPriority}</span>
              </div>
            </div>

            {/* Captions & Action logs */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm text-slate-800 truncate" title={b.title}>
                  {b.title || 'Untitled Banner Slide'}
                </h4>
                <p className="text-[10px] text-slate-450 mt-1 font-light leading-relaxed line-clamp-2">
                  {b.subtitle || 'No subtitle caption supplied.'}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-250 text-slate-650 text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Slide</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this banner from slideshow?')) {
                      deleteBanner(b.id);
                    }
                  }}
                  className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-red-650 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer bg-white"
                  title="Remove Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && !showAddForm && (
          <div className="col-span-full py-20 text-center bg-white border border-slate-200/80 rounded-2xl">
            <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-semibold">No slideshow banners created yet.</p>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditOpen && currentBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 flex flex-col my-8 animate-fade-in-up">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 bg-slate-50 -mx-6 -mt-6 p-4">
              <h3 className="font-playfair text-base font-bold text-slate-800">Edit Banner Details</h3>
              <button onClick={() => { setIsEditOpen(false); setCurrentBanner(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Slide Background Banner" 
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Slide Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subtitle / Caption Text</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Display Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={displayPriority}
                    onChange={(e) => setDisplayPriority(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  />
                </div>
                
                {/* Active switch */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Status</label>
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 bg-slate-50 h-9">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Show Banner</span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setCurrentBanner(null); }}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 text-xs font-semibold cursor-pointer border-none"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
