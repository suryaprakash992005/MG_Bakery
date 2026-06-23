import React, { useState } from 'react';
import { useAdminState } from '../hooks/useAdminState';
import { AdminProduct } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  PackageCheck,
  PackageX,
  X,
  Clock,
  Scale,
  Cake,
  FolderOpen
} from 'lucide-react';


export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AdminProduct | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('Cakes');
  const [prepTime, setPrepTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState('');

  // Extract all categories dynamically + 'All'
  const categoriesList = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setPrice(350);
    setWeight('0.5 Kg');
    setCategory('Cakes');
    setPrepTime('3 hours');
    setIsAvailable(true);
    setImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: AdminProduct) => {
    setCurrentProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setWeight(p.weight);
    setCategory(p.category);
    setPrepTime(p.prepTime);
    setIsAvailable(p.isAvailable);
    setImage(p.image);
    setIsEditOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    addProduct({
      name,
      description,
      price: Number(price),
      weight,
      category,
      prepTime,
      isAvailable,
      image: image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    });
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !name || !price || !category) return;
    updateProduct({
      ...currentProduct,
      name,
      description,
      price: Number(price),
      weight,
      category,
      prepTime,
      isAvailable,
      image
    });
    setIsEditOpen(false);
    setCurrentProduct(null);
  };

  const handleToggleAvailability = (p: AdminProduct) => {
    updateProduct({
      ...p,
      isAvailable: !p.isAvailable
    });
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
    <div className="space-y-6 select-none">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-slate-800">Inventory Catalog</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage cakes, pastries, puffs, breads, and beverages</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 font-semibold text-xs px-5 py-3 rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 transform active:scale-95 cursor-pointer hover:text-white"
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
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-full py-2 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all focus:bg-white"
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
                <th className="py-4 px-6 w-20">Image</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Weight</th>
                <th className="py-4 px-6">Prep Time</th>
                <th className="py-4 px-6 text-center">Availability</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/20 transition-colors">
                    
                    {/* Product Image with hover zoom */}
                    <td className="py-3.5 px-6">
                      <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 shadow-sm relative group">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                    </td>

                    {/* Name & description */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold text-sm leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400 max-w-[220px] truncate mt-1 font-light leading-normal" title={p.description}>
                          {p.description || 'No description added.'}
                        </span>
                      </div>
                    </td>

                    {/* Category pill */}
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getCategoryColor(p.category)}`}>
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      ₹{p.price}
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-6 font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3 text-slate-300" />
                        <span>{p.weight || 'N/A'}</span>
                      </span>
                    </td>

                    {/* Prep time */}
                    <td className="py-3.5 px-6 text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{p.prepTime || 'Instant'}</span>
                      </span>
                    </td>

                    {/* Availability toggle */}
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          p.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/50'
                            : 'bg-rose-50 text-red-700 border-rose-200/80 hover:bg-red-100/50'
                        }`}
                        title={p.isAvailable ? 'Click to Mark Out of Stock' : 'Click to Mark Available'}
                      >
                        {p.isAvailable ? (
                          <>
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <PackageX className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions dropdown/buttons */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-gold-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center text-slate-400 font-medium">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                    <span>No products found matching filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-brand-gold-600" />
                <h3 className="font-playfair text-lg font-bold text-slate-800">Add New Cake & Product</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Product Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /assets/..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cake/Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cake/Product Name</label>
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  >
                    {['Cakes', 'Pastries', 'Cookies', 'Puffs', 'Breads', 'Snacks', 'Beverages'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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

                {/* Prep Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="E.g. 3 hours, 1 day"
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
                  rows={3}
                  placeholder="Details about flavor layers, ingredients, toppings, allergens, etc."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-slate-100 border border-slate-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                    {isAvailable && (
                      <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Mark Immediately Available</span>
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
                  className="px-5 py-2.5 rounded-full bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 hover:text-white text-xs font-semibold shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-gold-600" />
                <h3 className="font-playfair text-lg font-bold text-slate-800">Edit Product: {currentProduct.name}</h3>
              </div>
              <button onClick={() => { setIsEditOpen(false); setCurrentProduct(null); }} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Product Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Product Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /assets/..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cake/Product Name */}
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                  >
                    {['Cakes', 'Pastries', 'Cookies', 'Puffs', 'Breads', 'Snacks', 'Beverages'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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

                {/* Prep Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="E.g. 3 hours, 1 day"
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
                  rows={3}
                  placeholder="Details about flavor layers, ingredients, toppings, allergens, etc."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition-all focus:bg-white"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-slate-100 border border-slate-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                    {isAvailable && (
                      <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Product Available in Stock</span>
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
                  className="px-5 py-2.5 rounded-full bg-[#1A1110] text-[#F3EDE2] hover:bg-brand-brown-900 hover:text-white text-xs font-semibold shadow-sm cursor-pointer"
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
