import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItemCustomizations {
  flavor?: string;
  eggPreference?: string; // 'Egg' | 'Eggless'
  cakeMessage?: string;
  [key: string]: string | undefined;
}

export interface CartItem {
  id: string;                       // original product id
  name: string;
  image: string;
  selectedWeight: string;           // 'Slice', '½ Kg', '1 Kg', or 'Standard'
  price: number;                    // price for the selected weight/tier
  quantity: number;
  customizations?: CartItemCustomizations;
  category?: string;
}

export interface SavedItem extends CartItem {
  savedAt: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  title: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextType {
  cartItems: CartItem[];
  savedItems: SavedItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  appliedCoupon: AppliedCoupon | null;
  couponDiscount: number;

  // Cart operations
  addToCart: (product: Product, selectedWeight: string, quantity?: number, customizations?: CartItemCustomizations) => void;
  removeFromCart: (id: string, selectedWeight: string) => void;
  updateQuantity: (id: string, selectedWeight: string, delta: number) => void;
  clearCart: () => void;

  // Save for Later
  saveForLater: (id: string, selectedWeight: string) => void;
  moveToCart: (id: string, selectedWeight: string) => void;
  removeSavedItem: (id: string, selectedWeight: string) => void;

  // Buy Now (temporary single-product checkout)
  buyNow: (product: Product, selectedWeight: string, quantity?: number, customizations?: CartItemCustomizations) => void;
  buyNowItem: CartItem | null;
  clearBuyNow: () => void;

  // Coupons
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;

  // Totals
  totalItemsCount: number;
  totalAmount: number;
  finalTotal: (deliveryFee: number) => number;
}

// ─── Storage Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY_CART = 'mg_bakery_cart';
const STORAGE_KEY_SAVED = 'mg_bakery_saved_items';
const STORAGE_KEY_COUPON = 'mg_bakery_coupon';
const STORAGE_KEY_BUYNOW = 'mg_bakery_buynow';

const safeGet = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — fail silently
  }
};

// ─── Price Resolution ─────────────────────────────────────────────────────────

export const resolvePrice = (product: Product, selectedWeight: string): number => {
  if (typeof product.price === 'number') return product.price;
  const priceObj = product.price as Record<string, number>;
  if (selectedWeight === 'Slice') return priceObj.piece || 0;
  if (selectedWeight === '½ Kg') return priceObj.halfKg || 0;
  if (selectedWeight === '1 Kg') return priceObj.oneKg || 0;
  if (selectedWeight === '1.5 Kg') return Math.round((priceObj.oneKg || 0) * 1.5);
  if (selectedWeight === '2 Kg') return (priceObj.oneKg || 0) * 2;
  return priceObj.single || priceObj.halfKg || priceObj.piece || priceObj.oneKg || 0;
};

// ─── Context & Provider ───────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => safeGet(STORAGE_KEY_CART, []));
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => safeGet(STORAGE_KEY_SAVED, []));
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => safeGet(STORAGE_KEY_COUPON, null));
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(() => safeGet(STORAGE_KEY_BUYNOW, null));
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ── Persist to localStorage ───────────────────────────────────────────────

  useEffect(() => { safeSet(STORAGE_KEY_CART, cartItems); }, [cartItems]);
  useEffect(() => { safeSet(STORAGE_KEY_SAVED, savedItems); }, [savedItems]);
  useEffect(() => { safeSet(STORAGE_KEY_COUPON, appliedCoupon); }, [appliedCoupon]);
  useEffect(() => { safeSet(STORAGE_KEY_BUYNOW, buyNowItem); }, [buyNowItem]);

  // ── Cart Operations ───────────────────────────────────────────────────────

  const addToCart = useCallback((
    product: Product,
    selectedWeight: string,
    quantity = 1,
    customizations?: CartItemCustomizations
  ) => {
    const itemPrice = resolvePrice(product, selectedWeight);

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.selectedWeight === selectedWeight
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          // Merge customizations if provided
          customizations: customizations ?? updated[existingIndex].customizations,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        selectedWeight,
        price: itemPrice,
        quantity,
        customizations,
        category: product.category,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((id: string, selectedWeight: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedWeight === selectedWeight)));
  }, []);

  const updateQuantity = useCallback((id: string, selectedWeight: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === id && item.selectedWeight === selectedWeight) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ── Save for Later ────────────────────────────────────────────────────────

  const saveForLater = useCallback((id: string, selectedWeight: string) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === id && i.selectedWeight === selectedWeight);
      if (!item) return prev;

      setSavedItems(saved => {
        const alreadySaved = saved.some(s => s.id === id && s.selectedWeight === selectedWeight);
        if (alreadySaved) return saved;
        const savedItem: SavedItem = { ...item, savedAt: new Date().toISOString() };
        return [...saved, savedItem];
      });

      return prev.filter(i => !(i.id === id && i.selectedWeight === selectedWeight));
    });
  }, []);

  const moveToCart = useCallback((id: string, selectedWeight: string) => {
    setSavedItems(prev => {
      const item = prev.find(s => s.id === id && s.selectedWeight === selectedWeight);
      if (!item) return prev;

      setCartItems(cart => {
        const existingIndex = cart.findIndex(c => c.id === id && c.selectedWeight === selectedWeight);
        if (existingIndex > -1) {
          const updated = [...cart];
          updated[existingIndex].quantity += item.quantity;
          return updated;
        }
        const { savedAt: _savedAt, ...cartItem } = item;
        return [...cart, cartItem];
      });

      return prev.filter(s => !(s.id === id && s.selectedWeight === selectedWeight));
    });
  }, []);

  const removeSavedItem = useCallback((id: string, selectedWeight: string) => {
    setSavedItems(prev => prev.filter(s => !(s.id === id && s.selectedWeight === selectedWeight)));
  }, []);

  // ── Buy Now ───────────────────────────────────────────────────────────────

  const buyNow = useCallback((
    product: Product,
    selectedWeight: string,
    quantity = 1,
    customizations?: CartItemCustomizations
  ) => {
    const itemPrice = resolvePrice(product, selectedWeight);
    const item: CartItem = {
      id: product.id,
      name: product.name,
      image: product.image,
      selectedWeight,
      price: itemPrice,
      quantity,
      customizations,
      category: product.category,
    };
    setBuyNowItem(item);
  }, []);

  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null);
  }, []);

  // ── Coupons ───────────────────────────────────────────────────────────────

  const applyCoupon = useCallback((coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // ── Totals ────────────────────────────────────────────────────────────────

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.min(
          Math.round((totalAmount * appliedCoupon.discountValue) / 100),
          // cap at max_discount if applicable — stored in title for now
          Infinity
        )
      : appliedCoupon.discountValue
    : 0;

  const finalTotal = useCallback((deliveryFee: number) => {
    return Math.max(0, totalAmount - couponDiscount + deliveryFee);
  }, [totalAmount, couponDiscount]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        couponDiscount,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        saveForLater,
        moveToCart,
        removeSavedItem,

        buyNow,
        buyNowItem,
        clearBuyNow,

        applyCoupon,
        removeCoupon,

        totalItemsCount,
        totalAmount,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
