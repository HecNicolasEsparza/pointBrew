"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  cart_id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  price: number;
  image_url?: string;
  store_id: number;
  subtotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: string;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateCartItem: (cartId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Calcular totales
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0).toFixed(2);

  // Cargar carrito del usuario
  const refreshCart = async () => {
    if (!user?.user_id || !isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/cart/${user.user_id}`);
      const data = await response.json();

      if (data.success) {
        setCartItems(data.data.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto al carrito
  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    if (!user?.user_id) return false;

    try {
      const response = await fetch('http://localhost:3001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.user_id,
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart(); // Refrescar carrito después de agregar
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  // Actualizar cantidad de item
  const updateCartItem = async (cartId: number, quantity: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart(); // Refrescar carrito después de actualizar
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  };

  // Eliminar item del carrito
  const removeFromCart = async (cartId: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${cartId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart(); // Refrescar carrito después de eliminar
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  // Limpiar carrito completo
  const clearCart = async (): Promise<void> => {
    if (!user?.user_id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/cart/clear/${user.user_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCartItems([]); // Limpiar inmediatamente en el estado local
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Cargar carrito cuando el usuario cambie
  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user?.user_id, isAuthenticated]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};