import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminProduct, AdminOrder, CustomCakeOrder, AdminCustomer, BakerySettings } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SETTINGS,
  INITIAL_GALLERY_IMAGES
} from '../utils/mockData';

interface AdminStateContextType {
  products: AdminProduct[];
  setProducts: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
  orders: AdminOrder[];
  setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
  customOrders: CustomCakeOrder[];
  setCustomOrders: React.Dispatch<React.SetStateAction<CustomCakeOrder[]>>;
  customers: AdminCustomer[];
  setCustomers: React.Dispatch<React.SetStateAction<AdminCustomer[]>>;
  settings: BakerySettings;
  setSettings: React.Dispatch<React.SetStateAction<BakerySettings>>;
  gallery: any[];
  setGallery: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Helpers
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdDate'>) => void;
  updateProduct: (product: AdminProduct) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: AdminOrder['orderStatus']) => void;
  updateOrderPaymentStatus: (id: string, status: AdminOrder['paymentStatus']) => void;
  updateCustomOrderStatus: (id: string, status: CustomCakeOrder['status'], price?: number) => void;
}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

export const AdminStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomCakeOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [settings, setSettings] = useState<BakerySettings>(INITIAL_SETTINGS);
  const [gallery, setGallery] = useState<any[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const localProducts = localStorage.getItem('admin_products');
    const localOrders = localStorage.getItem('admin_orders');
    const localCustomOrders = localStorage.getItem('admin_custom_orders');
    const localCustomers = localStorage.getItem('admin_customers');
    const localSettings = localStorage.getItem('admin_settings');
    const localGallery = localStorage.getItem('admin_gallery');

    if (localProducts) {
      let parsed = JSON.parse(localProducts);
      let migrated = false;
      parsed = parsed.map((p: any) => {
        if (p.image && p.image.includes('1558961309-dbdf71791f5a')) {
          migrated = true;
          return { ...p, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80' };
        }
        return p;
      });
      setProducts(parsed);
      if (migrated) {
        localStorage.setItem('admin_products', JSON.stringify(parsed));
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('admin_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (localOrders) setOrders(JSON.parse(localOrders));
    else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('admin_orders', JSON.stringify(INITIAL_ORDERS));
    }

    if (localCustomOrders) {
      let parsed = JSON.parse(localCustomOrders);
      let migrated = false;
      parsed = parsed.map((o: any) => {
        if (o.referenceImage && o.referenceImage.includes('1535141192574-5d4897c13636')) {
          migrated = true;
          o.referenceImage = 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=600&q=80';
        }
        if (o.referenceImage && o.referenceImage.includes('1562266648-a40d52b1f939')) {
          migrated = true;
          o.referenceImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
        }
        return o;
      });
      setCustomOrders(parsed);
      if (migrated) {
        localStorage.setItem('admin_custom_orders', JSON.stringify(parsed));
      }
    } else {
      setCustomOrders(INITIAL_CUSTOM_ORDERS);
      localStorage.setItem('admin_custom_orders', JSON.stringify(INITIAL_CUSTOM_ORDERS));
    }

    if (localCustomers) setCustomers(JSON.parse(localCustomers));
    else {
      setCustomers(INITIAL_CUSTOMERS);
      localStorage.setItem('admin_customers', JSON.stringify(INITIAL_CUSTOMERS));
    }

    if (localSettings) {
      let parsed = JSON.parse(localSettings);
      let migrated = false;
      if (parsed.phone && parsed.phone.includes('90479')) {
        migrated = true;
        parsed.phone = '+91 93455 86112';
      }
      if (parsed.whatsappNumber && parsed.whatsappNumber.includes('90479')) {
        migrated = true;
        parsed.whatsappNumber = '+91 93455 86112';
      }
      setSettings(parsed);
      if (migrated) {
        localStorage.setItem('admin_settings', JSON.stringify(parsed));
      }
    } else {
      setSettings(INITIAL_SETTINGS);
      localStorage.setItem('admin_settings', JSON.stringify(INITIAL_SETTINGS));
    }

    if (localGallery) setGallery(JSON.parse(localGallery));
    else {
      setGallery(INITIAL_GALLERY_IMAGES);
      localStorage.setItem('admin_gallery', JSON.stringify(INITIAL_GALLERY_IMAGES));
    }
  }, []);

  // Sync state to localStorage
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addProduct = (p: Omit<AdminProduct, 'id' | 'createdDate'>) => {
    const newProduct: AdminProduct = {
      ...p,
      id: `p-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveToLocal('admin_products', updated);
  };

  const updateProduct = (p: AdminProduct) => {
    const updated = products.map(item => item.id === p.id ? p : item);
    setProducts(updated);
    saveToLocal('admin_products', updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(item => item.id !== id);
    setProducts(updated);
    saveToLocal('admin_products', updated);
  };

  const updateOrderStatus = (id: string, status: AdminOrder['orderStatus']) => {
    const updated = orders.map(item => {
      if (item.id === id) {
        // Automatically mark as paid if status becomes Delivered
        const paymentStatus = status === 'Delivered' ? 'Paid' as const : item.paymentStatus;
        return { ...item, orderStatus: status, paymentStatus };
      }
      return item;
    });
    setOrders(updated);
    saveToLocal('admin_orders', updated);

    // If order was delivered, update customer's lifetime spend
    if (status === 'Delivered') {
      const order = orders.find(o => o.id === id);
      if (order && order.orderStatus !== 'Delivered') {
        const custUpdated = customers.map(c => {
          if (c.name.toLowerCase() === order.customerName.toLowerCase()) {
            return {
              ...c,
              totalOrders: c.totalOrders + 1,
              lifetimeSpend: c.lifetimeSpend + order.amount,
              lastOrderDate: new Date().toISOString().split('T')[0],
              type: (c.totalOrders + 1 >= 10 ? 'VIP' : 'Regular') as any
            };
          }
          return c;
        });
        setCustomers(custUpdated);
        saveToLocal('admin_customers', custUpdated);
      }
    }
  };

  const updateOrderPaymentStatus = (id: string, status: AdminOrder['paymentStatus']) => {
    const updated = orders.map(item => item.id === id ? { ...item, paymentStatus: status } : item);
    setOrders(updated);
    saveToLocal('admin_orders', updated);
  };

  const updateCustomOrderStatus = (id: string, status: CustomCakeOrder['status'], price?: number) => {
    const updated = customOrders.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status,
          quotedPrice: price !== undefined ? price : item.quotedPrice
        };
      }
      return item;
    });
    setCustomOrders(updated);
    saveToLocal('admin_custom_orders', updated);

    // If approved and price quoted, create a real order!
    if (status === 'Approved') {
      const cake = customOrders.find(item => item.id === id);
      if (cake) {
        const finalPrice = price || cake.quotedPrice || 2500;
        const newOrder: AdminOrder = {
          id: `ORD-${Date.now().toString().slice(-4)}`,
          customerName: cake.customerName,
          phone: cake.phone,
          deliveryAddress: `Store Pickup - Custom Cake Theme: ${cake.theme}`,
          orderedProduct: `Custom Cake: ${cake.theme} (${cake.weight})`,
          quantity: 1,
          amount: finalPrice,
          paymentMethod: 'UPI/Online',
          paymentStatus: 'Pending',
          orderStatus: 'Accepted',
          createdDate: new Date().toISOString()
        };
        const newOrdersList = [newOrder, ...orders];
        setOrders(newOrdersList);
        saveToLocal('admin_orders', newOrdersList);
      }
    }
  };

  const updateSettingsState = (s: BakerySettings) => {
    setSettings(s);
    saveToLocal('admin_settings', s);
  };

  const updateGalleryState = (g: any[]) => {
    setGallery(g);
    saveToLocal('admin_gallery', g);
  };

  return (
    <AdminStateContext.Provider value={{
      products, setProducts,
      orders, setOrders,
      customOrders, setCustomOrders,
      customers, setCustomers,
      settings, setSettings: updateSettingsState as any,
      gallery, setGallery: updateGalleryState as any,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      updateOrderPaymentStatus,
      updateCustomOrderStatus
    }}>
      {children}
    </AdminStateContext.Provider>
  );
};

export const useAdminState = () => {
  const context = useContext(AdminStateContext);
  if (!context) {
    throw new Error('useAdminState must be used within an AdminStateProvider');
  }
  return context;
};
