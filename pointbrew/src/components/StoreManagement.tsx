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
  created_at: string;
}

export default function StoreManagement() {
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

  const getStoreImage = (storeName: string): string => {
    if (storeName.toLowerCase().includes('kfc') || storeName.toLowerCase().includes('pollo')) {
      return "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (storeName.toLowerCase().includes('hamburguesa') || storeName.toLowerCase().includes('burger')) {
      return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (storeName.toLowerCase().includes('pizza')) {
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (storeName.toLowerCase().includes('café') || storeName.toLowerCase().includes('coffee')) {
      return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else {
      return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    }
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
                  src={getStoreImage(store.name)} 
                  alt={store.name}
                  className="store-image"
                />
              </div>
              
              <div className="store-info">
                <h3 className="store-name">{store.name}</h3>
                <p className="store-description">{store.description || 'Sin descripción'}</p>
                <div className="store-location">
                  <strong>{store.branch_name}</strong>
                  <span>{store.branch_address}</span>
                </div>
                <p className="store-date">
                  Registrada: {new Date(store.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="store-actions">
                <button 
                  onClick={() => handleViewStore(store.store_id)}
                  className="view-btn"
                >
                  Ver Tienda
                </button>
                
                {isUserAdmin() && (
                  <button 
                    onClick={() => handleEditMenu(store.store_id)}
                    className="edit-menu-btn"
                  >
                    Editar Menú
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
