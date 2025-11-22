import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
        console.log('Cart loaded from localStorage:', parsed);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      console.log('Cart saved to localStorage:', cartItems);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.itemId}_${item.memberIds.join('_')}`;
    
    // For classes, sports, and events, always set quantity to 1
    const quantity = ['class', 'sport', 'event'].includes(item.itemType) ? 1 : item.quantity;
    
    // Check if item already exists
    const existingItem = cartItems.find((i) => i.id === id);
    
    if (existingItem) {
      // For non-membership items, don't increment quantity - they're already in cart
      if (['class', 'sport', 'event'].includes(item.itemType)) {
        return; // Don't add duplicate
      }
      // Update quantity for memberships
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + quantity } : i
        )
      );
    } else {
      // Add new item with enforced quantity
      setCartItems((prev) => [...prev, { ...item, id, quantity }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          // Prevent quantity changes for classes, sports, and events
          if (item.id === itemId) {
            if (['class', 'sport', 'event'].includes(item.itemType)) {
              return item; // Keep quantity at 1
            }
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

