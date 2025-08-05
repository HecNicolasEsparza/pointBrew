'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import './manage-turns.css';

interface Order {
  order_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  status: string;
}

export default function ManageCustomersTurns() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock data para mostrar el esqueleto
  const mockOrders: Order[] = [
    {
      order_id: 1,
      product_name: "Caldo de Iguana",
      product_image: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quantity: 10,
      status: "pendiente"
    },
    {
      order_id: 2,
      product_name: "Pollo Asado",
      product_image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quantity: 4,
      status: "en_preparacion"
    },
    {
      order_id: 3,
      product_name: "Que Tiras",
      product_image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quantity: 2,
      status: "pendiente"
    },
    {
      order_id: 4,
      product_name: "Coca",
      product_image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quantity: 10,
      status: "completado"
    }
  ];

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

    // Simular carga de datos
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, [isAuthenticated, user, router, storeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return '#FCD34D';
      case 'en_preparacion':
        return '#60A5FA';
      case 'completado':
        return '#34D399';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_preparacion':
        return 'En Preparación';
      case 'completado':
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  if (!isAuthenticated || user?.role_name !== 'Employee') {
    return null;
  }

  return (
    <MockupLayout title="Gestión de Turnos - Point Brew" showAuthButtons={true}>
      <div className="manage-turns-container">
        <div className="manage-turns-header">
          <button 
            onClick={() => router.push('/store/manage-worker-stores')}
            className="back-btn"
          >
            ← Volver a mis tiendas
          </button>
          <h1>Órdenes que podrían tener</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando órdenes...</p>
          </div>
        ) : (
          <div className="orders-content">
            <div className="orders-table">
              <div className="table-header">
                <div className="header-cell image-col">Imagen</div>
                <div className="header-cell name-col">Nombre de Producto</div>
                <div className="header-cell quantity-col">Productos por Preparar</div>
                <div className="header-cell status-col">Estado</div>
              </div>
              
              <div className="table-body">
                {orders.map((order) => (
                  <div key={order.order_id} className="table-row">
                    <div className="table-cell image-col">
                      <img 
                        src={order.product_image} 
                        alt={order.product_name}
                        className="product-image"
                      />
                    </div>
                    <div className="table-cell name-col">
                      <span className="product-name">{order.product_name}</span>
                    </div>
                    <div className="table-cell quantity-col">
                      <div className="quantity-badge">
                        {order.quantity}
                      </div>
                    </div>
                    <div className="table-cell status-col">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MockupLayout>
  );
}