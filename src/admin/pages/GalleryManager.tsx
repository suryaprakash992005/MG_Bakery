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
      category: category as any,
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
    <div className="space-y-8 select-none font-poppins animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Media Gallery Manager</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage portfolio pictures and visual sections. Drag cards to reorder display sequence on the website.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 font-semibold text-xs px-5 py-3 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:text-white border-none"
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
        {showAddForm && (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col justify-between h-[450px] animate-fade-in">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Portfolio Item</span>
              <button 
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent"
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
                className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all cursor-pointer font-bold text-slate-600"
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
                  className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  title="Display Priority"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1A1110] text-[#F3EDE2] font-semibold text-xs py-2.5 rounded-xl hover:text-white transition-all cursor-pointer border-none mt-2"
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
            className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden h-[450px] flex flex-col justify-between group hover:border-[#D4AF37]/35 transition-all cursor-grab active:cursor-grabbing"
          >
            {/* Image Preview */}
            <div className="h-56 relative bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border-b border-slate-100">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-[#1A1110]/80 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm">
                {item.category}
              </div>
              <div className="absolute top-3 right-3 bg-white/95 text-slate-800 px-2 py-0.5 rounded text-[9px] font-bold shadow-sm">
                Priority: {item.displayPriority || idx + 1}
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
                  <span>Portfolio Showcase Asset</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-250 text-slate-650 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => softDeleteGalleryItem(item.id)}
                  className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-650 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer bg-white"
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
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-inner space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="font-playfair text-lg font-bold text-slate-800">Gallery Trashbin (Soft Deleted)</h3>
            <span className="text-[10px] bg-red-100 text-red-750 font-bold px-2 py-0.5 rounded-full">{trashItems.length} Photos</span>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-150">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase bg-slate-50/50">
                  <th className="py-3 px-5">Image</th>
                  <th className="py-3 px-5">Image Title</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {trashItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-5">
                      <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover" />
                    </td>
                    <td className="py-2.5 px-5 font-bold text-slate-800">{item.title}</td>
                    <td className="py-2.5 px-5 uppercase">{item.category}</td>
                    <td className="py-2.5 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => restoreGalleryItem(item.id)}
                          className="px-2.5 py-1 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded font-semibold text-[10px] flex items-center gap-1 cursor-pointer bg-white"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you absolutely sure you want to permanently delete "${item.title}"?`)) {
                              permanentlyDeleteGalleryItem(item.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded font-bold text-[10px] cursor-pointer"
                        >
                          Purge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && currentGalleryItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 flex flex-col my-8 animate-fade-in-up">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 bg-slate-50 -mx-6 -mt-6 p-4">
              <h3 className="font-playfair text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span>Edit Photo Details</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setCurrentGalleryItem(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent">
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Image Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all cursor-pointer font-bold text-slate-600"
                  >
                    {['cakes', 'pastries', 'products', 'interior', 'celebrations'].map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
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
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setCurrentGalleryItem(null); }}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
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
