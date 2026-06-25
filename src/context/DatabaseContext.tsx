import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as DEFAULT_PRODUCTS, GALLERY_ITEMS as DEFAULT_GALLERY_ITEMS, CATEGORIES as DEFAULT_CATEGORIES } from '../data';
import { INITIAL_ORDERS, INITIAL_SETTINGS } from '../admin/utils/mockData';

export interface UnifiedProduct {
  id: string;
  name: string;
  description: string;
  price: number | { piece?: number; halfKg?: number; oneKg?: number; single?: number };
  image: string;
  images?: string[]; // Multiple images support
  category: string;
  tags?: string[];
  isBestSeller?: boolean;
  isEggless?: boolean;
  status: 'Available' | 'Out of Stock' | 'Hidden';
  isFeatured?: boolean;
  displayPriority: number;
  isDeleted?: boolean; // Soft delete support
  createdDate: string;
  badge?: 'None' | 'Bestseller' | 'New Arrival';
  dailySpecial?: boolean;
  limitedStockCount?: number; // e.g. 5, undefined = unlimited
  publishDate?: string; // Scheduled publishing (YYYY-MM-DD)
  visibilityExpiryDate?: string; // Visibility timer (YYYY-MM-DD)
  weight?: string;
}

export interface UnifiedGalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  displayPriority: number;
  isDeleted?: boolean;
}

export interface UnifiedCategory {
  id: string;
  name: string;
  displayPriority: number;
}

export interface UnifiedOrder {
  id: string;
  customerName: string;
  phone: string;
  deliveryAddress?: string;
  orderedProduct: string; // Summary string for list
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  createdDate: string;
  items: {
    id: string;
    name: string;
    selectedWeight: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
}

export interface UnifiedBanner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  displayPriority: number;
  isActive: boolean;
  isPromotion?: boolean;
}

export interface UnifiedSettings {
  bakeryName: string;
  phone: string;
  whatsappNumber: string;
  storeAddress: string;
  deliveryCharge: number;
  instagramUrl: string;
  facebookUrl: string;
  businessHours: string;
  holidaySettings: string;
  emergencyDisableOrdering: boolean;
  isSliderEnabled: boolean;
}

export interface UnifiedHistoryLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface UnifiedOffer {
  id: string;
  title: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  description: string;
}

interface DatabaseContextType {
  products: UnifiedProduct[];
  gallery: UnifiedGalleryItem[];
  categories: UnifiedCategory[];
  orders: UnifiedOrder[];
  banners: UnifiedBanner[];
  settings: UnifiedSettings;
  history: UnifiedHistoryLog[];
  offers: UnifiedOffer[];
  
  // Product Operations
  saveProduct: (product: UnifiedProduct) => void;
  softDeleteProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  permanentlyDeleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  reorderProducts: (products: UnifiedProduct[]) => void;
  
  // Gallery Operations
  saveGalleryItem: (item: UnifiedGalleryItem) => void;
  softDeleteGalleryItem: (id: string) => void;
  restoreGalleryItem: (id: string) => void;
  permanentlyDeleteGalleryItem: (id: string) => void;
  reorderGallery: (gallery: UnifiedGalleryItem[]) => void;

  // Category Operations
  saveCategory: (category: UnifiedCategory) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: UnifiedCategory[]) => void;

  // Order Operations
  addOrder: (order: Omit<UnifiedOrder, 'id' | 'createdDate'>) => UnifiedOrder;
  updateOrderStatus: (id: string, status: UnifiedOrder['orderStatus']) => void;
  updateOrderPaymentStatus: (id: string, status: UnifiedOrder['paymentStatus']) => void;
  deleteOrder: (id: string) => void;

  // Banner Operations
  saveBanner: (banner: UnifiedBanner) => void;
  deleteBanner: (id: string) => void;
  reorderBanners: (banners: UnifiedBanner[]) => void;

  // Settings Operation
  updateSettings: (settings: UnifiedSettings) => void;

  // Offer Operations
  saveOffer: (offer: UnifiedOffer) => void;
  deleteOffer: (id: string) => void;
  
  // History Operations
  addHistoryLog: (action: string, details: string) => void;
  clearHistory: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [gallery, setGallery] = useState<UnifiedGalleryItem[]>([]);
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [banners, setBanners] = useState<UnifiedBanner[]>([]);
  const [settings, setSettings] = useState<UnifiedSettings>(INITIAL_SETTINGS as any);
  const [history, setHistory] = useState<UnifiedHistoryLog[]>([]);
  const [offers, setOffers] = useState<UnifiedOffer[]>([]);

  // Load and initialize data
  useEffect(() => {
    // 1. Load Products
    const localProducts = localStorage.getItem('admin_products');
    if (localProducts) {
      setProducts(JSON.parse(localProducts));
    } else {
      const initial = DEFAULT_PRODUCTS.map((p, idx) => ({
        ...p,
        status: 'Available' as const,
        isFeatured: p.isBestSeller,
        displayPriority: idx + 1,
        createdDate: new Date().toISOString().split('T')[0],
        badge: (p.isBestSeller ? 'Bestseller' : 'None') as any,
        images: [p.image]
      }));
      setProducts(initial);
      localStorage.setItem('admin_products', JSON.stringify(initial));
    }

    // 2. Load Gallery
    const localGallery = localStorage.getItem('admin_gallery');
    if (localGallery) {
      setGallery(JSON.parse(localGallery));
    } else {
      const initial = DEFAULT_GALLERY_ITEMS.map((item, idx) => ({
        ...item,
        displayPriority: idx + 1
      }));
      setGallery(initial);
      localStorage.setItem('admin_gallery', JSON.stringify(initial));
    }

    // 3. Load Categories
    const localCategories = localStorage.getItem('admin_categories');
    if (localCategories) {
      setCategories(JSON.parse(localCategories));
    } else {
      const initial = DEFAULT_CATEGORIES.map((cat, idx) => ({
        id: `cat-${idx + 1}`,
        name: cat,
        displayPriority: idx + 1
      }));
      setCategories(initial);
      localStorage.setItem('admin_categories', JSON.stringify(initial));
    }

    // 4. Load Orders
    const localOrders = localStorage.getItem('admin_orders');
    if (localOrders) {
      setOrders(JSON.parse(localOrders));
    } else {
      const initial: UnifiedOrder[] = INITIAL_ORDERS.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        phone: o.phone,
        deliveryAddress: o.deliveryAddress,
        orderedProduct: o.orderedProduct,
        amount: o.amount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus as any,
        orderStatus: o.orderStatus as any,
        createdDate: o.createdDate,
        items: [
          {
            id: `item-${Date.now()}`,
            name: o.orderedProduct,
            selectedWeight: 'Standard',
            price: o.amount / o.quantity,
            quantity: o.quantity
          }
        ]
      }));
      setOrders(initial);
      localStorage.setItem('admin_orders', JSON.stringify(initial));
    }

    // 5. Load Banners
    const localBanners = localStorage.getItem('admin_banners');
    if (localBanners) {
      setBanners(JSON.parse(localBanners));
    } else {
      const initial: UnifiedBanner[] = [
        {
          id: 'b-1',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
          title: 'Premium Custom Cakes',
          subtitle: 'Crafting edible masterpieces for your special days',
          displayPriority: 1,
          isActive: true
        },
        {
          id: 'b-2',
          image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=1200&q=80',
          title: 'Warm Puffs & Oven Savories',
          subtitle: 'Flaky baked layers served fresh every morning and evening',
          displayPriority: 2,
          isActive: true
        },
        {
          id: 'b-3',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
          title: 'Traditional Cookies & Breads',
          subtitle: 'Pure butter cookies and sweet milk breads baked with heritage recipes',
          displayPriority: 3,
          isActive: true
        }
      ];
      setBanners(initial);
      localStorage.setItem('admin_banners', JSON.stringify(initial));
    }

    // 6. Load Settings
    const localSettings = localStorage.getItem('admin_settings');
    if (localSettings) {
      setSettings(JSON.parse(localSettings));
    } else {
      const initial: UnifiedSettings = {
        bakeryName: 'M.G. Iyengar Bakery & Chats',
        phone: '+91 93455 86112',
        whatsappNumber: '+91 93455 86112',
        storeAddress: 'Mohanur Main Road, Mohanur, Namakkal, Tamil Nadu 637015',
        deliveryCharge: 30,
        instagramUrl: 'https://instagram.com',
        facebookUrl: 'https://facebook.com',
        businessHours: '9:00 AM - 10:00 PM',
        holidaySettings: 'Open all days including national holidays',
        emergencyDisableOrdering: false,
        isSliderEnabled: true
      };
      setSettings(initial);
      localStorage.setItem('admin_settings', JSON.stringify(initial));
    }

    // 7. Load History
    const localHistory = localStorage.getItem('admin_history');
    if (localHistory) setHistory(JSON.parse(localHistory));

    // 8. Load Offers
    const localOffers = localStorage.getItem('admin_offers');
    if (localOffers) {
      setOffers(JSON.parse(localOffers));
    } else {
      const initial: UnifiedOffer[] = [
        {
          id: 'o-1',
          title: 'Welcome Discount',
          code: 'WELCOME10',
          discountPercent: 10,
          isActive: true,
          description: 'Get 10% off on your first order placed via WhatsApp checkout.'
        },
        {
          id: 'o-2',
          title: 'Festive Saffron Treat',
          code: 'FESTIVE15',
          discountPercent: 15,
          isActive: false,
          description: 'Flat 15% discount on all premium fusion cakes (minimum purchase ₹800).'
        }
      ];
      setOffers(initial);
      localStorage.setItem('admin_offers', JSON.stringify(initial));
    }
  }, []);

  // Save utility
  const syncToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addHistoryLog = (action: string, details: string) => {
    const log: UnifiedHistoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };
    const updated = [log, ...history].slice(0, 150); // limit to 150 entries
    setHistory(updated);
    syncToLocal('admin_history', updated);
  };

  const clearHistory = () => {
    setHistory([]);
    syncToLocal('admin_history', []);
  };

  // --- PRODUCTS ---
  const saveProduct = (p: UnifiedProduct) => {
    let updated: UnifiedProduct[];
    const isEdit = products.some(item => item.id === p.id);
    
    if (isEdit) {
      const oldProduct = products.find(item => item.id === p.id)!;
      updated = products.map(item => item.id === p.id ? p : item);
      
      // Compute change details
      const changes: string[] = [];
      if (oldProduct.name !== p.name) changes.push(`Name: "${oldProduct.name}" ➔ "${p.name}"`);
      if (JSON.stringify(oldProduct.price) !== JSON.stringify(p.price)) {
        const oldP = typeof oldProduct.price === 'object' ? JSON.stringify(oldProduct.price) : `₹${oldProduct.price}`;
        const newP = typeof p.price === 'object' ? JSON.stringify(p.price) : `₹${p.price}`;
        changes.push(`Price: ${oldP} ➔ ${newP}`);
      }
      if (oldProduct.status !== p.status) changes.push(`Status: "${oldProduct.status}" ➔ "${p.status}"`);
      if (oldProduct.category !== p.category) changes.push(`Category: "${oldProduct.category}" ➔ "${p.category}"`);
      if (oldProduct.isFeatured !== p.isFeatured) changes.push(`Featured: ${oldProduct.isFeatured ? 'ON' : 'OFF'} ➔ ${p.isFeatured ? 'ON' : 'OFF'}`);
      
      addHistoryLog(
        `Updated Product: ${p.name}`,
        changes.length > 0 ? changes.join(' | ') : 'No functional changes made.'
      );
    } else {
      updated = [p, ...products];
      addHistoryLog(`Added Product: ${p.name}`, `Category: ${p.category} | Price: ${typeof p.price === 'object' ? 'Tiers' : '₹' + p.price}`);
    }

    setProducts(updated);
    syncToLocal('admin_products', updated);
  };

  const softDeleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const updated = products.map(p => p.id === id ? { ...p, isDeleted: true } : p);
    setProducts(updated);
    syncToLocal('admin_products', updated);
    addHistoryLog(`Moved to Trash: ${target.name}`, `Product ID: ${id}`);
  };

  const restoreProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const updated = products.map(p => p.id === id ? { ...p, isDeleted: false } : p);
    setProducts(updated);
    syncToLocal('admin_products', updated);
    addHistoryLog(`Restored Product: ${target.name}`, `Product ID: ${id}`);
  };

  const permanentlyDeleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    syncToLocal('admin_products', updated);
    addHistoryLog(`Deleted Permanently: ${target.name}`, `Product ID: ${id}`);
  };

  const duplicateProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const clone: UnifiedProduct = {
      ...target,
      id: `p-${Date.now()}`,
      name: `${target.name} (Copy)`,
      displayPriority: products.length + 1,
      createdDate: new Date().toISOString().split('T')[0]
    };
    const updated = [clone, ...products];
    setProducts(updated);
    syncToLocal('admin_products', updated);
    addHistoryLog(`Duplicated Product: ${target.name}`, `New Copy: ${clone.name}`);
  };

  const reorderProducts = (reordered: UnifiedProduct[]) => {
    const mapped = products.map(item => {
      const matchIndex = reordered.findIndex(r => r.id === item.id);
      if (matchIndex !== -1) {
        return { ...item, displayPriority: matchIndex + 1 };
      }
      return item;
    });
    setProducts(mapped);
    syncToLocal('admin_products', mapped);
    addHistoryLog('Reordered Products Catalog', 'Rearranged display sequence of catalog items.');
  };

  // --- GALLERY ---
  const saveGalleryItem = (item: UnifiedGalleryItem) => {
    let updated: UnifiedGalleryItem[];
    const isEdit = gallery.some(g => g.id === item.id);
    if (isEdit) {
      updated = gallery.map(g => g.id === item.id ? item : g);
      addHistoryLog(`Updated Gallery Item: ${item.title}`, `Category: ${item.category}`);
    } else {
      updated = [item, ...gallery];
      addHistoryLog(`Uploaded Gallery Image: ${item.title}`, `Category: ${item.category}`);
    }
    setGallery(updated);
    syncToLocal('admin_gallery', updated);
  };

  const softDeleteGalleryItem = (id: string) => {
    const target = gallery.find(g => g.id === id);
    if (!target) return;
    const updated = gallery.map(g => g.id === id ? { ...g, isDeleted: true } : g);
    setGallery(updated);
    syncToLocal('admin_gallery', updated);
    addHistoryLog(`Moved Gallery Item to Trash: ${target.title}`, `ID: ${id}`);
  };

  const restoreGalleryItem = (id: string) => {
    const target = gallery.find(g => g.id === id);
    if (!target) return;
    const updated = gallery.map(g => g.id === id ? { ...g, isDeleted: false } : g);
    setGallery(updated);
    syncToLocal('admin_gallery', updated);
    addHistoryLog(`Restored Gallery Item: ${target.title}`, `ID: ${id}`);
  };

  const permanentlyDeleteGalleryItem = (id: string) => {
    const target = gallery.find(g => g.id === id);
    if (!target) return;
    const updated = gallery.filter(g => g.id !== id);
    setGallery(updated);
    syncToLocal('admin_gallery', updated);
    addHistoryLog(`Deleted Gallery Image permanently: ${target.title}`, `ID: ${id}`);
  };

  const reorderGallery = (reordered: UnifiedGalleryItem[]) => {
    const mapped = gallery.map(item => {
      const matchIndex = reordered.findIndex(r => r.id === item.id);
      if (matchIndex !== -1) {
        return { ...item, displayPriority: matchIndex + 1 };
      }
      return item;
    });
    setGallery(mapped);
    syncToLocal('admin_gallery', mapped);
    addHistoryLog('Reordered Gallery Showcases', 'Rearranged display sequence.');
  };

  // --- CATEGORIES ---
  const saveCategory = (cat: UnifiedCategory) => {
    let updated: UnifiedCategory[];
    const isEdit = categories.some(item => item.id === cat.id);
    if (isEdit) {
      updated = categories.map(item => item.id === cat.id ? cat : item);
      addHistoryLog(`Updated Category: ${cat.name}`, `ID: ${cat.id}`);
    } else {
      updated = [...categories, cat];
      addHistoryLog(`Added Category: ${cat.name}`, `ID: ${cat.id}`);
    }
    setCategories(updated);
    syncToLocal('admin_categories', updated);
  };

  const deleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    syncToLocal('admin_categories', updated);
    addHistoryLog(`Deleted Category: ${target.name}`, `ID: ${id}`);
  };

  const reorderCategories = (reordered: UnifiedCategory[]) => {
    const mapped = categories.map(item => {
      const matchIndex = reordered.findIndex(r => r.id === item.id);
      if (matchIndex !== -1) {
        return { ...item, displayPriority: matchIndex + 1 };
      }
      return item;
    });
    setCategories(mapped);
    syncToLocal('admin_categories', mapped);
  };

  // --- ORDERS ---
  const addOrder = (o: Omit<UnifiedOrder, 'id' | 'createdDate'>): UnifiedOrder => {
    const newOrder: UnifiedOrder = {
      ...o,
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdDate: new Date().toISOString()
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    syncToLocal('admin_orders', updated);
    addHistoryLog(`New Order Received: ${newOrder.id}`, `Customer: ${newOrder.customerName} | Amount: ₹${newOrder.amount}`);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: UnifiedOrder['orderStatus']) => {
    const updated = orders.map(item => {
      if (item.id === id) {
        const paymentStatus = status === 'Delivered' ? 'Paid' as const : item.paymentStatus;
        return { ...item, orderStatus: status, paymentStatus };
      }
      return item;
    });
    setOrders(updated);
    syncToLocal('admin_orders', updated);
    addHistoryLog(`Updated Order Status: ${id}`, `New Status: ${status}`);
  };

  const updateOrderPaymentStatus = (id: string, status: UnifiedOrder['paymentStatus']) => {
    const updated = orders.map(item => item.id === id ? { ...item, paymentStatus: status } : item);
    setOrders(updated);
    syncToLocal('admin_orders', updated);
    addHistoryLog(`Updated Order Payment Status: ${id}`, `Payment Status: ${status}`);
  };

  const deleteOrder = (id: string) => {
    const updated = orders.filter(item => item.id !== id);
    setOrders(updated);
    syncToLocal('admin_orders', updated);
    addHistoryLog(`Removed Order Archive: ${id}`, `ID: ${id}`);
  };

  // --- BANNERS ---
  const saveBanner = (b: UnifiedBanner) => {
    let updated: UnifiedBanner[];
    const isEdit = banners.some(item => item.id === b.id);
    if (isEdit) {
      updated = banners.map(item => item.id === b.id ? b : item);
      addHistoryLog(`Updated Homepage Banner: ${b.title || 'Untitled'}`, `Active: ${b.isActive ? 'Yes' : 'No'}`);
    } else {
      updated = [...banners, b];
      addHistoryLog(`Added Homepage Banner: ${b.title || 'Untitled'}`, `Active: ${b.isActive ? 'Yes' : 'No'}`);
    }
    setBanners(updated);
    syncToLocal('admin_banners', updated);
  };

  const deleteBanner = (id: string) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    syncToLocal('admin_banners', updated);
    addHistoryLog('Deleted Homepage Banner', `Banner ID: ${id}`);
  };

  const reorderBanners = (reordered: UnifiedBanner[]) => {
    const mapped = banners.map(item => {
      const matchIndex = reordered.findIndex(r => r.id === item.id);
      if (matchIndex !== -1) {
        return { ...item, displayPriority: matchIndex + 1 };
      }
      return item;
    });
    setBanners(mapped);
    syncToLocal('admin_banners', mapped);
  };

  // --- SETTINGS ---
  const updateSettings = (s: UnifiedSettings) => {
    setSettings(s);
    syncToLocal('admin_settings', s);
    addHistoryLog('Updated Bakery Settings', 'Configuration details updated.');
  };

  // --- OFFERS ---
  const saveOffer = (o: UnifiedOffer) => {
    let updated: UnifiedOffer[];
    const isEdit = offers.some(item => item.id === o.id);
    if (isEdit) {
      updated = offers.map(item => item.id === o.id ? o : item);
      addHistoryLog(`Updated Promo Offer: ${o.title}`, `Code: ${o.code} | ${o.discountPercent}%`);
    } else {
      updated = [...offers, o];
      addHistoryLog(`Added Promo Offer: ${o.title}`, `Code: ${o.code} | ${o.discountPercent}%`);
    }
    setOffers(updated);
    syncToLocal('admin_offers', updated);
  };

  const deleteOffer = (id: string) => {
    const target = offers.find(o => o.id === id);
    if (!target) return;
    const updated = offers.filter(o => o.id !== id);
    setOffers(updated);
    syncToLocal('admin_offers', updated);
    addHistoryLog(`Deleted Promo Offer: ${target.title}`, `Code: ${target.code}`);
  };

  return (
    <DatabaseContext.Provider
      value={{
        products,
        gallery,
        categories,
        orders,
        banners,
        settings,
        history,
        offers,
        
        saveProduct,
        softDeleteProduct,
        restoreProduct,
        permanentlyDeleteProduct,
        duplicateProduct,
        reorderProducts,
        
        saveGalleryItem,
        softDeleteGalleryItem,
        restoreGalleryItem,
        permanentlyDeleteGalleryItem,
        reorderGallery,

        saveCategory,
        deleteCategory,
        reorderCategories,

        addOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        deleteOrder,

        saveBanner,
        deleteBanner,
        reorderBanners,

        updateSettings,

        saveOffer,
        deleteOffer,
        
        addHistoryLog,
        clearHistory
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useBakeryDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useBakeryDatabase must be used within a DatabaseProvider');
  }
  return context;
};
