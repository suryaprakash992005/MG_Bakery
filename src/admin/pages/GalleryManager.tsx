import React, { useState } from 'react';
import { useBakeryDatabase, UnifiedGalleryItem } from '../../context/DatabaseContext';
import { ImageUploader } from '../components/ImageUploader';
import { 
  Trash2, 
  X, 
  Calendar,
  Filter,
  Upload,
  RotateCcw
} from 'lucide-react';

export const GalleryManager: React.FC = () => {
  const { 
    gallery: allGalleryItems, 
    saveGalleryItem, 
    softDeleteGalleryItem, 
    restoreGalleryItem, 
    permanentlyDeleteGalleryItem, 
    reorderGallery 
  } = useBakeryDatabase();

  const [selectedFilter, setSelectedFilter] = useState('All');
  
  // Upload form modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentGalleryItem, setCurrentGalleryItem] = useState<UnifiedGalleryItem | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cakes');
  const [image, setImage] = useState('');
  const [displayPriority, setDisplayPriority] = useState(1);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filter lists
  const gallery = allGalleryItems.filter(item => !item.isDeleted);
  const trashItems = allGalleryItems.filter(item => item.isDeleted);

  const handleOpenAdd = () => {
    setTitle('');
    setCategory('cakes');
    setImage('');
    setDisplayPriority(gallery.length + 1);
    setShowAddForm(true);
  };

  const handleOpenEdit = (item: UnifiedGalleryItem) => {
    setCurrentGalleryItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setImage(item.image);
    setDisplayPriority(item.displayPriority || 99);
    setIsEditOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) return;

    saveGalleryItem({
      id: currentGalleryItem ? currentGalleryItem.id : `g-${Date.now()}`,
      title,
      category: category,
      image,
      displayPriority: Number(displayPriority) || gallery.length + 1
    });

    // Reset Form
    setTitle('');
    setImage('');
    setShowAddForm(false);
    setIsEditOpen(false);
    setCurrentGalleryItem(null);
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...filteredItems];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, movedItem);
    reorderGallery(reordered);
    setDraggedIndex(null);
  };

  // Filters
  const filters = ['All', 'cakes', 'pastries', 'products', 'interior', 'celebrations'];

  const filteredItems = gallery
    .filter(item => {
      return selectedFilter === 'All' || item.category === selectedFilter;
    })
    .sort((a, b) => (a.displayPriority || 999) - (b.displayPriority || 999));

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#2C1A17]/10 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2C1A17]">Media Gallery Manager</h2>
          <p className="text-xs text-[#2C1A17]/65 mt-1">Upload and arrange photos of your cakes, pastries, shop interior, and celebrations. Drag cards to reorder.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-gold-850 text-[#1E110F] hover:bg-brand-gold-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all border-none cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Categories & Filters */}
      <div className="bg-white border border-[#2C1A17]/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2C1A17]/70 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Filter Album</span>
        </div>
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all uppercase tracking-wider cursor-pointer ${
                selectedFilter === f
                  ? 'bg-brand-gold-850 text-[#1E110F] border-brand-gold-500 shadow-sm font-extrabold'
                  : 'bg-[#FAF6F0] hover:bg-[#FAF6F0]/80 text-[#2C1A17] border-[#2C1A17]/10'
              }`}
            >
              {f === 'All' ? 'View All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of gallery image cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Upload Form inside the Grid */}
        {showAddForm && (
          <div className="bg-[#FAF6F0] border-2 border-dashed border-[#2C1A17]/20 rounded-2xl p-6 flex flex-col justify-between h-[450px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-[#2C1A17]/70 uppercase tracking-wider">New Portfolio Item</span>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-full bg-white border border-[#2C1A17]/10 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSubmit} className="space-y-3 my-3 overflow-y-auto pr-1 flex-grow">
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Portfolio Image File" 
              />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image Title (e.g. Wedding Cake Setup)"
                className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all cursor-pointer font-bold text-[#2C1A17]/70"
                >
                  {['cakes', 'pastries', 'products', 'interior', 'celebrations'].map(cat => (
                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={displayPriority}
                  onChange={(e) => setDisplayPriority(Number(e.target.value))}
                  placeholder="Priority"
                  className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  title="Display Priority"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1E110F] text-[#F3EDE2] font-semibold text-xs py-2.5 rounded-xl hover:text-white transition-all cursor-pointer border-none mt-2"
              >
                Save to Portfolio
              </button>
            </form>
          </div>
        )}

        {/* Gallery Cards */}
        {filteredItems.map((item, idx) => (
          <div 
            key={item.id} 
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            className="bg-white border border-[#2C1A17]/10 rounded-2xl overflow-hidden h-[450px] flex flex-col justify-between group hover:border-brand-gold-500/50 transition-all cursor-grab active:cursor-grabbing"
          >
            {/* Image Preview */}
            <div className="h-56 relative bg-[#FAF6F0] overflow-hidden flex items-center justify-center shrink-0 border-b border-[#2C1A17]/5">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-[#1E110F]/80 text-brand-gold-500 border border-brand-gold-500/30 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm">
                {item.category}
              </div>
              <div className="absolute top-3 right-3 bg-white/95 text-[#2C1A17] px-2 py-0.5 rounded text-[9px] font-bold shadow-sm">
                Priority: {item.displayPriority || idx + 1}
              </div>
            </div>

            {/* Content & Settings */}
            <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-playfair font-bold text-sm text-[#2C1A17] truncate leading-snug" title={item.title}>
                  {item.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#2C1A17]/50 font-semibold uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Portfolio Showcase Asset</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 bg-white hover:bg-[#FAF6F0] border border-[#2C1A17]/15 text-[#2C1A17] text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => softDeleteGalleryItem(item.id)}
                  className="w-9 h-9 rounded-lg border border-[#2C1A17]/15 text-[#2C1A17]/40 hover:text-red-650 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer bg-white"
                  title="Remove from Gallery"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* --- TRASH / SOFT DELETE GALLERY ITEMS --- */}
      {trashItems.length > 0 && (
        <div className="bg-[#FAF6F0] border border-[#2C1A17]/10 rounded-2xl p-6 shadow-inner space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Gallery Trashbin (Soft Deleted)</h3>
            <span className="text-[10px] bg-red-50 text-red-850 font-bold px-2 py-0.5 rounded-full">{trashItems.length} Photos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trashItems.map(item => (
              <div key={item.id} className="bg-white border border-[#2C1A17]/5 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-[#2C1A17]/10" />
                  <div>
                    <h4 className="font-playfair font-bold text-xs text-[#2C1A17]">{item.title}</h4>
                    <span className="text-[10px] text-[#2C1A17]/50 uppercase">{item.category}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => restoreGalleryItem(item.id)}
                    className="p-1.5 border border-[#2C1A17]/10 text-[#2C1A17]/75 hover:bg-[#FAF6F0] rounded-lg cursor-pointer bg-white"
                    title="Restore"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you absolutely sure you want to permanently delete "${item.title}"?`)) {
                        permanentlyDeleteGalleryItem(item.id);
                      }
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100 rounded-lg cursor-pointer"
                    title="Purge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && currentGalleryItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-[#2C1A17]/10 flex flex-col my-8">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#2C1A17]/5 mb-4 bg-[#FAF6F0] -mx-6 -mt-6 p-4">
              <h3 className="font-playfair text-base font-bold text-[#2C1A17] flex items-center gap-1.5">
                <span>Edit Photo Details</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setCurrentGalleryItem(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-650 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Portfolio Image File" 
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Image Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer font-bold text-[#2C1A17]/70"
                  >
                    {['cakes', 'pastries', 'products', 'interior', 'celebrations'].map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
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
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2C1A17]/5">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setCurrentGalleryItem(null); }}
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
