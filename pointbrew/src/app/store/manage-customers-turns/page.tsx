'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';
import './manage-turns.css';

interface Order {
  order_id: number;
  ticket_id?: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  status: string;
  customer_name?: string;
  created_at: string;
  updated_at?: string;
  store_id: number;
  store_name?: string;
}

interface StoreInfo {
  store_id: number;
  name: string;
  description?: string;
}

export default function ManageCustomersTurns() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user?.role_name !== 'Employee') {
      router.push('/');
      return;
    }

    if (!storeId) {
      router.push('/store/manage-worker-stores');
      return;
    }

    fetchStoreOrders();
    fetchStoreInfo();
  }, [isAuthenticated, user, router, storeId, token]);

  const fetchStoreInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/stores/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setStoreInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const fetchStoreOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:3001/api/orders/store/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setError('Error al cargar las órdenes de la tienda');
      }
    } catch (error) {
      console.error('Error fetching store orders:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(orderId);
      
      const response = await axios.patch(
        `http://localhost:3001/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Actualizar el estado local para todos los productos del mismo ticket
        const ticketId = response.data.data.ticketId;
        setOrders(prevOrders => 
          prevOrders.map(order => {
            // Si el order_id contiene el ticketId, actualizar su estado
            const orderTicketId = order.order_id.toString().includes('_') 
              ? parseInt(order.order_id.toString().split('_')[0]) 
              : order.order_id;
            
            return orderTicketId === ticketId
              ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
              : order;
          })
        );
        
        // Mostrar mensaje de confirmación
        alert(`Estado actualizado a: ${getStatusText(newStatus)}`);
      } else {
        alert('Error al actualizar el estado de la orden');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado de la orden');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return '#FCD34D';
      case 'preparing':
      case 'en_preparacion':
      case 'in_progress':
        return '#60A5FA';
      case 'ready':
      case 'listo':
        return '#10B981';
      case 'completed':
      case 'completado':
        return '#34D399';
      case 'cancelled':
      case 'cancelado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return 'Pendiente';
      case 'preparing':
      case 'en_preparacion':
      case 'in_progress':
        return 'En Preparación';
      case 'ready':
      case 'listo':
        return 'Listo';
      case 'completed':
      case 'completado':
        return 'Completado';
      case 'cancelled':
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    const status = currentStatus.toLowerCase();
    switch (status) {
      case 'pending':
      case 'pendiente':
        return ['preparing', 'cancelled'];
      case 'preparing':
      case 'en_preparacion':
      case 'in_progress':
        return ['ready', 'cancelled'];
      case 'ready':
      case 'listo':
        return ['completed'];
      default:
        return [];
    }
  };

  const getProductImage = (order: Order): string => {
    if (order.product_image && order.product_image.trim() !== '') {
      return order.product_image;
    }
    return "/img/placeHolderFood.jpg";
  };

  // Agrupar órdenes por ticket para mejor visualización
  const groupOrdersByTicket = (orders: Order[]) => {
    const grouped = orders.reduce((acc, order) => {
      const ticketId = order.ticket_id || 'unknown';
      if (!acc[ticketId]) {
        acc[ticketId] = [];
      }
      acc[ticketId].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
    
    return Object.values(grouped);
  };

  const groupedOrders = groupOrdersByTicket(orders);

  if (!isAuthenticated || user?.role_name !== 'Employee') {
    return null;
  }

  return (
    <MockupLayout title="Gestión de Órdenes - Point Brew" showAuthButtons={true}>
      <div className="manage-turns-container">
        <div className="manage-turns-header">
          <button 
            onClick={() => router.push('/store/manage-worker-stores')}
            className="back-btn"
          >
            ← Volver a mis tiendas
          </button>
          <div className="header-info">
            <h1>Órdenes de {storeInfo?.name || 'la Tienda'}</h1>
            {orders.length > 0 && (
              <div className="orders-summary">
                <span className="total-orders">{orders.length} órdenes</span>
                <span className="pending-orders">
                  {orders.filter(o => ['pending', 'pendiente'].includes(o.status.toLowerCase())).length} pendientes
                </span>
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando órdenes...</p>
          </div>
        ) : (
          <div className="orders-content">
            {orders.length === 0 ? (
              <div className="no-orders">
                <div className="no-orders-icon">📋</div>
                <h3>No hay órdenes para esta tienda</h3>
                <p>Las nuevas órdenes aparecerán aquí cuando los clientes realicen pedidos.</p>
                <button 
                  onClick={fetchStoreOrders}
                  className="refresh-btn"
                >
                  🔄 Actualizar
                </button>
              </div>
            ) : (
              <div className="orders-table">
                <div className="table-header">
                  <div className="header-cell image-col">Productos</div>
                  <div className="header-cell name-col">Detalles del Pedido</div>
                  <div className="header-cell quantity-col">Items</div>
                  <div className="header-cell status-col">Estado</div>
                  <div className="header-cell actions-col">Acciones</div>
                </div>
                
                <div className="table-body">
                  {groupedOrders.map((ticketOrders, index) => {
                    const firstOrder = ticketOrders[0];
                    const totalItems = ticketOrders.reduce((sum, order) => sum + order.quantity, 0);
                    
                    return (
                      <div key={`ticket-${firstOrder.ticket_id}-${index}`} className="table-row ticket-group">
                        <div className="table-cell image-col">
                          <div className="product-images">
                            {ticketOrders.slice(0, 3).map((order, i) => (
                              <img 
                                key={i}
                                src={getProductImage(order)} 
                                alt={order.product_name}
                                className="product-image-small"
                                onError={(e) => {
                                  e.currentTarget.src = "/img/placeHolderFood.jpg";
                                }}
                              />
                            ))}
                            {ticketOrders.length > 3 && (
                              <div className="more-products">+{ticketOrders.length - 3}</div>
                            )}
                          </div>
                        </div>
                        <div className="table-cell name-col">
                          <div className="order-details">
                            <div className="ticket-info">
                              <span className="ticket-id">Orden #{firstOrder.ticket_id}</span>
                              {firstOrder.customer_name && (
                                <span className="customer-name">Cliente: {firstOrder.customer_name}</span>
                              )}
                            </div>
                            <div className="products-list">
                              {ticketOrders.map((order, i) => (
                                <span key={i} className="product-item">
                                  {order.product_name} ({order.quantity})
                                  {i < ticketOrders.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                            <span className="order-date">
                              {new Date(firstOrder.created_at).toLocaleString('es-ES')}
                            </span>
                          </div>
                        </div>
                        <div className="table-cell quantity-col">
                          <div className="quantity-badge">
                            {totalItems}
                          </div>
                        </div>
                        <div className="table-cell status-col">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(firstOrder.status) }}
                          >
                            {getStatusText(firstOrder.status)}
                          </span>
                        </div>
                        <div className="table-cell actions-col">
                          <div className="order-actions">
                            {getAvailableStatusOptions(firstOrder.status).map((statusOption) => (
                              <button
                                key={statusOption}
                                onClick={() => updateOrderStatus(firstOrder.order_id, statusOption)}
                                disabled={updating === firstOrder.order_id}
                                className={`status-btn status-${statusOption}`}
                                title={`Marcar como ${getStatusText(statusOption)}`}
                              >
                                {updating === firstOrder.order_id ? '...' : getStatusText(statusOption)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="refresh-section">
              <button 
                onClick={fetchStoreOrders}
                className="refresh-orders-btn"
                disabled={loading}
              >
                🔄 Actualizar Órdenes
              </button>
            </div>
          </div>
        )}
      </div>
    </MockupLayout>
  );
}