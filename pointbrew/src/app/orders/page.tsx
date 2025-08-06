"use client";
import './orders.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import axios from 'axios';

interface Order {
  ticket_id: number;
  total_amount: number;
  ticket_date: string;
  created_at: string;
  status: string; // Estado del pedido (pending, preparing, ready, completed, cancelled)
  store_name: string;
  customer_name?: string;
  customer_email?: string;
  products_summary: string;
  total_items: number;
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
      case 'pending':
      case 'pendiente':
        return '#ffc107'; // Amarillo
      case 'preparing':
      case 'en_preparacion':
      case 'in_progress':
        return '#007bff'; // Azul
      case 'ready':
      case 'listo':
        return '#28a745'; // Verde
      case 'completed':
      case 'completado':
        return '#20c997'; // Verde claro
      case 'cancelled':
      case 'cancelado':
        return '#dc3545'; // Rojo
      default:
        return '#6c757d'; // Gris
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return 'Pendiente';
      case 'preparing':
      case 'en_preparacion':
      case 'in_progress':
        return 'En Preparación';
      case 'ready':
      case 'listo':
        return 'Listo para Recoger';
      case 'completed':
      case 'completado':
        return 'Completado';
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado';
      default:
        return status || 'Pendiente';
    }
  };

  if (loading) {
    return (
      <MockupLayout title="Mis Pedidos - Point Brew" showAuthButtons={true}>
        <div className="orders-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando tus pedidos...</p>
          </div>
        </div>
      </MockupLayout>
    );
  }

  return (
    <MockupLayout title="Mis Pedidos - Point Brew" showAuthButtons={true}>
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">Mis Pedidos</h1>
          <button 
            onClick={fetchUserOrders}
            className="refresh-all-btn"
            disabled={loading}
          >
            🔄 Actualizar Estados
          </button>
        </div>
        
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
                        <FaMapMarkerAlt /> {order.store_name}
                      </span>
                      <span className="order-customer">
                        👤 {order.customer_name || 'Cliente'}
                      </span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <div className="order-total">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="order-products">
                  <div className="products-summary">
                    <span className="products-text">
                      {order.products_summary}
                    </span>
                    <span className="items-count">
                      {order.total_items} item{order.total_items !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="view-details-btn"
                  >
                    <FaEye /> Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles del Pedido #{selectedOrder.ticket_id}</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="order-details">
                  <p><strong>Fecha:</strong> {formatDate(selectedOrder.created_at)}</p>
                  <p><strong>Tienda:</strong> {selectedOrder.store_name}</p>
                  <p><strong>Cliente:</strong> {selectedOrder.customer_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</p>
                  <p>
                    <strong>Estado:</strong>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status), marginLeft: '0.5rem' }}
                    >
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </p>
                </div>

                <div className="order-products-detail">
                  <h3>Productos:</h3>
                  <p>{selectedOrder.products_summary}</p>
                  <p><strong>Total de items:</strong> {selectedOrder.total_items}</p>
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
