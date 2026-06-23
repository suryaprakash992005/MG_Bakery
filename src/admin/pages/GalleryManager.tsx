import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  X,
  Calendar,
  Filter,
  Upload
} from 'lucide-react';


export const GalleryManager: React.FC = () => {
  const { gallery, setGallery } = useAdminState();
  const [selectedFilter, setSelectedFilter] = useState('All');
  
  // Upload states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cakes');
  const [imageUrl, setImageUrl] = useState('');

  // Replace states
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [replaceUrl, setReplaceUrl] = useState('');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const newItem = {
      id: `g-${Date.now()}`,
      title,
      category,
      image: imageUrl,
      uploadDate: new Date().toISOString().split('T')[0],
      isBanner: false
    };

    const updated = [newItem, ...gallery];
    setGallery(updated);
    localStorage.setItem('admin_gallery', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setImageUrl('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image from the gallery?')) {
      const updated = gallery.filter(item => item.id !== id);
      setGallery(updated);
      localStorage.setItem('admin_gallery', JSON.stringify(updated));
    }
  };

  const handleToggleBanner = (id: string) => {
    const updated = gallery.map(item => {
      if (item.id === id) {
        return { ...item, isBanner: !item.isBanner };
      }
      return item;
    });
    setGallery(updated);
    localStorage.setItem('admin_gallery', JSON.stringify(updated));
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceId || !replaceUrl) return;

    const updated = gallery.map(item => {
      if (item.id === replaceId) {
        return { ...item, image: replaceUrl };
      }
      return item;
    });
    setGallery(updated);
    localStorage.setItem('admin_gallery', JSON.stringify(updated));
    
    setReplaceId(null);
    setReplaceUrl('');
  };

  // Filters
  const filters = ['All', 'cakes', 'pastries', 'products', 'interior', 'celebrations'];

  const filteredItems = gallery.filter(item => {
    return selectedFilter === 'All' || item.category === selectedFilter;
  });

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Media Gallery Manager</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage public portfolio pictures, homepage slider image loops, and promotional banners</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 font-semibold text-xs px-5 py-3 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:text-white"
        >
          <Upload className="w-4 h-4 text-brand-gold-850" />
          <span>Upload New Photo</span>
        </button>
      </div>

      {/* Categories & Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Filter className="w-4.5 h-4.5" />
          <span>Filter Album</span>
        </div>
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all uppercase tracking-wider cursor-pointer ${
                selectedFilter === f
                  ? 'bg-brand-gold-850 text-[#1A1110] border-brand-gold-500 shadow-sm font-extrabold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/60'
              }`}
            >
              {f === 'All' ? 'View All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of gallery image cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Upload Mock Box Card inside the Grid */}
        {showAddForm ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-350 rounded-2xl p-6 flex flex-col justify-between h-[360px] animate-fade-in">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Portfolio Item</span>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-3.5 my-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image Title (e.g. Wedding Cake Setup)"
                className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Direct Image URL link"
                className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              >
                {['cakes', 'pastries', 'products', 'interior', 'celebrations'].map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-[#1A1110] text-[#F3EDE2] font-semibold text-xs py-2.5 rounded-xl hover:text-white transition-all cursor-pointer"
              >
                Save to Portfolio
              </button>
            </form>

            <span className="text-[10px] text-slate-400 text-center font-medium">Image will instantly post to public cakes / gallery page.</span>
          </div>
        ) : (
          <div 
            onClick={() => setShowAddForm(true)}
            className="border-2 border-dashed border-slate-200 hover:border-brand-gold-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 text-slate-400 hover:text-brand-gold-700 bg-white hover:bg-brand-gold-50/10 cursor-pointer h-[360px] transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-brand-gold-100 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-brand-gold-800 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-bold block text-slate-800">Add Portfolio Photo</span>
              <span className="text-xs font-light block leading-relaxed max-w-[180px] mx-auto text-slate-400">Drag files here, click to browse, or paste image URL</span>
            </div>
          </div>
        )}

        {/* Gallery Cards */}
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden h-[360px] flex flex-col justify-between group hover:border-[#D4AF37]/35 transition-all">
            
            {/* Image Preview */}
            <div className="h-44 relative bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border-b border-slate-100">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-[#1A1110]/80 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm">
                {item.category}
              </div>
            </div>

            {/* Content & Settings */}
            <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-sm text-slate-800 truncate leading-snug" title={item.title}>
                  {item.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted: {item.uploadDate || '2026-06-20'}</span>
                </div>
              </div>

              {/* Slider / Promo banner switches */}
              <div className="bg-[#FAF8F5] border border-slate-100 rounded-xl p-2.5 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Home Slider Loop</span>
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.isBanner}
                    onChange={() => handleToggleBanner(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-checked:bg-brand-gold-500 rounded-full flex items-center transition-all p-0.5 cursor-pointer">
                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${item.isBanner ? 'translate-x-3.5' : ''}`} />
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setReplaceId(item.id);
                    setReplaceUrl(item.image);
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-250 text-slate-600 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace URL</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer"
                  title="Remove from Gallery"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* --- REPLACE IMAGE URL MODAL --- */}
      {replaceId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-1.5">
                <RefreshCw className="w-4.5 h-4.5 text-brand-gold-600" />
                <span>Replace Image Link</span>
              </h3>
              <button onClick={() => setReplaceId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Image URL Address</label>
                <textarea
                  required
                  value={replaceUrl}
                  onChange={(e) => setReplaceUrl(e.target.value)}
                  rows={4}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplaceId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 text-xs font-semibold cursor-pointer"
                >
                  Apply Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
