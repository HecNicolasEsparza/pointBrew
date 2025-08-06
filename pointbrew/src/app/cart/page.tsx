"use client";
import './cart.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

interface CartItem {
  cart_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
  subtotal: number;
}

interface CartData {
  items: CartItem[];
  total: string;
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updating, setUpdating] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      fetchCart();
    }
  }, [isAuthenticated, user, router]);

  const fetchCart = async () => {
    if (!user?.user_id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/cart/${user.user_id}`);
      
      if (response.data.success) {
        setCartData(response.data.data);
      } else {
        setError('Error al cargar el carrito');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    try {
      setUpdating(cartId);
      
      if (newQuantity === 0) {
        // Eliminar item del carrito
        await axios.delete(`http://localhost:3001/api/cart/${cartId}`);
      } else {
        // Actualizar cantidad
        await axios.put(`http://localhost:3001/api/cart/${cartId}`, {
          quantity: newQuantity
        });
      }
      
      // Refrescar carrito
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Error al actualizar el carrito');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      return;
    }
    
    await updateQuantity(cartId, 0);
  };

  const clearCart = async () => {
    if (!user?.user_id) return;
    
    if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3001/api/cart/clear/${user.user_id}`);
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error al vaciar el carrito');
    }
  };

  const proceedToCheckout = async () => {
    if (!user?.user_id || !cartData?.items.length) return;
    
    // Por ahora, usaremos la primera tienda de los productos como storeId
    const storeId = 1; // Esto debería ser dinámico basado en los productos
    
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/cart/checkout', {
        userId: user.user_id,
        storeId: storeId
      });
      
      if (response.data.success) {
        alert(`¡Pedido realizado exitosamente! Ticket ID: ${response.data.data.ticketId}`);
        router.push('/orders'); // Redireccionar a página de pedidos
      } else {
        alert('Error al procesar el pedido');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MockupLayout title="Carrito - Point Brew" showAuthButtons={true}>
        <div className="cart-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando carrito...</p>
          </div>
        </div>
      </MockupLayout>
    );
  }

  if (error) {
    return (
      <MockupLayout title="Error - Point Brew" showAuthButtons={true}>
        <div className="cart-container">
          <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => router.push('/')} className="back-btn">
              Volver al inicio
            </button>
          </div>
        </div>
      </MockupLayout>
    );
  }

  return (
    <MockupLayout title="Mi Carrito - Point Brew" showAuthButtons={true}>
      <div className="cart-container">
        <div className="cart-header">
          <h1>Mi Carrito</h1>
          {(cartData?.items?.length ?? 0) > 0 && (
            <button onClick={clearCart} className="clear-cart-btn">
              Vaciar Carrito
            </button>
          )}
        </div>

        {!cartData?.items.length ? (
          <div className="empty-cart">
            <h3>Tu carrito está vacío</h3>
            <p>Agrega algunos productos para empezar</p>
            <button onClick={() => router.push('/')} className="continue-shopping-btn">
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartData.items.map((item) => (
                <div key={item.cart_id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.image_url || "/img/placeHolderFood.jpg"}
                      alt={item.product_name}
                      onError={(e) => {
                        e.currentTarget.src = "/img/placeHolderFood.jpg";
                      }}
                    />
                  </div>
                  
                  <div className="item-details">
                    <h4 className="item-name">{item.product_name}</h4>
                    <p className="item-price">${item.price}</p>
                  </div>
                  
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                      disabled={updating === item.cart_id}
                      className="quantity-btn"
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                      disabled={updating === item.cart_id}
                      className="quantity-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div className="item-subtotal">
                    <p>${item.subtotal.toFixed(2)}</p>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.cart_id)}
                    disabled={updating === item.cart_id}
                    className="remove-btn"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-content">
                <div className="total-section">
                  <h3>Total: ${cartData.total}</h3>
                </div>
                <div className="checkout-actions">
                  <button 
                    onClick={() => router.push('/')} 
                    className="continue-shopping-btn"
                  >
                    Continuar Comprando
                  </button>
                  <button 
                    onClick={proceedToCheckout}
                    className="checkout-btn"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Proceder al Pago'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MockupLayout>
  );
}