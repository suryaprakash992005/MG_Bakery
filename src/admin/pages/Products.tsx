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
  Copy, 
  RotateCcw,
  Move
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
  const [priceType, setPriceType] = useState<'flat' | 'multi'>('flat');
  const [flatPrice, setFlatPrice] = useState(0);
  const [flatWeight, setFlatWeight] = useState('');
  
  // Multi-weight price states
  const [slicePrice, setSlicePrice] = useState('');
  const [halfKgPrice, setHalfKgPrice] = useState('');
  const [oneKgPrice, setOneKgPrice] = useState('');

  const [category, setCategory] = useState('Cakes');
  const [status, setStatus] = useState<UnifiedProduct['status']>('Available');
  const [image, setImage] = useState('');
  const [displayPriority, setDisplayPriority] = useState(1);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Extract active and deleted products
  const products = allProducts.filter(p => !p.isDeleted);
  const trashProducts = allProducts.filter(p => p.isDeleted);

  // Extract all categories list dynamically
  const categoriesList = ['All', ...categories.map(c => c.name)];

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setPriceType('flat');
    setFlatPrice(350);
    setFlatWeight('0.5 Kg');
    setSlicePrice('');
    setHalfKgPrice('');
    setOneKgPrice('');
    setCategory(categories[0]?.name || 'Cakes');
    setStatus('Available');
    setImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80');
    setDisplayPriority(products.length + 1);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: UnifiedProduct) => {
    setCurrentProduct(p);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category);
    setStatus(p.status);
    setImage(p.image);
    setDisplayPriority(p.displayPriority || 99);

    if (typeof p.price === 'object') {
      setPriceType('multi');
      setFlatPrice(0);
      setFlatWeight('');
      const priceObj = p.price as any;
      setSlicePrice(priceObj.piece ? String(priceObj.piece) : '');
      setHalfKgPrice(priceObj.halfKg ? String(priceObj.halfKg) : '');
      setOneKgPrice(priceObj.oneKg ? String(priceObj.oneKg) : '');
    } else {
      setPriceType('flat');
      setFlatPrice(p.price || 0);
      setFlatWeight(p.weight || '');
      setSlicePrice('');
      setHalfKgPrice('');
      setOneKgPrice('');
    }
    setIsEditOpen(true);
  };

  const constructPriceObject = () => {
    if (priceType === 'flat') {
      return Number(flatPrice);
    } else {
      return {
        piece: slicePrice ? Number(slicePrice) : undefined,
        halfKg: halfKgPrice ? Number(halfKgPrice) : undefined,
        oneKg: oneKgPrice ? Number(oneKgPrice) : undefined
      };
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    
    saveProduct({
      id: `p-${Date.now()}`,
      name,
      description,
      price: constructPriceObject(),
      weight: priceType === 'flat' ? flatWeight : undefined,
      category,
      image,
      images: [image],
      status,
      displayPriority: Number(displayPriority) || products.length + 1,
      isFeatured: true,
      dailySpecial: false,
      badge: 'None',
      createdDate: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !name || !category) return;

    saveProduct({
      ...currentProduct,
      name,
      description,
      price: constructPriceObject(),
      weight: priceType === 'flat' ? flatWeight : undefined,
      category,
      image,
      images: currentProduct.images && currentProduct.images.length > 0 ? [image, ...currentProduct.images.slice(1)] : [image],
      status,
      displayPriority: Number(displayPriority)
    });
    setIsEditOpen(false);
    setCurrentProduct(null);
  };

  // Drag and drop sorting handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const itemToMove = filteredProducts[draggedIndex];
    const newItems = [...filteredProducts];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, itemToMove);

    // Update priorities
    const updated = allProducts.map(p => {
      const idxInNew = newItems.findIndex(ni => ni.id === p.id);
      if (idxInNew !== -1) {
        return { ...p, displayPriority: idxInNew + 1 };
      }
      return p;
    });

    reorderProducts(updated);
    setDraggedIndex(null);
  };

  // Filter products by search and category selection
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => (a.displayPriority || 99) - (b.displayPriority || 99));

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#2C1A17]/10 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2C1A17]">Products Management</h2>
          <p className="text-xs text-[#2C1A17]/65 mt-1">Add, edit, change prices, set weights, and toggle availability of your cakes and snacks.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-gold-850 hover:bg-brand-gold-700 text-[#1E110F] font-bold text-xs rounded-xl shadow-sm transition-all border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#2C1A17]/10 p-4 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-gold-850 text-[#1E110F] border-brand-gold-500 font-bold'
                  : 'bg-[#FAF6F0] hover:bg-[#FAF6F0]/80 text-[#2C1A17] border-[#2C1A17]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p, idx) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className="bg-white border border-[#2C1A17]/10 rounded-2xl overflow-hidden hover:shadow-[0_12px_28px_rgba(44,26,23,0.06)] transition-all flex flex-col relative group cursor-grab active:cursor-grabbing"
            >
              {/* Product Image */}
              <div className="h-44 w-full bg-[#FAF6F0] relative overflow-hidden shrink-0 border-b border-[#2C1A17]/5">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Drag Handle Overlay */}
                <div className="absolute top-2 left-2 bg-[#1E110F]/70 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Move className="w-3.5 h-3.5" />
                </div>

                {/* Stock Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full tracking-wider uppercase shadow-sm border ${
                    p.status === 'Available' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                      : p.status === 'Out of Stock' 
                      ? 'bg-amber-50 text-amber-800 border-amber-250'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {p.status}
                  </span>
                </div>

                {/* Category tag */}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-brand-gold-850/90 text-[#1E110F] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-playfair font-bold text-[#2C1A17] text-base line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-[#2C1A17]/65 mt-1 leading-normal line-clamp-2 h-8">
                    {p.description || 'No description added.'}
                  </p>

                  {/* Price display section */}
                  <div className="mt-3 bg-[#FAF6F0]/60 border border-[#2C1A17]/5 rounded-xl p-2.5 space-y-1.5">
                    {typeof p.price === 'number' ? (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#2C1A17]/50 font-medium">{p.weight || 'Standard Size'}</span>
                        <span className="font-bold text-[#2C1A17] text-sm">₹{p.price}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-brand-gold-800 uppercase block tracking-wider">Weight Pricing</span>
                        {p.price.piece !== undefined && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-[#2C1A17]/60">Slice</span>
                            <span className="font-bold text-[#2C1A17]">₹{p.price.piece}</span>
                          </div>
                        )}
                        {p.price.halfKg !== undefined && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-[#2C1A17]/60">½ Kg</span>
                            <span className="font-bold text-[#2C1A17]">₹{p.price.halfKg}</span>
                          </div>
                        )}
                        {p.price.oneKg !== undefined && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-[#2C1A17]/60">1 Kg</span>
                            <span className="font-bold text-[#2C1A17]">₹{p.price.oneKg}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-[#2C1A17]/5 justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2C1A17]/10 text-[#2C1A17] hover:bg-[#1E110F]/5 text-xs font-bold cursor-pointer transition-all bg-white"
                      title="Edit Product"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-gold-800" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => duplicateProduct(p.id)}
                      className="p-1.5 rounded-lg border border-[#2C1A17]/10 text-[#2C1A17]/70 hover:bg-[#1E110F]/5 cursor-pointer bg-white"
                      title="Duplicate Product"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => softDeleteProduct(p.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2C1A17]/10 text-red-650 hover:bg-red-50 hover:border-red-200 text-xs font-bold cursor-pointer transition-all bg-white"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 bg-white border border-[#2C1A17]/10 rounded-2xl text-center text-[#2C1A17]/40 font-medium">
            <Cake className="w-12 h-12 mx-auto text-[#2C1A17]/20 mb-2" />
            <span>No products found matching filters.</span>
          </div>
        )}
      </div>

      {/* --- TRASH / SOFT DELETE LOG DRAWER --- */}
      {trashProducts.length > 0 && (
        <div className="bg-[#FAF6F0] border border-[#2C1A17]/10 rounded-2xl p-6 shadow-inner space-y-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Deleted Products (Trashbin)</h3>
            <span className="text-[10px] bg-red-50 text-red-800 font-bold px-2 py-0.5 rounded-full">{trashProducts.length} Items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trashProducts.map(p => (
              <div key={p.id} className="bg-white border border-[#2C1A17]/5 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-[#2C1A17]/10" />
                  <div>
                    <h4 className="font-playfair font-bold text-xs text-[#2C1A17]">{p.name}</h4>
                    <span className="text-[10px] text-[#2C1A17]/50">{p.category}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => restoreProduct(p.id)}
                    className="p-1.5 border border-[#2C1A17]/10 text-[#2C1A17]/70 hover:bg-[#1E110F]/5 rounded-lg cursor-pointer bg-white"
                    title="Restore"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Permanently purge "${p.name}"? This cannot be undone.`)) {
                        permanentlyDeleteProduct(p.id);
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

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#2C1A17]/10 flex flex-col my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#2C1A17]/5 flex justify-between items-center bg-[#FAF6F0]">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-brand-gold-700" />
                <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Add New Product</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-650 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Product Showcase Photo" 
                bucket="products"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Special White Forest"
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none transition-all"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Options Toggle */}
              <div className="space-y-2 bg-[#FAF6F0]/50 border border-[#2C1A17]/5 rounded-xl p-4">
                <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Pricing & Weight Settings</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-xs font-semibold text-[#2C1A17] cursor-pointer">
                    <input
                      type="radio"
                      name="priceTypeAdd"
                      checked={priceType === 'flat'}
                      onChange={() => setPriceType('flat')}
                      className="mr-1.5 accent-brand-gold-800"
                    />
                    <span>Single Flat Price (Pastries/Snacks)</span>
                  </label>
                  <label className="flex items-center text-xs font-semibold text-[#2C1A17] cursor-pointer">
                    <input
                      type="radio"
                      name="priceTypeAdd"
                      checked={priceType === 'multi'}
                      onChange={() => setPriceType('multi')}
                      className="mr-1.5 accent-brand-gold-800"
                    />
                    <span>Multi-Weight Prices (Cakes)</span>
                  </label>
                </div>

                {priceType === 'flat' ? (
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#2C1A17]/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">Price (₹)</span>
                      <input
                        type="number"
                        required={priceType === 'flat'}
                        min={0}
                        value={flatPrice}
                        onChange={(e) => setFlatPrice(Number(e.target.value))}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">Weight / Unit</span>
                      <input
                        type="text"
                        value={flatWeight}
                        onChange={(e) => setFlatWeight(e.target.value)}
                        placeholder="E.g. Single Piece, 1 Box"
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#2C1A17]/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">Slice Price (₹)</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="N/A"
                        value={slicePrice}
                        onChange={(e) => setSlicePrice(e.target.value)}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">½ Kg Price (₹)</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="N/A"
                        value={halfKgPrice}
                        onChange={(e) => setHalfKgPrice(e.target.value)}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">1 Kg Price (₹)</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="N/A"
                        value={oneKgPrice}
                        onChange={(e) => setOneKgPrice(e.target.value)}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Availability Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Available">Available (Visible on Site)</option>
                    <option value="Out of Stock">Out of Stock (Shows Sold Out)</option>
                    <option value="Hidden">Hidden (Invisible)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Display Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={displayPriority}
                    onChange={(e) => setDisplayPriority(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ingredients, details, toppings, allergens, flavor layers, etc."
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3.5 text-xs focus:outline-none leading-normal"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#2C1A17]/10 hover:bg-[#1E110F]/5 text-[#2C1A17] text-xs font-semibold cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E110F] text-[#F3EDE2] hover:bg-brand-brown-900 text-xs font-semibold border-none cursor-pointer shadow-sm"
                >
                  Create Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditOpen && currentProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#2C1A17]/10 flex flex-col my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#2C1A17]/5 flex justify-between items-center bg-[#FAF6F0]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-gold-700" />
                <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Edit Product: {name}</h3>
              </div>
              <button onClick={() => { setIsEditOpen(false); setCurrentProduct(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 hover:text-slate-650 cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              
              <ImageUploader 
                value={image} 
                onChange={setImage} 
                label="Product Showcase Photo" 
                bucket="products"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Special White Forest"
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Options Toggle */}
              <div className="space-y-2 bg-[#FAF6F0]/50 border border-[#2C1A17]/5 rounded-xl p-4">
                <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Pricing & Weight Settings</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-xs font-semibold text-[#2C1A17] cursor-pointer">
                    <input
                      type="radio"
                      name="priceTypeEdit"
                      checked={priceType === 'flat'}
                      onChange={() => setPriceType('flat')}
                      className="mr-1.5 accent-brand-gold-800"
                    />
                    <span>Single Flat Price (Pastries/Snacks)</span>
                  </label>
                  <label className="flex items-center text-xs font-semibold text-[#2C1A17] cursor-pointer">
                    <input
                      type="radio"
                      name="priceTypeEdit"
                      checked={priceType === 'multi'}
                      onChange={() => setPriceType('multi')}
                      className="mr-1.5 accent-brand-gold-800"
                    />
                    <span>Multi-Weight Prices (Cakes)</span>
                  </label>
                </div>

                {priceType === 'flat' ? (
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#2C1A17]/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">Price (₹)</span>
                      <input
                        type="number"
                        required={priceType === 'flat'}
                        min={0}
                        value={flatPrice}
                        onChange={(e) => setFlatPrice(Number(e.target.value))}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">Weight / Unit</span>
                      <input
                        type="text"
                        value={flatWeight}
                        onChange={(e) => setFlatWeight(e.target.value)}
                        placeholder="E.g. Single Piece, 1 Box"
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#2C1A17]/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">Slice Price (₹)</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="N/A"
                        value={slicePrice}
                        onChange={(e) => setSlicePrice(e.target.value)}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">½ Kg Price (₹)</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="N/A"
                        value={halfKgPrice}
                        onChange={(e) => setHalfKgPrice(e.target.value)}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-2.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#2C1A17]/60 block uppercase">1 Kg Price (₹)</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="N/A"
                        value={oneKgPrice}
                        onChange={(e) => setOneKgPrice(e.target.value)}
                        className="w-full bg-white border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Availability Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Available">Available (Visible on Site)</option>
                    <option value="Out of Stock">Out of Stock (Shows Sold Out)</option>
                    <option value="Hidden">Hidden (Invisible)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Display Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={displayPriority}
                    onChange={(e) => setDisplayPriority(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ingredients, details, toppings, allergens, flavor layers, etc."
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2 px-3.5 text-xs focus:outline-none leading-normal"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setCurrentProduct(null); }}
                  className="px-5 py-2.5 rounded-xl border border-[#2C1A17]/10 hover:bg-[#1E110F]/5 text-[#2C1A17] text-xs font-semibold cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E110F] text-[#F3EDE2] hover:bg-brand-brown-900 text-xs font-semibold border-none cursor-pointer shadow-sm"
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
