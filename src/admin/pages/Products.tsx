import React, { useState } from 'react';
import { useBakeryDatabase, UnifiedProduct } from '../../context/DatabaseContext';
import { ImageUploader } from '../components/ImageUploader';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Cake, 
  FolderOpen,
  Copy,
  RotateCcw,
  Star,
  EyeOff,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Products: React.FC = () => {
  const { 
    products: allProducts, 
    saveProduct, 
    softDeleteProduct, 
    restoreProduct, 
    permanentlyDeleteProduct, 
    duplicateProduct,
    reorderProducts,
    categories
  } = useBakeryDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<UnifiedProduct | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('Cakes');
  const [status, setStatus] = useState<UnifiedProduct['status']>('Available');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [displayPriority, setDisplayPriority] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [dailySpecial, setDailySpecial] = useState(false);
  const [badge, setBadge] = useState<UnifiedProduct['badge']>('None');
  const [limitedStockCount, setLimitedStockCount] = useState<number | undefined>(undefined);
  const [publishDate, setPublishDate] = useState('');
  const [visibilityExpiryDate, setVisibilityExpiryDate] = useState('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Extract products
  const products = allProducts.filter(p => !p.isDeleted);
  const trashProducts = allProducts.filter(p => p.isDeleted);

  // Extract all categories list dynamically
  const categoriesList = ['All', ...categories.map(c => c.name)];

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setPrice(350);
    setWeight('0.5 Kg');
    setCategory(categories[0]?.name || 'Cakes');
    setStatus('Available');
    setImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80');
    setImages([]);
    setDisplayPriority(products.length + 1);
    setIsFeatured(false);
    setDailySpecial(false);
    setBadge('None');
    setLimitedStockCount(undefined);
    setPublishDate('');
    setVisibilityExpiryDate('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: UnifiedProduct) => {
    setCurrentProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(typeof p.price === 'number' ? p.price : (p.price.halfKg || p.price.piece || 0));
    setWeight(p.weight || '');
    setCategory(p.category);
    setStatus(p.status);
    setImage(p.image);
    setImages(p.images || []);
    setDisplayPriority(p.displayPriority);
    setIsFeatured(p.isFeatured || false);
    setDailySpecial(p.dailySpecial || false);
    setBadge(p.badge || 'None');
    setLimitedStockCount(p.limitedStockCount);
    setPublishDate(p.publishDate || '');
    setVisibilityExpiryDate(p.visibilityExpiryDate || '');
    setIsEditOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    
    saveProduct({
      id: `p-${Date.now()}`,
      name,
      description,
      price: Number(price),
      weight,
      category,
      image,
      images: images.length > 0 ? images : [image],
      status,
      displayPriority: Number(displayPriority) || products.length + 1,
      isFeatured,
      dailySpecial,
      badge,
      limitedStockCount: limitedStockCount ? Number(limitedStockCount) : undefined,
      publishDate: publishDate || undefined,
      visibilityExpiryDate: visibilityExpiryDate || undefined,
      createdDate: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !name || !price || !category) return;

    saveProduct({
      ...currentProduct,
      name,
      description,
      price: Number(price),
      weight,
      category,
      image,
      images: images.length > 0 ? images : [image],
      status,
      displayPriority: Number(displayPriority),
      isFeatured,
      dailySpecial,
      badge,
      limitedStockCount: limitedStockCount ? Number(limitedStockCount) : undefined,
      publishDate: publishDate || undefined,
      visibilityExpiryDate: visibilityExpiryDate || undefined
    });
    setIsEditOpen(false);
    setCurrentProduct(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...filteredProducts];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, movedItem);
    reorderProducts(reordered);
    setDraggedIndex(null);
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Cakes':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pastries':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Cookies':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Puffs':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Breads':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Snacks':
        return 'bg-yellow-50 text-yellow-750 border-yellow-250';
      case 'Beverages':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 select-none font-poppins">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Inventory Catalog</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage cakes, pastries, puffs, breads, and categories. Drag rows to reorder customer view sequence.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 font-semibold text-xs px-5 py-3 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 transform active:scale-95 cursor-pointer hover:text-white border-none"
        >
          <Plus className="w-4 h-4 text-brand-gold-850" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and search actions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-full py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all focus:bg-white"
          />
        </div>

        {/* Categories filters scrollable */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto justify-start md:justify-end pb-1 md:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-gold-850 text-[#1A1110] border-brand-gold-500 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Inventory table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
                <th className="py-4 px-6 w-20">Priority & Image</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Badges</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, idx) => (
                  <tr 
                    key={p.id} 
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className="hover:bg-slate-50/40 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    {/* Priority Order Label & Product Image */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded w-6 text-center">{p.displayPriority || idx + 1}</span>
                        <div className="w-12 h-12 rounded-xl border border-slate-150 overflow-hidden bg-slate-50 shrink-0 shadow-sm relative group">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Name & description & schedule notices */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-bold text-sm">{p.name}</span>
                          {p.dailySpecial && (
                            <span className="bg-brand-gold-50 text-brand-gold-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-brand-gold-200">Daily Special</span>
                          )}
                          {p.limitedStockCount !== undefined && (
                            <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">Stock: {p.limitedStockCount} left</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 max-w-[280px] truncate" title={p.description}>
                          {p.description || 'No description added.'}
                        </span>
                        
                        {/* Publishing / Expiry Indicators */}
                        {(p.publishDate || p.visibilityExpiryDate) && (
                          <div className="flex gap-2.5 mt-1 text-[9px] font-semibold text-slate-400 items-center">
                            {p.publishDate && (
                              <span className="flex items-center gap-0.5 text-blue-600 bg-blue-50 px-1 rounded">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>Pub: {p.publishDate}</span>
                              </span>
                            )}
                            {p.visibilityExpiryDate && (
                              <span className="flex items-center gap-0.5 text-rose-600 bg-rose-50 px-1 rounded">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>Exp: {p.visibilityExpiryDate}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category pill */}
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getCategoryColor(p.category)}`}>
                        {p.category}
                      </span>
                    </td>

                    {/* Price & weight */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold">₹{typeof p.price === 'number' ? p.price : (p.price.halfKg || p.price.piece || 0)}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">{p.weight || 'Standard'}</span>
                      </div>
                    </td>

                    {/* Availability / status toggle */}
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        p.status === 'Available' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : p.status === 'Out of Stock' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {p.status === 'Available' ? <Eye className="w-3.5 h-3.5" /> : p.status === 'Out of Stock' ? <AlertCircle className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{p.status}</span>
                      </span>
                    </td>

                    {/* Badges / Featured */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {p.isFeatured && (
                          <span className="bg-brand-gold-850 text-[#1A1110] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Featured</span>
                          </span>
                        )}
                        {p.badge && p.badge !== 'None' && (
                          <span className="bg-slate-100 text-slate-650 border border-slate-250 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-gold-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer bg-white"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(p.id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center transition-all cursor-pointer bg-white"
                          title="Duplicate Cake"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => softDeleteProduct(p.id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-red-650 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer bg-white"
                          title="Soft Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center text-slate-400 font-medium">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                    <span>No products found matching filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- TRASH / SOFT DELETE LOG DRAWER --- */}
      {trashProducts.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-inner space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="font-playfair text-lg font-bold text-slate-800">Product Trashbin (Soft Deleted)</h3>
            <span className="text-[10px] bg-red-100 text-red-750 font-bold px-2 py-0.5 rounded-full">{trashProducts.length} Items</span>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-slate-150">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase bg-slate-50/50">
                  <th className="py-3 px-5">Image</th>
                  <th className="py-3 px-5">Product Name</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {trashProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-5">
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    </td>
                    <td className="py-2.5 px-5 font-bold text-slate-800">{p.name}</td>
                    <td className="py-2.5 px-5">{p.category}</td>
                    <td className="py-2.5 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => restoreProduct(p.id)}
                          className="px-2.5 py-1 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded font-semibold text-[10px] flex items-center gap-1 cursor-pointer bg-white"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you absolutely sure you want to permanently delete "${p.name}"? This cannot be undone.`)) {
                              permanentlyDeleteProduct(p.id);
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

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-8 animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-brand-gold-600" />
                <h3 className="font-playfair text-lg font-bold text-slate-800">Add New Cake & Product</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-600 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              
              {/* Product Image Uploader */}
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Primary Product Image (JPG/PNG/WEBP)" 
              />

              {/* Multiple Images Upload grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Additional Screenshots / View Angles (Max 4)</label>
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200 group">
                      <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-sm border-none cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <div className="aspect-square bg-slate-50 border border-dashed border-slate-300 rounded-xl relative hover:border-slate-400 transition-colors">
                      <ImageUploader
                        value=""
                        onChange={(newImg) => {
                          if (newImg) setImages([...images, newImg]);
                        }}
                        label="Add Angle"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cake/Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Butterscotch Cake"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white animate-none"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Weight/Size</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="E.g. 0.5 Kg, Single Piece"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>

                {/* displayPriority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Display Priority Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayPriority}
                    onChange={(e) => setDisplayPriority(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* status select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Stock Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white cursor-pointer"
                  >
                    <option value="Available">Available (Visible & Orderable)</option>
                    <option value="Out of Stock">Out of Stock (Visible, Orders Disabled)</option>
                    <option value="Hidden">Hidden (Not visible to users)</option>
                  </select>
                </div>

                {/* badge select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Badge Badge</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white cursor-pointer"
                  >
                    <option value="None">No Special Badge</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New Arrival">New Arrival</option>
                  </select>
                </div>

                {/* limitedStockCount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Limited Stock Count (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={limitedStockCount === undefined ? '' : limitedStockCount}
                    onChange={(e) => setLimitedStockCount(e.target.value === '' ? undefined : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Details about flavor layers, ingredients, toppings, allergens, etc."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white leading-normal"
                />
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                {/* Publish Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Scheduled Publish Date (Optional)</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  />
                </div>

                {/* Visibility Expiry */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Visibility Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={visibilityExpiryDate}
                    onChange={(e) => setVisibilityExpiryDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                {/* Featured Toggle */}
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-white border border-slate-200 peer-checked:border-brand-gold-500 peer-checked:bg-brand-gold-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                    {isFeatured && (
                      <Star className="w-3.5 h-3.5 text-brand-gold-700 fill-current" />
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Featured Homepage Product</span>
                </label>

                {/* Daily Special Toggle */}
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dailySpecial}
                    onChange={(e) => setDailySpecial(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                    {dailySpecial && (
                      <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Daily Special Product</span>
                </label>
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 hover:text-white text-xs font-semibold shadow-sm cursor-pointer border-none"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditOpen && currentProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-8 animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-gold-600" />
                <h3 className="font-playfair text-lg font-bold text-slate-800">Edit Product: {name}</h3>
              </div>
              <button onClick={() => { setIsEditOpen(false); setCurrentProduct(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-600 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              
              {/* Product Image Uploader */}
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Primary Product Image" 
              />

              {/* Multiple Images Upload grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Additional Screenshots / View Angles (Max 4)</label>
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200 group">
                      <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-sm border-none cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <div className="aspect-square bg-slate-50 border border-dashed border-slate-300 rounded-xl relative hover:border-slate-450 transition-colors">
                      <ImageUploader
                        value=""
                        onChange={(newImg) => {
                          if (newImg) setImages([...images, newImg]);
                        }}
                        label="Add Angle"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Butterscotch Cake"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Weight/Size</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="E.g. 0.5 Kg, Single Piece"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>

                {/* displayPriority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Display Priority Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayPriority}
                    onChange={(e) => setDisplayPriority(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* status select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Stock Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white cursor-pointer"
                  >
                    <option value="Available">Available (Visible & Orderable)</option>
                    <option value="Out of Stock">Out of Stock (Visible, Orders Disabled)</option>
                    <option value="Hidden">Hidden (Not visible to users)</option>
                  </select>
                </div>

                {/* badge select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Badge</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white cursor-pointer"
                  >
                    <option value="None">No Special Badge</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New Arrival">New Arrival</option>
                  </select>
                </div>

                {/* limitedStockCount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Limited Stock Count (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={limitedStockCount === undefined ? '' : limitedStockCount}
                    onChange={(e) => setLimitedStockCount(e.target.value === '' ? undefined : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Details about flavor layers, ingredients, toppings, allergens, etc."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white leading-normal"
                />
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                {/* Publish Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Scheduled Publish Date (Optional)</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  />
                </div>

                {/* Visibility Expiry */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Visibility Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={visibilityExpiryDate}
                    onChange={(e) => setVisibilityExpiryDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                {/* Featured Toggle */}
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-white border border-slate-200 peer-checked:border-brand-gold-500 peer-checked:bg-brand-gold-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                    {isFeatured && (
                      <Star className="w-3.5 h-3.5 text-brand-gold-700 fill-current" />
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Featured Homepage Product</span>
                </label>

                {/* Daily Special Toggle */}
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dailySpecial}
                    onChange={(e) => setDailySpecial(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-white border border-slate-200 peer-checked:border-amber-500 peer-checked:bg-amber-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                    {dailySpecial && (
                      <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Daily Special Product</span>
                </label>
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setCurrentProduct(null); }}
                  className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 hover:text-white text-xs font-semibold shadow-sm cursor-pointer border-none"
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
