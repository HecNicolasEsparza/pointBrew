"use client";
import './orders.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaCreditCard, FaEye } from 'react-icons/fa';
import axios from 'axios';

interface OrderProduct {
  quantity: number;
  unit_price: number;
  product_name: string;
  product_image?: string;
  subtotal: number;
}

interface Order {
  ticket_id: number;
  total_amount: number;
  ticket_date: string;
  created_at: string;
  store_name: string;
  store_image?: string;
  branch_name: string;
  branch_address: string;
  payment_method: string;
  payment_status: string;
  products: OrderProduct[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user?.user_id) {
      fetchUserOrders();
    }
  }, [isAuthenticated, user?.user_id, router]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:3001/api/orders/user/${user?.user_id}`);
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError('Error al cargar los pedidos');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completado':
        return '#28a745';
      case 'pending':
      case 'pendiente':
        return '#ffc107';
      case 'failed':
      case 'fallido':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <MockupLayout title="Mis Pedidos - Point Brew" showAuthButtons={true}>
        <div className="orders-container">
          <div className="loading-state">
            <p>Cargando tus pedidos...</p>
          </div>
        </div>
      </MockupLayout>
    );
  }

  return (
    <MockupLayout title="Mis Pedidos - Point Brew" showAuthButtons={true}>
      <div className="orders-container">
        <h1 className="orders-title">Mis Pedidos</h1>
        
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchUserOrders} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}
        
        {!error && orders.length === 0 ? (
          <div className="empty-orders">
            <FaShoppingBag className="empty-icon" />
            <h2>No tienes pedidos aún</h2>
            <p>Cuando realices tu primer pedido, aparecerá aquí</p>
            <button 
              onClick={() => router.push('/')} 
              className="start-shopping-btn"
            >
              Comenzar a Comprar
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.ticket_id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Pedido #{order.ticket_id}</h3>
                    <div className="order-meta">
                      <span className="order-date">
                        <FaCalendarAlt /> {formatDate(order.created_at)}
                      </span>
                      <span className="order-store">
                        <FaMapMarkerAlt /> {order.store_name} - {order.branch_name}
                      </span>
                      <span className="order-payment">
                        <FaCreditCard /> {order.payment_method}
                      </span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.payment_status) }}
                    >
                      {order.payment_status || 'Pendiente'}
                    </span>
                    <div className="order-total">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="order-products">
                  <div className="products-preview">
                    {order.products.slice(0, 3).map((product, index) => (
                      <div key={index} className="product-preview">
                        <img 
                          src={product.product_image || "/img/placeHolderFood.jpg"} 
                          alt={product.product_name}
                          onError={(e) => {
                            e.currentTarget.src = "/img/placeHolderFood.jpg";
                          }}
                        />
                        <div className="product-info">
                          <span className="product-name">{product.product_name}</span>
                          <span className="product-quantity">x{product.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <div className="more-products">
                        +{order.products.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="order-actions">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="view-details-btn"
                  >
                    <FaEye /> Ver Detalles
                  </button>
                  <button 
                    onClick={() => router.push(`/menu/${order.store_name}`)}
                    className="reorder-btn"
                  >
                    Pedir de Nuevo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal de detalles del pedido */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles del Pedido #{selectedOrder.ticket_id}</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="close-modal-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="order-details">
                  <p><strong>Fecha:</strong> {formatDate(selectedOrder.created_at)}</p>
                  <p><strong>Tienda:</strong> {selectedOrder.store_name}</p>
                  <p><strong>Sucursal:</strong> {selectedOrder.branch_name}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.branch_address}</p>
                  <p><strong>Método de pago:</strong> {selectedOrder.payment_method}</p>
                  <p>
                    <strong>Estado:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.payment_status), marginLeft: '0.5rem' }}
                    >
                      {selectedOrder.payment_status || 'Pendiente'}
                    </span>
                  </p>
                </div>
                
                <div className="order-products-detail">
                  <h3>Productos:</h3>
                  {selectedOrder.products.map((product, index) => (
                    <div key={index} className="product-detail">
                      <img 
                        src={product.product_image || "/img/placeHolderFood.jpg"} 
                        alt={product.product_name}
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeHolderFood.jpg";
                        }}
                      />
                      <div className="product-detail-info">
                        <h4>{product.product_name}</h4>
                        <p>Cantidad: {product.quantity}</p>
                        <p>Precio unitario: ${product.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="product-detail-total">
                        ${product.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-total-detail">
                  <h3>Total: ${selectedOrder.total_amount.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MockupLayout>
  );
}