'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useApi, storesApi } from '@/hooks/useApi';
import axios from 'axios';
import styles from './StoreManagement.module.css';

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
  const { loading, error, execute } = useApi<Store[]>();

  useEffect(() => {
    fetchStores();
  }, [user]); // Add user dependency to refetch when user changes

  const fetchStores = async () => {
    try {
      let response;
      
      // If user is Employee, get only stores where they work
      if (user?.role_name === 'Employee') {
        response = await axios.get('/api/store-employees/my-stores');
        if (response.data.success) {
          setStores(response.data.data);
        }
      } else {
        // For Admin/Customer, get all stores
        response = await execute(() => storesApi.getAll());
        if (response.success) {
          setStores(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      // El error ya está siendo manejado por useApi
    }
  };

  const isUserAdmin = () => {
    return user && user.role_name === 'Admin';
  };

  const isUserEmployee = () => {
    return user && user.role_name === 'Employee';
  };

  // Cambiar esta función para ir directamente al menú
  const handleStoreClick = (storeId: number) => {
    router.push(`/menu/${storeId}`);
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
      <div className={styles.storeManagementLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando tiendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchStores}
        showDetails={true}
      />
    );
  }

  return (
    <div className={styles.storeManagement}>
      {stores.map((store) => (
        <div key={store.store_id} className={styles.storeCard}>
          {/* Hacer clickeable toda la imagen */}
          <div 
            className={styles.storeImageContainer}
            onClick={() => handleStoreClick(store.store_id)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={getStoreImage ? getStoreImage(store) : getDefaultStoreImage(store)}
              alt={store.name}
              className={styles.storeImage}
            />
          </div>

          <div className={styles.storeInfo}>
            <h3 className={styles.storeName}>{store.name}</h3>
            <p className={styles.storeDescription}>{store.description}</p>
            <div className={styles.storeLocation}>
              <span className={styles.locationIcon}>📍</span>
              <div>
                <p className={styles.branchName}>{store.branch_name}</p>
                <p className={styles.branchAddress}>{store.branch_address}</p>
              </div>
            </div>
          </div>

          {/* Eliminar completamente la sección de botones */}
          {/* <div className="store-actions">
            <button onClick={() => handleViewStore(store.store_id)}>
              👁️ Ver Tienda
            </button>
            <button onClick={() => handleViewMenu(store.store_id)}>
              📋 Ver Menú
            </button>
          </div> */}
        </div>
      ))}
    </div>
  );
}
