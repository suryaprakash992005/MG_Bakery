import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  id: string; // original product id
  name: string;
  image: string;
  selectedWeight: string; // 'Slice', '½ Kg', '1 Kg', or 'Standard'
  price: number; // Price of the specific selected tier
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, selectedWeight: string, quantity?: number) => void;
  removeFromCart: (id: string, selectedWeight: string) => void;
  updateQuantity: (id: string, selectedWeight: string, delta: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('mg_bakery_cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('mg_bakery_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (product: Product, selectedWeight: string, quantity: number = 1) => {
    // Determine the price based on selected weight
    let itemPrice = 0;
    if (typeof product.price === 'number') {
      itemPrice = product.price;
    } else {
      const priceObj = product.price as any;
      if (selectedWeight === 'Slice') {
        itemPrice = priceObj.piece || 0;
      } else if (selectedWeight === '½ Kg') {
        itemPrice = priceObj.halfKg || 0;
      } else if (selectedWeight === '1 Kg') {
        itemPrice = priceObj.oneKg || 0;
      } else {
        itemPrice = priceObj.single || priceObj.halfKg || priceObj.piece || priceObj.oneKg || 0;
      }
    }

    setCartItems((prevItems) => {
      // Check if product with the exact same weight already exists
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedWeight === selectedWeight
      );

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      // Add as a new item
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        selectedWeight,
        price: itemPrice,
        quantity,
      };
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (id: string, selectedWeight: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.selectedWeight === selectedWeight))
    );
  };

  const updateQuantity = (id: string, selectedWeight: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id && item.selectedWeight === selectedWeight) {
            const newQuantity = item.quantity + delta;
            return { ...item, quantity: Math.max(1, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
