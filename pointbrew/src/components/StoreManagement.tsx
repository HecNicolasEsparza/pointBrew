'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Store {
  store_id: number;
  name: string;
  description: string;
  branch_name: string;
  branch_address: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface StoreManagementProps {
  getStoreImage?: (store: Store) => string;
}

export default function StoreManagement({ getStoreImage }: StoreManagementProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/stores');
      
      if (response.data.success) {
        setStores(response.data.data);
      } else {
        setError('Error al cargar las tiendas');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const isUserAdmin = () => {
    return user && user.role_name === 'Admin';
  };

  const handleEditMenu = (storeId: number) => {
    // Navegar a la página de edición de menú (la crearemos después)
    router.push(`/store/${storeId}/menu-edit`);
  };

  const handleViewStore = (storeId: number) => {
    // Navegar a la vista de la tienda
    router.push(`/store/${storeId}`);
  };

  const getDefaultStoreImage = (store: Store): string => {
    // Use custom image if available
    if (store.image_url && store.image_url.trim() !== '') {
      return store.image_url;
    }
    // Fallback to default image
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  if (loading) {
    return (
      <div className="store-management-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tiendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-management-error">
        <p>{error}</p>
        <button onClick={fetchStores} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="store-management">
      <div className="store-management-header">
        <h2>Todas las Tiendas Registradas</h2>
        <p>{stores.length} tienda{stores.length !== 1 ? 's' : ''} disponible{stores.length !== 1 ? 's' : ''}</p>
      </div>

      {stores.length === 0 ? (
        <div className="no-stores">
          <p>No hay tiendas registradas aún.</p>
          {isAuthenticated && (
            <button 
              onClick={() => router.push('/register-store')}
              className="register-store-btn"
            >
              Registrar primera tienda
            </button>
          )}
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div key={store.store_id} className="store-card">
              <div className="store-image-container">
                <img 
                  src={getDefaultStoreImage(store)} 
                  alt={store.name}
                  className="store-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                  }}
                />
                <div className="store-overlay">
                  <button 
                    onClick={() => handleViewStore(store.store_id)}
                    className="visit-store-btn"
                  >
                    Visitar Tienda
                  </button>
                </div>
              </div>
              
              <div className="store-info">
                <h3 className="store-name">{store.name}</h3>
                <p className="store-description">
                  {store.description || 'Descubre nuestros deliciosos productos'}
                </p>
                <div className="store-location">
                  <span className="location-icon">📍</span>
                  <div>
                    <div className="branch-name">{store.branch_name}</div>
                    <div className="branch-address">{store.branch_address}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
