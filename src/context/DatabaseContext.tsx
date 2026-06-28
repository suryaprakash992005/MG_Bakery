import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data';
import { INITIAL_SETTINGS } from '../admin/utils/mockData';
import { supabase } from '../utils/supabase';

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
  status: 'Available' |
   'Out of Stock' | 'Hidden';
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
  customerId?: string;
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
  featured_product_name?: string;
  cta_text?: string;
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
  openingTime?: string;
  closingTime?: string;
  googleMapsLink?: string;
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
  saveProduct: (product: UnifiedProduct) => void | Promise<void>;
  softDeleteProduct: (id: string) => void | Promise<void>;
  restoreProduct: (id: string) => void | Promise<void>;
  permanentlyDeleteProduct: (id: string) => void | Promise<void>;
  duplicateProduct: (id: string) => void;
  reorderProducts: (products: UnifiedProduct[]) => void;
  
  // Gallery Operations
  saveGalleryItem: (item: UnifiedGalleryItem) => void | Promise<void>;
  softDeleteGalleryItem: (id: string) => void | Promise<void>;
  restoreGalleryItem: (id: string) => void | Promise<void>;
  permanentlyDeleteGalleryItem: (id: string) => void | Promise<void>;
  reorderGallery: (gallery: UnifiedGalleryItem[]) => void | Promise<void>;

  // Category Operations
  saveCategory: (category: UnifiedCategory) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: UnifiedCategory[]) => void;

  // Order Operations
  addOrder: (order: Omit<UnifiedOrder, 'id' | 'createdDate'>) => Promise<UnifiedOrder>;
  updateOrderStatus: (id: string, status: UnifiedOrder['orderStatus']) => void;
  updateOrderPaymentStatus: (id: string, status: UnifiedOrder['paymentStatus']) => void;
  deleteOrder: (id: string) => void;
  fetchSupabaseOrders: () => Promise<void>;

  // Banner Operations
  saveBanner: (banner: UnifiedBanner) => void | Promise<void>;
  deleteBanner: (id: string) => void | Promise<void>;
  reorderBanners: (banners: UnifiedBanner[]) => void | Promise<void>;

  // Settings Operation
  updateSettings: (settings: UnifiedSettings) => void | Promise<void>;

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

  const fetchSupabaseProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        return;
      }

      if (data) {
        const mapped: UnifiedProduct[] = data.map((row: any) => {
          const hasMultiWeight = row.half_kg !== null || row.one_kg !== null;
          const priceVal = hasMultiWeight
            ? {
                piece: row.price !== null && row.price !== undefined ? Number(row.price) : undefined,
                halfKg: row.half_kg !== null && row.half_kg !== undefined ? Number(row.half_kg) : undefined,
                oneKg: row.one_kg !== null && row.one_kg !== undefined ? Number(row.one_kg) : undefined
              }
            : Number(row.price || 0);

          return {
            id: String(row.id),
            name: row.name,
            description: row.description || '',
            price: priceVal,
            image: row.image_url || '',
            images: row.image_url ? [row.image_url] : [],
            category: row.category,
            status: 'Available',
            displayPriority: 1,
            createdDate: row.created_at || new Date().toISOString().split('T')[0]
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Gallery fetch error:', error);
        return;
      }

      if (data) {
        const mapped: UnifiedGalleryItem[] = data.map((row: any) => ({
          id: String(row.id),
          title: row.title || '',
          category: row.category || '',
          image: row.image_url || '',
          displayPriority: Number(row.priority || 1),
          isDeleted: false
        }));
        setGallery(mapped);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    }
  };

  const fetchSupabaseOrders = async () => {
    try {
      // Phase 6: Check auth session to resolve 401 console issues for anonymous storefront guests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setOrders([]);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, profiles(full_name, phone)')
        .order('created_at', { ascending: false });

      if (ordersError) {
        // Phase 7: Add console error logging for debugging
        console.error("Order fetch failed:", ordersError);
        return;
      }

      if (ordersData) {
        const mapped: UnifiedOrder[] = ordersData.map((order: any) => {
          const custName = order.profiles?.full_name || 'Guest Customer';
          const custPhone = order.profiles?.phone || 'N/A';
          return {
            id: order.id,
            customerId: order.customer_id,
            customerName: custName,
            phone: custPhone,
            deliveryAddress: 'Store Pickup',
            orderedProduct: order.product_name,
            amount: Number(order.amount),
            paymentMethod: 'UPI / Offline',
            paymentStatus: order.status === 'Delivered' ? 'Paid' : 'Pending',
            orderStatus: order.status as any,
            createdDate: order.created_at,
            items: [
              {
                id: `item-${order.id}`,
                name: order.product_name,
                selectedWeight: 'Standard',
                price: Number(order.amount),
                quantity: 1
              }
            ]
          };
        });
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading Supabase orders:', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('priority', { ascending: true });

      if (error) {
        console.error('Banners fetch error:', error);
        return;
      }

      if (data) {
        const mapped: UnifiedBanner[] = data.map((row: any) => ({
          id: String(row.id),
          image: row.image_url || '',
          title: row.title || '',
          subtitle: row.subtitle || '',
          displayPriority: Number(row.priority || 1),
          isActive: Boolean(row.is_active),
          featured_product_name: row.featured_product_name || '',
          cta_text: row.cta_text || ''
        }));
        setBanners(mapped);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No settings row found. Seeding default settings...');
          const defaultSettings = {
            id: 1,
            bakery_name: 'M.G. Iyengar Bakery & Chats',
            address: 'Mohanur Main Road, Mohanur, Namakkal, Tamil Nadu 637015',
            maps_link: 'https://www.google.com/maps/place/M.G.Bakery+%26+Chat+Corner/@11.0619375,78.1353626,822m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3baa325f5d753c31:0x56b31f2893f85974!8m2!3d11.0619375!4d78.1379375!16s%2Fg%2F11f13psx14?hl=en&entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D',
            opening_time: '9:00 AM',
            closing_time: '10:00 PM',
            whatsapp: '+91 93455 86112',
            instagram: 'https://instagram.com'
          };
          const { error: insertError } = await supabase
            .from('settings')
            .insert([defaultSettings]);
          if (insertError) {
            console.error('Error seeding default settings in Supabase:', insertError);
          } else {
            console.log('Seeded default settings in Supabase.');
            await fetchSettings();
          }
          return;
        }
        console.error('Error fetching settings from Supabase:', error);
        return;
      }

      if (data) {
        setSettings({
          bakeryName: data.bakery_name || 'M.G. Iyengar Bakery & Chats',
          whatsappNumber: data.whatsapp || '+91 93455 86112',
          storeAddress: data.address || 'Mohanur Main Road, Mohanur, Namakkal, Tamil Nadu 637015',
          openingTime: data.opening_time || '9:00 AM',
          closingTime: data.closing_time || '10:00 PM',
          googleMapsLink: data.maps_link || 'https://www.google.com/maps/place/M.G.Bakery+%26+Chat+Corner/@11.0619375,78.1353626,822m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3baa325f5d753c31:0x56b31f2893f85974!8m2!3d11.0619375!4d78.1379375!16s%2Fg%2F11f13psx14?hl=en&entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D',
          instagramUrl: data.instagram || 'https://instagram.com',
          phone: data.whatsapp || '+91 93455 86112',
          deliveryCharge: 30,
          facebookUrl: 'https://facebook.com',
          businessHours: `${data.opening_time || '9:00 AM'} - ${data.closing_time || '10:00 PM'}`,
          holidaySettings: 'Open all days including national holidays',
          emergencyDisableOrdering: false,
          isSliderEnabled: true
        });
      }
    } catch (err) {
      console.error('Error in fetchSettings:', err);
    }
  };

  // Load and initialize data
  useEffect(() => {
    // 1. Load Products from Supabase
    fetchSupabaseProducts();

    // 2. Load Gallery from Supabase
    fetchGallery();

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

    // 4. Load Orders from Supabase & Subscribe to Realtime Updates
    fetchSupabaseOrders();
    const ordersChannel = supabase
      .channel('orders-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSupabaseOrders();
      })
      .subscribe();

    // Listen for auth session updates to fetch/clear orders dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchSupabaseOrders();
      } else if (event === 'SIGNED_OUT') {
        setOrders([]);
      }
    });

    // 5. Load Banners from Supabase
    fetchBanners();

    // 6. Load Settings from Supabase
    fetchSettings();

    // 7. Load History
    const localHistory = localStorage.getItem('admin_history');
    if (localHistory) setHistory(JSON.parse(localHistory!));

    // 8. Load Offers
    const localOffers = localStorage.getItem('admin_offers');
    if (localOffers) {
      setOffers(JSON.parse(localOffers!));
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

    return () => {
      supabase.removeChannel(ordersChannel);
      subscription.unsubscribe();
    };
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
  const saveProduct = async (p: UnifiedProduct) => {
    const isEdit = !p.id.startsWith('p-');
    const hasMultiWeight = typeof p.price === 'object';
    
    const flatPriceVal = hasMultiWeight ? null : Number(p.price || 0);
    const priceObj = hasMultiWeight ? (p.price as { piece?: number; halfKg?: number; oneKg?: number }) : null;
    const slicePriceVal = priceObj ? (priceObj.piece !== undefined ? Number(priceObj.piece) : null) : null;
    const halfKgPriceVal = priceObj ? (priceObj.halfKg !== undefined ? Number(priceObj.halfKg) : null) : null;
    const oneKgPriceVal = priceObj ? (priceObj.oneKg !== undefined ? Number(priceObj.oneKg) : null) : null;

    const dbPrice = hasMultiWeight ? slicePriceVal : flatPriceVal;

    const payload = {
      name: p.name,
      category: p.category,
      image_url: p.image,
      price: dbPrice,
      half_kg: halfKgPriceVal,
      one_kg: oneKgPriceVal,
      description: p.description
    };

    if (isEdit) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', p.id);

      if (error) {
        console.error('Error updating product in Supabase:', error);
        return;
      }
      addHistoryLog(`Updated Product: ${p.name}`, `Product ID: ${p.id}`);
    } else {
      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) {
        console.error('Error inserting product in Supabase:', error);
        return;
      }
      addHistoryLog(`Added Product: ${p.name}`, `Category: ${p.category}`);
    }

    await fetchSupabaseProducts();
  };

  const softDeleteProduct = async (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return;
    }

    addHistoryLog(`Deleted Product: ${target.name}`, `Product ID: ${id}`);
    await fetchSupabaseProducts();
  };

  const restoreProduct = (_id: string) => {
    // No-op as we delete immediately
  };

  const permanentlyDeleteProduct = async (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting product from Supabase:', error);
      return;
    }

    addHistoryLog(`Deleted Permanently: ${target.name}`, `Product ID: ${id}`);
    await fetchSupabaseProducts();
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
    saveProduct(clone);
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
    addHistoryLog('Reordered Products Catalog', 'Rearranged display sequence of catalog items.');
  };

  // --- GALLERY ---
  const saveGalleryItem = async (item: UnifiedGalleryItem) => {
    const isEdit = !item.id.startsWith('g-');
    const payload = {
      title: item.title,
      category: item.category,
      image_url: item.image,
      priority: item.displayPriority
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('gallery')
          .update(payload)
          .eq('id', item.id);

        if (error) {
          console.error('Gallery update error:', error);
          return;
        }
        addHistoryLog(`Updated Gallery Item: ${item.title}`, `ID: ${item.id}`);
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert([payload]);

        if (error) {
          console.error('Gallery insert error:', error);
          return;
        }
        addHistoryLog(`Uploaded Gallery Image: ${item.title}`, `Category: ${item.category}`);
      }

      await fetchGallery();
    } catch (err) {
      console.error('Error saving gallery item:', err);
    }
  };

  const softDeleteGalleryItem = async (id: string) => {
    const target = gallery.find(g => g.id === id);
    if (!target) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gallery delete error:', error);
        return;
      }

      addHistoryLog(`Moved Gallery Item to Trash (Deleted): ${target.title}`, `ID: ${id}`);
      await fetchGallery();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
    }
  };

  const restoreGalleryItem = (_id: string) => {
    // No-op as we delete immediately
  };

  const permanentlyDeleteGalleryItem = async (id: string) => {
    const target = gallery.find(g => g.id === id);
    if (!target) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Gallery permanent delete error:', error);
        return;
      }

      addHistoryLog(`Deleted Gallery Image permanently: ${target.title}`, `ID: ${id}`);
      await fetchGallery();
    } catch (err) {
      console.error('Error permanently deleting gallery item:', err);
    }
  };

  const reorderGallery = async (reordered: UnifiedGalleryItem[]) => {
    const mapped = reordered.map((item, idx) => ({
      ...item,
      displayPriority: idx + 1
    }));
    setGallery(mapped);

    try {
      const promises = mapped.map(item =>
        supabase
          .from('gallery')
          .update({ priority: item.displayPriority })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      addHistoryLog('Reordered Gallery Showcases', 'Rearranged display sequence.');
    } catch (err) {
      console.error('Error reordering gallery showcases in Supabase:', err);
    }
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
  // --- ORDERS ---
  const addOrder = async (o: Omit<UnifiedOrder, 'id' | 'createdDate'>): Promise<UnifiedOrder> => {
    const createdDate = new Date().toISOString();

    try {
      // 1. Get current logged-in user profile UUID (if any)
      const { data: { user } } = await supabase.auth.getUser();
      let customerId: string | null = null;

      if (user) {
        customerId = user.id;
      } else {
        // Fallback: look up profile by phone number
        if (o.phone) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone', o.phone)
            .limit(1);
          if (profileRow && profileRow.length > 0) {
            customerId = profileRow[0].id;
          }
        }
        // If still no matching profile, query the first profile available in the DB as fallback
        if (!customerId) {
          const { data: firstProfile } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          if (firstProfile && firstProfile.length > 0) {
            customerId = firstProfile[0].id;
          }
        }
      }

      // 2. Insert single order summary row to match EXACT orders columns (id uuid, customer_id, product_name, amount, status, created_at)
      const { data: insertedData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: customerId,
            product_name: o.orderedProduct,
            amount: o.amount,
            status: o.orderStatus || 'Pending',
            created_at: createdDate
          }
        ])
        .select('id')
        .maybeSingle();

      if (orderError) {
        console.error("Order insert failed:", orderError);
        throw orderError;
      }

      const generatedOrderId = insertedData?.id || `ORD-${Date.now().toString().slice(-6)}`;
      addHistoryLog(`New Order Received: ${generatedOrderId}`, `Customer: ${o.customerName} | Amount: ₹${o.amount}`);
      await fetchSupabaseOrders();

      return {
        ...o,
        id: generatedOrderId,
        createdDate
      };
    } catch (err) {
      console.error('Failed to submit order to Supabase:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: UnifiedOrder['orderStatus']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating order status in Supabase:', error);
        return;
      }

      addHistoryLog(`Updated Order Status: ${id}`, `New Status: ${status}`);
      await fetchSupabaseOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const updateOrderPaymentStatus = async (id: string, status: UnifiedOrder['paymentStatus']) => {
    // Payment status is mapped to 'status' or logged if schema doesn't hold it
    addHistoryLog(`Payment Status Logged: ${id}`, `Payment Status: ${status}`);
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting order from Supabase:', error);
        return;
      }

      addHistoryLog(`Removed Order Archive: ${id}`, `ID: ${id}`);
      await fetchSupabaseOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  // --- BANNERS ---
  const saveBanner = async (b: UnifiedBanner) => {
    const isEdit = !b.id.startsWith('b-');
    const payload = {
      title: b.title || '',
      subtitle: b.subtitle || '',
      image_url: b.image,
      is_active: b.isActive,
      priority: b.displayPriority,
      featured_product_name: b.featured_product_name || '',
      cta_text: b.cta_text || ''
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('banners')
          .update(payload)
          .eq('id', b.id);

        if (error) {
          console.error('Error updating banner in Supabase:', error);
          return;
        }
        addHistoryLog(`Updated Homepage Banner: ${b.title || 'Untitled'}`, `Active: ${b.isActive ? 'Yes' : 'No'}`);
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([payload]);

        if (error) {
          console.error('Error inserting banner in Supabase:', error);
          return;
        }
        addHistoryLog(`Added Homepage Banner: ${b.title || 'Untitled'}`, `Active: ${b.isActive ? 'Yes' : 'No'}`);
      }

      await fetchBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting banner from Supabase:', error);
        return;
      }

      addHistoryLog('Deleted Homepage Banner', `Banner ID: ${id}`);
      await fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  const reorderBanners = async (reordered: UnifiedBanner[]) => {
    const mapped = reordered.map((item, idx) => ({
      ...item,
      displayPriority: idx + 1
    }));
    setBanners(mapped);

    try {
      const promises = mapped.map(item =>
        supabase
          .from('banners')
          .update({ priority: item.displayPriority })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      addHistoryLog('Reordered Homepage Banners', 'Rearranged display sequence.');
    } catch (err) {
      console.error('Error reordering banners in Supabase:', err);
    }
  };

  // --- SETTINGS ---
  const updateSettings = async (s: UnifiedSettings) => {
    try {
      const payload = {
        bakery_name: s.bakeryName,
        address: s.storeAddress,
        maps_link: s.googleMapsLink || '',
        opening_time: s.openingTime || '9:00 AM',
        closing_time: s.closingTime || '10:00 PM',
        whatsapp: s.whatsappNumber,
        instagram: s.instagramUrl
      };

      const { error } = await supabase
        .from('settings')
        .update(payload)
        .eq('id', 1);

      if (error) {
        console.error('Error updating settings in Supabase:', error);
        throw error;
      }

      await fetchSettings();
      addHistoryLog('Updated Bakery Settings', 'Configuration details updated.');
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
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
        fetchSupabaseOrders,

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
