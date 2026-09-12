import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data';
import { INITIAL_ORDERS, INITIAL_SETTINGS } from '../admin/utils/mockData';
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
  orderNumber: string;
  userId?: string;
  customerName: string;
  phone: string;
  customerEmail?: string;
  email?: string;
  orderType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  streetArea?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  deliveryArea?: string;
  deliveryFee: number;
  subtotal: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'PENDING' | 'PAID' | 'FAILED';
  orderStatus:
    | 'Pending'
    | 'Confirmed'
    | 'Preparing'
    | 'Ready'
    | 'Delivered'
    | 'Cancelled'
    | 'PENDING PAYMENT'
    | 'PAID'
    | 'ORDER PLACED'
    | 'ORDER_PLACED'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'OUT FOR DELIVERY'
    | 'DELIVERED'
    | 'READY FOR PICKUP'
    | 'PICKED UP'
    | 'CANCELLED';
  whatsappOpenedAt?: string;
  createdDate: string;
  orderedProduct?: string;
  items: {
    id?: string;
    productId?: string;
    productName?: string;
    name?: string;
    selectedWeight: string;
    price: number;
    quantity: number;
    image?: string;
    customizations?: Record<string, string | undefined>;
  }[];
}

export interface UnifiedCustomer {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderAt?: string;
  firstOrderAt?: string;
}

export interface UnifiedHeroVideo {
  id: string;
  title?: string;
  videoUrl: string;
  displayPriority: number;
  isActive: boolean;
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
  heroVideoUrl?: string;
  // Delivery & Online Payment settings
  deliveryEnabled?: boolean;
  deliveryAreaName?: string;
  minOrderAmount?: number;
  pickupEnabled?: boolean;
  onlinePaymentEnabled?: boolean;
  mohanurLat?: number;
  mohanurLng?: number;
  deliveryRadiusKm?: number;
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

export interface CustomerNotification {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  registeredAt: string;
}

interface DatabaseContextType {
  products: UnifiedProduct[];
  gallery: UnifiedGalleryItem[];
  categories: UnifiedCategory[];
  orders: UnifiedOrder[];
  customers: UnifiedCustomer[];
  banners: UnifiedBanner[];
  heroVideos: UnifiedHeroVideo[];
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
  addOrder: (order: Partial<UnifiedOrder>) => Promise<UnifiedOrder>;
  updateOrderStatus: (id: string, status: UnifiedOrder['orderStatus']) => void;
  updateOrderPaymentStatus: (id: string, status: UnifiedOrder['paymentStatus']) => void;
  deleteOrder: (id: string) => void;
  fetchOrdersFromSupabase: () => Promise<void>;

  // Banner Operations
  saveBanner: (banner: UnifiedBanner) => void | Promise<void>;
  deleteBanner: (id: string) => void | Promise<void>;
  reorderBanners: (banners: UnifiedBanner[]) => void | Promise<void>;

  // Hero Video Operations
  saveHeroVideo: (video: UnifiedHeroVideo) => void;
  deleteHeroVideo: (id: string) => void;
  reorderHeroVideos: (videos: UnifiedHeroVideo[]) => void;

  // Settings Operation
  updateSettings: (settings: UnifiedSettings) => void | Promise<void>;

  // Offer Operations
  saveOffer: (offer: UnifiedOffer) => void;
  deleteOffer: (id: string) => void;
  
  // History Operations
  addHistoryLog: (action: string, details: string) => void;
  clearHistory: () => void;

  // Customer Operations
  fetchCustomers: () => Promise<void>;
  newCustomerAlert: CustomerNotification | null;
  dismissNewCustomerAlert: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [gallery, setGallery] = useState<UnifiedGalleryItem[]>([]);
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [customers, setCustomers] = useState<UnifiedCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('admin_customers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [banners, setBanners] = useState<UnifiedBanner[]>([]);
  const [heroVideos, setHeroVideos] = useState<UnifiedHeroVideo[]>(() => {
    try {
      const saved = localStorage.getItem('admin_hero_videos');
      return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : [
        {
          id: 'v-1',
          title: 'Artisan Bakery Showcase',
          videoUrl: '/Like_this_make_and_give_the_.mp4',
          displayPriority: 1,
          isActive: true
        }
      ];
    } catch {
      return [
        {
          id: 'v-1',
          title: 'Artisan Bakery Showcase',
          videoUrl: '/Like_this_make_and_give_the_.mp4',
          displayPriority: 1,
          isActive: true
        }
      ];
    }
  });
  const [settings, setSettings] = useState<UnifiedSettings>(INITIAL_SETTINGS as any);
  const [history, setHistory] = useState<UnifiedHistoryLog[]>([]);
  const [offers, setOffers] = useState<UnifiedOffer[]>([]);
  const [newCustomerAlert, setNewCustomerAlert] = useState<CustomerNotification | null>(null);
  const seenCustomerIds = useRef<Set<string>>(new Set());

  const dismissNewCustomerAlert = () => {
    setNewCustomerAlert(null);
  };

  const handleNewCustomer = (customerData: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
    registeredAt?: string;
  }) => {
    if (!customerData.userId && !customerData.phone) return;
    if (customerData.userId && seenCustomerIds.current.has(customerData.userId)) return;
    if (customerData.userId) seenCustomerIds.current.add(customerData.userId);

    const registeredAt = customerData.registeredAt || new Date().toISOString();
    const newCustomerObj: UnifiedCustomer = {
      userId: customerData.userId,
      name: customerData.name || 'Bakery Customer',
      phone: customerData.phone || '',
      email: customerData.email || '',
      registeredAt,
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
    };

    // Immediately prepend new customer to customer list so Admin Panel updates instantly and persists across refresh
    setCustomers(prev => {
      const cleanP = (newCustomerObj.phone || '').replace(/\D/g, '');
      if (prev.some(c => c.userId === newCustomerObj.userId || (cleanP && c.phone && c.phone.replace(/\D/g, '') === cleanP))) {
        return prev;
      }
      const updated = [newCustomerObj, ...prev];
      try {
        localStorage.setItem('admin_customers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Trigger instant alert notification with all customer information
    setNewCustomerAlert({
      id: `alert-${Date.now()}`,
      userId: customerData.userId,
      name: customerData.name || 'Bakery Customer',
      phone: customerData.phone || '',
      email: customerData.email || '',
      registeredAt,
    });
  };

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

      if (data && data.length > 0) {
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

        const mappedVideos: UnifiedHeroVideo[] = data.map((row: any) => ({
          id: String(row.id),
          title: row.title || 'Background Video',
          videoUrl: row.image_url || '/Like_this_make_and_give_the_.mp4',
          displayPriority: Number(row.priority || 1),
          isActive: row.is_active !== false
        }));
        setHeroVideos(mappedVideos);
      }
    } catch (err) {
      console.error('Error fetching banners/videos:', err);
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

    // 3. Load Categories (with migration: merge new DEFAULT_CATEGORIES into existing)
    const localCategories = localStorage.getItem('admin_categories');
    if (localCategories) {
      const parsed: UnifiedCategory[] = JSON.parse(localCategories);
      const existingNames = new Set(parsed.map((c) => c.name));

      // Find categories in DEFAULT_CATEGORIES not yet in localStorage
      const missing = DEFAULT_CATEGORIES.filter((cat) => !existingNames.has(cat));

      if (missing.length > 0) {
        // Append missing categories after existing ones
        const maxPriority = parsed.reduce((max, c) => Math.max(max, c.displayPriority), 0);
        const newEntries: UnifiedCategory[] = missing.map((cat, idx) => ({
          id: `cat-${Date.now()}-${idx}`,
          name: cat,
          displayPriority: maxPriority + idx + 1
        }));
        const merged = [...parsed, ...newEntries];
        setCategories(merged);
        localStorage.setItem('admin_categories', JSON.stringify(merged));
      } else {
        setCategories(parsed);
      }
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
        orderNumber: `#MG-${o.id.slice(-6)}`,
        customerName: o.customerName,
        phone: o.phone,
        orderType: 'delivery',
        deliveryAddress: o.deliveryAddress,
        deliveryFee: 40,
        subtotal: o.amount,
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
            productName: o.orderedProduct,
            selectedWeight: 'Standard',
            price: o.amount / o.quantity,
            quantity: o.quantity
          }
        ]
      }));
      setOrders(initial);
      localStorage.setItem('admin_orders', JSON.stringify(initial));
    }

    // 5. Load Banners from Supabase
    fetchBanners();

    // 6. Load Settings from Supabase
    fetchSettings();

    // 7. Load Customers from Supabase (profiles table)
    fetchCustomers();

    // 9. Load Orders from Supabase (primary source of truth)
    // Async — will update state when loaded
    setTimeout(() => {
      fetchOrdersFromSupabase().catch(() => {
        // Supabase unavailable — localStorage fallback already loaded above
      });
    }, 500);

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

  // Supabase Realtime subscription for instant new customer registration
  useEffect(() => {
    const existing = supabase.getChannels().find((c: any) => c.topic === 'realtime:admin-customer-events');
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel('admin-customer-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload: any) => {
          const row = payload.new;
          if (row) {
            handleNewCustomer({
              userId: row.id,
              name: row.full_name || row.name || 'Bakery Customer',
              phone: row.phone || '',
              email: row.email || '',
              registeredAt: row.created_at || new Date().toISOString(),
            });
          }
        }
      )
      .on(
        'broadcast',
        { event: 'new_customer' },
        (payload: any) => {
          if (payload?.payload) {
            handleNewCustomer(payload.payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to admin-customer-events channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
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
  const fetchOrdersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(id, product_id, product_name, quantity, unit_price, total_price, selected_weight, customizations)')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) { console.warn('fetchOrdersFromSupabase error:', error); return; }

      if (data) {
        const mapped: UnifiedOrder[] = data.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          userId: row.user_id,
          customerName: row.customer_name,
          phone: row.customer_phone,
          customerEmail: row.customer_email || '',
          orderType: row.order_type || 'delivery',
          deliveryAddress: row.delivery_address || '',
          streetArea: row.street_area || '',
          landmark: row.landmark || '',
          city: row.city || 'Mohanur',
          pincode: row.pincode || '637015',
          latitude: row.latitude,
          longitude: row.longitude,
          deliveryArea: row.delivery_area || 'Mohanur',
          deliveryFee: Number(row.delivery_fee || 0),
          subtotal: Number(row.subtotal || 0),
          amount: Number(row.total_amount || 0),
          paymentMethod: row.payment_method || 'whatsapp',
          paymentStatus: row.payment_status || 'PENDING',
          orderStatus: row.order_status || 'ORDER_PLACED',
          whatsappOpenedAt: row.whatsapp_opened_at,
          createdDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          orderedProduct: (row.order_items || []).map((i: any) => `${i.quantity}x ${i.product_name}`).join(', '),
          items: (row.order_items || []).map((i: any) => ({
            id: i.id, productId: i.product_id, productName: i.product_name, name: i.product_name,
            selectedWeight: i.selected_weight || 'Standard', price: Number(i.unit_price || 0),
            quantity: Number(i.quantity || 1), customizations: i.customizations || {},
          })),
        }));
        setOrders(mapped);
        syncToLocal('admin_orders', mapped);
      }
    } catch (err) { console.warn('fetchOrdersFromSupabase error:', err); }
  };

  const fetchCustomers = async () => {
    try {
      // 1. Read existing cached customers from localStorage
      let cached: UnifiedCustomer[] = [];
      try {
        const saved = localStorage.getItem('admin_customers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) cached = parsed;
        }
      } catch {}

      // 2. Fetch profiles from Supabase
      const { data: dbProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch profiles warning:', error.message);
      }

      // Customer map keyed by unique identifiers (uid, phone, email)
      const customerMap = new Map<string, UnifiedCustomer>();
      const getCleanPhone = (phone?: string) => (phone || '').replace(/\D/g, '');

      const mergeIntoMap = (cust: Partial<UnifiedCustomer> & { userId?: string; phone?: string; email?: string; name?: string; registeredAt?: string }) => {
        const uid = cust.userId;
        const phone = cust.phone || '';
        const cleanPhone = getCleanPhone(phone);
        const email = (cust.email || '').trim().toLowerCase();

        // Search for existing entry in map
        let existing: UnifiedCustomer | undefined;
        if (uid && customerMap.has(`uid:${uid}`)) {
          existing = customerMap.get(`uid:${uid}`);
        } else if (cleanPhone && customerMap.has(`phone:${cleanPhone}`)) {
          existing = customerMap.get(`phone:${cleanPhone}`);
        } else if (email && customerMap.has(`email:${email}`)) {
          existing = customerMap.get(`email:${email}`);
        }

        const merged: UnifiedCustomer = {
          userId: uid || existing?.userId || `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: cust.name && cust.name !== 'Bakery Customer' ? cust.name : (existing?.name || cust.name || 'Bakery Customer'),
          phone: phone || existing?.phone || '',
          email: email || existing?.email || '',
          registeredAt: cust.registeredAt || existing?.registeredAt || new Date().toISOString(),
          totalOrders: existing?.totalOrders || 0,
          totalSpent: existing?.totalSpent || 0,
          avgOrderValue: existing?.avgOrderValue || 0,
          firstOrderAt: existing?.firstOrderAt,
          lastOrderAt: existing?.lastOrderAt,
        };

        if (uid) seenCustomerIds.current.add(uid);

        // Map by all identifiers
        if (merged.userId) customerMap.set(`uid:${merged.userId}`, merged);
        if (cleanPhone) customerMap.set(`phone:${cleanPhone}`, merged);
        if (email) customerMap.set(`email:${email}`, merged);
      };

      // Merge current state, localStorage cache, Supabase profiles, and orders
      customers.forEach(c => mergeIntoMap(c));
      cached.forEach(c => mergeIntoMap(c));

      if (dbProfiles && Array.isArray(dbProfiles)) {
        dbProfiles.forEach((row: any) => {
          mergeIntoMap({
            userId: row.id,
            name: row.full_name || row.name || 'Bakery Customer',
            phone: row.phone || '',
            email: row.email || '',
            registeredAt: row.created_at,
          });
        });
      }

      orders.forEach(o => {
        if (o.customerName || o.phone || o.userId) {
          mergeIntoMap({
            userId: o.userId,
            name: o.customerName,
            phone: o.phone,
            email: o.email || o.customerEmail || '',
            registeredAt: o.createdDate,
          });
        }
      });

      // Deduplicate unique customer objects
      const uniqueCustomers = Array.from(new Set(customerMap.values()));

      // Correlate with current orders to compute dynamic statistics
      const finalized: UnifiedCustomer[] = uniqueCustomers.map(c => {
        const cleanP = getCleanPhone(c.phone);
        const emailLower = (c.email || '').toLowerCase().trim();

        const custOrders = orders.filter(o => {
          const orderEmail = (o.email || o.customerEmail || '').toLowerCase().trim();
          const matchUid = c.userId && o.userId && o.userId === c.userId;
          const matchPhone = cleanP && o.phone && getCleanPhone(o.phone) === cleanP;
          const matchEmail = emailLower && orderEmail && orderEmail === emailLower;
          return matchUid || matchPhone || matchEmail;
        });

        const totalOrders = custOrders.length > 0 ? custOrders.length : (c.totalOrders || 0);
        const totalSpent = custOrders.length > 0
          ? custOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
          : (c.totalSpent || 0);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

        const sorted = [...custOrders].sort((a, b) =>
          new Date(a.createdDate || '').getTime() - new Date(b.createdDate || '').getTime()
        );
        const firstOrderAt = sorted.length > 0 ? sorted[0].createdDate : c.firstOrderAt;
        const lastOrderAt = sorted.length > 0 ? sorted[sorted.length - 1].createdDate : c.lastOrderAt;

        return {
          ...c,
          totalOrders,
          totalSpent,
          avgOrderValue,
          firstOrderAt,
          lastOrderAt,
        };
      });

      // Sort newest registration or order first
      finalized.sort((a, b) => {
        const timeA = new Date(a.registeredAt || 0).getTime();
        const timeB = new Date(b.registeredAt || 0).getTime();
        return timeB - timeA;
      });

      setCustomers(finalized);
      try {
        localStorage.setItem('admin_customers', JSON.stringify(finalized));
      } catch {}
    } catch (err) { console.warn('fetchCustomers error:', err); }
  };

  const addOrder = async (orderData: Partial<UnifiedOrder>): Promise<UnifiedOrder> => {
    const orderNum = orderData.orderNumber || `MG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: UnifiedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: orderData.userId,
      customerName: orderData.customerName || 'Customer',
      phone: orderData.phone || '',
      customerEmail: orderData.customerEmail || '',
      orderType: orderData.orderType || 'delivery',
      deliveryAddress: orderData.deliveryAddress || '',
      streetArea: orderData.streetArea || '',
      landmark: orderData.landmark || '',
      city: orderData.city || 'Mohanur',
      pincode: orderData.pincode || '637015',
      latitude: orderData.latitude,
      longitude: orderData.longitude,
      deliveryArea: orderData.deliveryArea || 'Mohanur',
      deliveryFee: orderData.deliveryFee || 0,
      subtotal: orderData.subtotal || orderData.amount || 0,
      amount: orderData.amount || 0,
      paymentMethod: orderData.paymentMethod || 'whatsapp',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      orderStatus: orderData.orderStatus || 'ORDER_PLACED',
      createdDate: new Date().toISOString().split('T')[0],
      orderedProduct: (orderData.items || []).map(i => `${i.quantity}x ${i.productName || i.name}`).join(', '),
      items: orderData.items || []
    };

    // Save to Supabase first (source of truth)
    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          order_number: newOrder.orderNumber,
          user_id: newOrder.userId || null,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.phone,
          customer_email: newOrder.customerEmail || null,
          order_type: newOrder.orderType,
          delivery_address: newOrder.deliveryAddress,
          street_area: newOrder.streetArea,
          landmark: newOrder.landmark,
          city: newOrder.city,
          pincode: newOrder.pincode,
          latitude: newOrder.latitude || null,
          longitude: newOrder.longitude || null,
          delivery_area: newOrder.deliveryArea,
          delivery_fee: newOrder.deliveryFee,
          subtotal: newOrder.subtotal,
          total_amount: newOrder.amount,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          order_status: newOrder.orderStatus,
        }])
        .select()
        .single();

      if (!orderErr && dbOrder) {
        newOrder.id = dbOrder.id; // Use real Supabase UUID
        const itemPayloads = (newOrder.items || []).map(item => ({
          order_id: dbOrder.id,
          product_id: item.productId || item.id || 'unknown',
          product_name: item.productName || item.name || 'Bakery Item',
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          selected_weight: item.selectedWeight || 'Standard',
          customizations: item.customizations || {},
          product_snapshot: { name: item.productName || item.name, price: item.price, selectedWeight: item.selectedWeight },
        }));
        if (itemPayloads.length > 0) {
          await supabase.from('order_items').insert(itemPayloads);
        }
      }
    } catch (err) {
      console.warn('Notice syncing order to Supabase:', err);
    }

    const updated = [newOrder, ...orders];
    setOrders(updated);
    syncToLocal('admin_orders', updated);

    // Update customer spending statistics in memory immediately
    if (newOrder.userId || newOrder.phone) {
      const pClean = (newOrder.phone || '').replace(/\D/g, '');
      setCustomers(prev => prev.map(c => {
        const matches = (newOrder.userId && c.userId === newOrder.userId) ||
          (pClean && c.phone && c.phone.replace(/\D/g, '') === pClean);
        if (matches) {
          const newTotalOrders = c.totalOrders + 1;
          const newTotalSpent = c.totalSpent + (newOrder.amount || 0);
          return {
            ...c,
            totalOrders: newTotalOrders,
            totalSpent: newTotalSpent,
            avgOrderValue: Math.round(newTotalSpent / newTotalOrders),
            lastOrderAt: newOrder.createdDate,
            firstOrderAt: c.firstOrderAt || newOrder.createdDate,
          };
        }
        return c;
      }));
    }

    addHistoryLog(`New Order: ${newOrder.orderNumber}`, `Customer: ${newOrder.customerName} | ₹${newOrder.amount} | ${newOrder.orderType}`);
    return newOrder;
  };

  const updateOrderStatus = async (id: string, status: UnifiedOrder['orderStatus']) => {
    const updated = orders.map(item => {
      if (item.id === id || item.orderNumber === id) {
        const paymentStatus = (status === 'Delivered' || status === 'DELIVERED') ? 'PAID' as const : item.paymentStatus;
        return { ...item, orderStatus: status, paymentStatus };
      }
      return item;
    });
    setOrders(updated);
    syncToLocal('admin_orders', updated);

    try {
      await supabase
        .from('orders')
        .update({ order_status: status })
        .or(`id.eq.${id},order_number.eq.${id}`);
    } catch (err) {
      console.warn('Notice updating order status in Supabase:', err);
    }

    addHistoryLog(`Updated Order Status: ${id}`, `New Status: ${status}`);
  };

  const updateOrderPaymentStatus = async (id: string, status: UnifiedOrder['paymentStatus']) => {
    const updated = orders.map(item => (item.id === id || item.orderNumber === id) ? { ...item, paymentStatus: status } : item);
    setOrders(updated);
    syncToLocal('admin_orders', updated);

    try {
      await supabase
        .from('orders')
        .update({ payment_status: status })
        .or(`id.eq.${id},order_number.eq.${id}`);
    } catch (err) {
      console.warn('Notice updating payment status in Supabase:', err);
    }

    addHistoryLog(`Updated Order Payment Status: ${id}`, `Payment Status: ${status}`);
  };

  const deleteOrder = async (id: string) => {
    const updated = orders.filter(item => item.id !== id && item.orderNumber !== id);
    setOrders(updated);
    syncToLocal('admin_orders', updated);

    try {
      await supabase
        .from('orders')
        .delete()
        .or(`id.eq.${id},order_number.eq.${id}`);
    } catch (err) {
      console.warn('Notice deleting order from Supabase:', err);
    }

    addHistoryLog(`Removed Order Archive: ${id}`, `ID: ${id}`);
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

  // --- HERO VIDEOS ---
  const saveHeroVideo = async (video: UnifiedHeroVideo) => {
    let updated: UnifiedHeroVideo[];
    const isEdit = heroVideos.some(v => v.id === video.id);
    if (isEdit) {
      updated = heroVideos.map(v => v.id === video.id ? video : v);
      addHistoryLog(`Updated Hero Video: ${video.title || 'Untitled'}`, `ID: ${video.id}`);
    } else {
      updated = [...heroVideos, video];
      addHistoryLog(`Added Hero Video: ${video.title || 'Untitled'}`, `URL: ${video.videoUrl.slice(0, 30)}...`);
    }
    setHeroVideos(updated);
    try { localStorage.setItem('admin_hero_videos', JSON.stringify(updated)); } catch (e) {}

    const payload = {
      title: video.title || 'Background Video',
      image_url: video.videoUrl,
      is_active: video.isActive,
      priority: video.displayPriority
    };

    try {
      if (isEdit && !video.id.startsWith('v-')) {
        await supabase.from('banners').update(payload).eq('id', video.id);
      } else {
        await supabase.from('banners').insert([payload]);
      }
      await fetchBanners();
    } catch (err) {
      console.error('Error syncing hero video to Supabase:', err);
    }
  };

  const deleteHeroVideo = async (id: string) => {
    const target = heroVideos.find(v => v.id === id);
    if (!target) return;
    const updated = heroVideos.filter(v => v.id !== id);
    setHeroVideos(updated);
    try { localStorage.setItem('admin_hero_videos', JSON.stringify(updated)); } catch (e) {}
    addHistoryLog(`Deleted Hero Video: ${target.title || id}`, `ID: ${id}`);

    if (!id.startsWith('v-')) {
      try {
        await supabase.from('banners').delete().eq('id', id);
        await fetchBanners();
      } catch (err) {
        console.error('Error deleting video from Supabase:', err);
      }
    }
  };

  const reorderHeroVideos = (reordered: UnifiedHeroVideo[]) => {
    const mapped = heroVideos.map(item => {
      const matchIndex = reordered.findIndex(r => r.id === item.id);
      if (matchIndex !== -1) {
        return { ...item, displayPriority: matchIndex + 1 };
      }
      return item;
    });
    setHeroVideos(mapped);
    try { localStorage.setItem('admin_hero_videos', JSON.stringify(mapped)); } catch (e) {}
    addHistoryLog('Reordered Hero Videos', 'Rearranged video play sequence.');
  };

  return (
    <DatabaseContext.Provider
      value={{
        products,
        gallery,
        categories,
        orders,
        customers,
        banners,
        heroVideos,
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
        fetchOrdersFromSupabase,

        saveBanner,
        deleteBanner,
        reorderBanners,

        saveHeroVideo,
        deleteHeroVideo,
        reorderHeroVideos,

        updateSettings,

        saveOffer,
        deleteOffer,
        
        addHistoryLog,
        clearHistory,
        fetchCustomers,
        newCustomerAlert,
        dismissNewCustomerAlert,
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
