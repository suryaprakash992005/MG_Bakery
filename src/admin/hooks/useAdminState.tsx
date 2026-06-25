import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminProduct, AdminOrder, CustomCakeOrder, AdminCustomer, BakerySettings } from '../types';
import { useBakeryDatabase } from '../../context/DatabaseContext';
import {
  INITIAL_CUSTOM_ORDERS,
  INITIAL_CUSTOMERS
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
  const db = useBakeryDatabase();

  const [customOrders, setCustomOrders] = useState<CustomCakeOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  // Load local specific state on mount
  useEffect(() => {
    const localCustomOrders = localStorage.getItem('admin_custom_orders');
    const localCustomers = localStorage.getItem('admin_customers');

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
  }, []);

  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Convert db UnifiedProduct array to AdminProduct format (filter out soft deleted products)
  const productsList: AdminProduct[] = db.products
    .filter(p => !p.isDeleted)
    .map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: typeof p.price === 'number' ? p.price : (p.price.halfKg || p.price.piece || p.price.single || 0),
      weight: p.weight || (typeof p.price === 'object' && p.price.halfKg ? '½ Kg' : 'Standard'),
      category: p.category,
      prepTime: 'Instant',
      isAvailable: p.status === 'Available',
      image: p.image,
      createdDate: p.createdDate || new Date().toISOString().split('T')[0]
    }));

  const addProduct = (p: Omit<AdminProduct, 'id' | 'createdDate'>) => {
    db.saveProduct({
      id: `p-${Date.now()}`,
      name: p.name,
      description: p.description,
      price: p.price,
      weight: p.weight,
      category: p.category,
      image: p.image,
      status: p.isAvailable ? 'Available' : 'Out of Stock',
      displayPriority: db.products.length + 1,
      createdDate: new Date().toISOString().split('T')[0]
    });
  };

  const updateProduct = (p: AdminProduct) => {
    const original = db.products.find(item => item.id === p.id);
    db.saveProduct({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      weight: p.weight,
      category: p.category,
      image: p.image,
      status: p.isAvailable ? 'Available' : 'Out of Stock',
      displayPriority: original?.displayPriority || 1,
      isFeatured: original?.isFeatured || false,
      dailySpecial: original?.dailySpecial || false,
      publishDate: original?.publishDate,
      visibilityExpiryDate: original?.visibilityExpiryDate,
      createdDate: p.createdDate || original?.createdDate || new Date().toISOString().split('T')[0],
      images: original?.images || [p.image]
    });
  };

  const deleteProduct = (id: string) => {
    db.softDeleteProduct(id);
  };

  // Convert db UnifiedOrder array to AdminOrder format
  const ordersList: AdminOrder[] = db.orders.map(o => ({
    id: o.id,
    customerName: o.customerName,
    phone: o.phone,
    deliveryAddress: o.deliveryAddress || 'Store Pickup',
    orderedProduct: o.orderedProduct,
    quantity: o.items?.[0]?.quantity || 1,
    amount: o.amount,
    paymentMethod: o.paymentMethod as any,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus as any,
    createdDate: o.createdDate
  }));

  const updateOrderStatus = (id: string, status: AdminOrder['orderStatus']) => {
    db.updateOrderStatus(id, status as any);

    // If order was delivered, update customer's lifetime spend
    if (status === 'Delivered') {
      const order = db.orders.find(o => o.id === id);
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
    db.updateOrderPaymentStatus(id, status);
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
        db.addOrder({
          customerName: cake.customerName,
          phone: cake.phone,
          deliveryAddress: `Store Pickup - Custom Cake Theme: ${cake.theme}`,
          orderedProduct: `Custom Cake: ${cake.theme} (${cake.weight})`,
          amount: finalPrice,
          paymentMethod: 'UPI/Online',
          paymentStatus: 'Pending',
          orderStatus: 'Confirmed',
          items: [
            {
              id: `item-${Date.now()}`,
              name: `Custom Cake: ${cake.theme}`,
              selectedWeight: cake.weight,
              price: finalPrice,
              quantity: 1
            }
          ]
        });
      }
    }
  };

  // Convert db UnifiedGalleryItem to simple array format (filter out soft deleted items)
  const galleryList = db.gallery.filter(g => !g.isDeleted);

  const updateSettingsState = (s: BakerySettings) => {
    db.updateSettings({
      ...db.settings,
      ...s
    });
  };

  const updateGalleryState = (g: any[]) => {
    // Adapter to save gallery list
    g.forEach(item => {
      db.saveGalleryItem({
        id: item.id,
        title: item.title,
        category: item.category,
        image: item.image,
        displayPriority: item.displayPriority || 99
      });
    });
  };

  return (
    <AdminStateContext.Provider value={{
      products: productsList,
      setProducts: (() => {}) as any,
      orders: ordersList,
      setOrders: (() => {}) as any,
      customOrders,
      setCustomOrders,
      customers,
      setCustomers,
      settings: db.settings as any,
      setSettings: updateSettingsState as any,
      gallery: galleryList,
      setGallery: updateGalleryState as any,
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
