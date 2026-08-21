import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number | Record<string, number>;
  category: string;
  status?: string;
  isEggless?: boolean;
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (id: string) => boolean;
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: Omit<WishlistItem, 'addedAt'>) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mg_bakery_wishlist';

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
    // quota exceeded
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() =>
    safeGet<WishlistItem[]>(STORAGE_KEY, [])
  );

  // Persist to localStorage
  useEffect(() => {
    safeSet(STORAGE_KEY, wishlistItems);
  }, [wishlistItems]);

  const isInWishlist = useCallback(
    (id: string) => wishlistItems.some(item => item.id === id),
    [wishlistItems]
  );

  const addToWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    setWishlistItems(prev => {
      if (prev.some(w => w.id === item.id)) return prev; // no duplicate
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    setWishlistItems(prev => {
      const exists = prev.some(w => w.id === item.id);
      if (exists) return prev.filter(w => w.id !== item.id);
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
