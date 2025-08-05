"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface CartItem {
  cart_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
  subtotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: string;
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateQuantity: (cartId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const refreshCart = async () => {
    if (!user?.user_id || !isAuthenticated) {
      setCartItems([]);
      setCartTotal('0.00');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/cart/${user.user_id}`);
      
      if (response.data.success) {
        setCartItems(response.data.data.items || []);
        setCartTotal(response.data.data.total || '0.00');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setCartTotal('0.00');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    if (!user?.user_id) return false;

    try {
      const response = await axios.post('http://localhost:3001/api/cart/add', {
        userId: user.user_id,
        productId,
        quantity
      });

      if (response.data.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateQuantity = async (cartId: number, quantity: number): Promise<boolean> => {
    try {
      if (quantity === 0) {
        return await removeFromCart(cartId);
      }

      const response = await axios.put(`http://localhost:3001/api/cart/${cartId}`, {
        quantity
      });

      if (response.data.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const removeFromCart = async (cartId: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`http://localhost:3001/api/cart/${cartId}`);

      if (response.data.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user?.user_id) return false;

    try {
      const response = await axios.delete(`http://localhost:3001/api/cart/clear/${user.user_id}`);

      if (response.data.success) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      setCartItems([]);
      setCartTotal('0.00');
    }
  }, [isAuthenticated, user]);

  const value: CartContextType = {
    cartItems,
    cartTotal,
    cartCount,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};