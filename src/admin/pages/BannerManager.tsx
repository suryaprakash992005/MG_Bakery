import React, { useState } from 'react';
import { useBakeryDatabase, UnifiedBanner } from '../../context/DatabaseContext';
import { ImageUploader } from '../components/ImageUploader';
import { 
  Plus, 
  Trash2, 
  X, 
  Edit3, 
  Eye, 
  EyeOff,
  Move,
  Cake
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
  const [featuredProductName, setFeaturedProductName] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [displayPriority, setDisplayPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const banners = [...allBanners].sort((a, b) => (a.displayPriority || 99) - (b.displayPriority || 99));

  const handleOpenAdd = () => {
    setImage('');
    setTitle('');
    setSubtitle('');
    setFeaturedProductName('');
    setCtaText('');
    setDisplayPriority(banners.length + 1);
    setIsActive(true);
    setShowAddForm(true);
  };

  const handleOpenEdit = (b: UnifiedBanner) => {
    setCurrentBanner(b);
    setImage(b.image);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setFeaturedProductName(b.featured_product_name || '');
    setCtaText(b.cta_text || '');
    setDisplayPriority(b.displayPriority);
    setIsActive(b.isActive);
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
      isPromotion: false,
      featured_product_name: featuredProductName || undefined,
      cta_text: ctaText || undefined
    });

    // Reset
    setImage('');
    setTitle('');
    setSubtitle('');
    setFeaturedProductName('');
    setCtaText('');
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
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#2C1A17]/10 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2C1A17]">Homepage Hero Banners</h2>
          <p className="text-xs text-[#2C1A17]/65 mt-1">Upload banner slideshows, change heading and subheading text overlays, and toggle active slides.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-gold-850 text-[#1E110F] hover:bg-brand-gold-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Banner</span>
        </button>
      </div>

      {/* Slide grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upload box */}
        {showAddForm && (
          <div className="bg-[#FAF6F0] border-2 border-dashed border-[#2C1A17]/20 rounded-2xl p-6 flex flex-col justify-between h-[450px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-[#2C1A17]/70 uppercase tracking-wider">New Banner Slide</span>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-full bg-white border border-[#2C1A17]/10 flex items-center justify-center text-slate-405 hover:text-slate-650 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSubmit} className="space-y-3 my-3 overflow-y-auto pr-1 flex-grow">
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Slide Background Banner" 
                bucket="banners"
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Slide Main Title (e.g. Fresh Cakes Everyday)"
                className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Slide Subtitle Text"
                className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <input
                type="text"
                value={featuredProductName}
                onChange={(e) => setFeaturedProductName(e.target.value)}
                placeholder="Featured Product Name (e.g. Royal Floral Celebration Cake)"
                className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="CTA Button Text (e.g. Order Now)"
                className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={1}
                  value={displayPriority}
                  onChange={(e) => setDisplayPriority(Number(e.target.value))}
                  placeholder="Priority"
                  className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all font-bold text-[#2C1A17]/70"
                  title="Display Priority"
                />
                
                {/* Active switch */}
                <div className="flex items-center justify-between border border-[#2C1A17]/10 rounded-xl px-3 bg-white">
                  <span className="text-[10px] text-[#2C1A17]/50 font-bold uppercase">Active</span>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="cursor-pointer accent-brand-gold-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#1E110F] text-[#F3EDE2] font-semibold text-xs py-2.5 rounded-xl hover:text-white transition-all cursor-pointer border-none mt-2"
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
            className={`bg-white border border-[#2C1A17]/10 rounded-2xl overflow-hidden h-[450px] flex flex-col justify-between group hover:border-brand-gold-500/50 transition-all cursor-grab active:cursor-grabbing ${
              !b.isActive ? 'opacity-70 bg-[#FAF6F0]/40' : ''
            }`}
          >
            {/* Image Frame */}
            <div className="h-56 relative bg-[#FAF6F0] overflow-hidden flex items-center justify-center shrink-0 border-b border-[#2C1A17]/5">
              <img src={b.image} alt={b.title || 'Slide'} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-[#1E110F]/80 text-brand-gold-500 border border-brand-gold-500/30 px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1">
                {b.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{b.isActive ? 'Active' : 'Muted'}</span>
              </div>
              <div className="absolute top-3 right-3 bg-white/95 text-[#2C1A17] px-2 py-0.5 rounded text-[9px] font-bold shadow-sm flex items-center gap-1">
                <Move className="w-3 h-3 text-brand-gold-700" />
                <span>Priority: {b.displayPriority}</span>
              </div>
            </div>

            {/* Captions & Actions */}
            <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-playfair font-bold text-sm text-[#2C1A17] truncate" title={b.title}>
                  {b.title || 'Untitled Banner Slide'}
                </h4>
                <p className="text-[10px] text-[#2C1A17]/60 mt-1 leading-normal line-clamp-2 h-8">
                  {b.subtitle || 'No subtitle caption supplied.'}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-[9px] text-[#2C1A17]/70 font-semibold truncate">
                    <span className="text-[#2C1A17]/45 font-bold uppercase">Product:</span> {b.featured_product_name || 'Fresh Bakery Special'}
                  </p>
                  <p className="text-[9px] text-[#2C1A17]/70 font-semibold truncate">
                    <span className="text-[#2C1A17]/45 font-bold uppercase">CTA Text:</span> {b.cta_text || 'Featured Cake'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="flex-1 bg-white hover:bg-[#FAF6F0] border border-[#2C1A17]/15 text-[#2C1A17] text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-gold-800" />
                  <span>Edit Slide</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this banner from slideshow?')) {
                      deleteBanner(b.id);
                    }
                  }}
                  className="w-9 h-9 rounded-lg border border-[#2C1A17]/15 text-[#2C1A17]/40 hover:text-red-650 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer bg-white"
                  title="Remove Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && !showAddForm && (
          <div className="col-span-full py-20 text-center bg-white border border-[#2C1A17]/10 rounded-2xl">
            <Cake className="w-12 h-12 text-[#2C1A17]/20 mx-auto mb-2" />
            <p className="text-sm text-[#2C1A17]/40 font-semibold">No slideshow banners created yet.</p>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditOpen && currentBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-[#2C1A17]/10 flex flex-col my-8 animate-fade-in-up">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#2C1A17]/5 mb-4 bg-[#FAF6F0] -mx-6 -mt-6 p-4">
              <h3 className="font-playfair text-base font-bold text-[#2C1A17]">Edit Banner Details</h3>
              <button onClick={() => { setIsEditOpen(false); setCurrentBanner(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-650 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Slide Background Banner" 
                bucket="banners"
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Slide Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Subtitle / Caption Text</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Featured Product Name</label>
                <input
                  type="text"
                  value={featuredProductName}
                  onChange={(e) => setFeaturedProductName(e.target.value)}
                  placeholder="e.g. Royal Floral Celebration Cake"
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">CTA Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Order Now"
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Display Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={displayPriority}
                    onChange={(e) => setDisplayPriority(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                
                {/* Active switch */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Active Status</label>
                  <div className="flex items-center justify-between border border-[#2C1A17]/10 rounded-xl px-3 bg-[#FAF6F0] h-9">
                    <span className="text-[10px] text-[#2C1A17]/50 font-bold uppercase">Show Banner</span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="cursor-pointer accent-brand-gold-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2C1A17]/5">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setCurrentBanner(null); }}
                  className="px-4 py-2 rounded-xl border border-[#2C1A17]/10 hover:bg-[#1E110F]/5 text-[#2C1A17] text-xs font-semibold cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1E110F] text-[#F3EDE2] hover:bg-brand-brown-900 text-xs font-semibold cursor-pointer border-none"
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
