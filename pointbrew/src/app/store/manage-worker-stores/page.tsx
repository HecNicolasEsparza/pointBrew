'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';
import styles from './page.module.css';

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

export default function ManageWorkerStores() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (user?.role_name !== 'Employee') {
      router.push('/');
      return;
    }

    fetchWorkerStores();
  }, [isAuthenticated, user, router]);

  const fetchWorkerStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/stores/worker-stores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setStores(response.data.data || []);
      } else {
        setError('Error al cargar las tiendas');
      }
    } catch (error) {
      console.error('Error fetching worker stores:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = (storeId: number) => {
    router.push(`/store/${storeId}/menu-edit`);
  };

  const handleViewStore = (storeId: number) => {
    router.push(`/store/${storeId}`);
  };

  const getStoreImage = (store: Store): string => {
    if (store.image_url && store.image_url.trim() !== '') {
      return store.image_url;
    }
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  if (!isAuthenticated || user?.role_name !== 'Employee') {
    return null;
  }

  return (
    <MockupLayout title="Mis Tiendas de Trabajo - Point Brew" showAuthButtons={true}>
      <div className={styles['manage-stores-container']}>
        <div className={styles['manage-stores-header']}>
          <button 
            onClick={() => router.push('/')}
            className={styles['back-btn']}
          >
            ← Volver al inicio
          </button>
          <h1>Tiendas en las que trabajo</h1>
        </div>

        {error && <div className={styles['error-message']}>{error}</div>}

        {loading ? (
          <div className={styles['loading-container']}>
            <div className={styles['loading-spinner']}></div>
            <p>Cargando tus tiendas...</p>
          </div>
        ) : (
          <div className={styles['manage-stores-content']}>
            {stores.length === 0 ? (
              <div className={styles['no-stores']}>
                <div className={styles['no-stores-icon']}>🏪</div>
                <h3>No tienes tiendas asignadas</h3>
                <p>Contacta con tu administrador para que te asigne a una tienda.</p>
              </div>
            ) : (
              <>
                <div className={styles['stores-summary']}>
                  <div className={styles['summary-card']}>
                    <h3>{stores.length}</h3>
                    <p>Tienda{stores.length !== 1 ? 's' : ''} Asignada{stores.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className={styles['summary-card']}>
                    <h3>{user?.full_name}</h3>
                    <p>Empleado</p>
                  </div>
                </div>

                <div className={styles['stores-grid']}>
                  {stores.map((store) => (
                    <div key={store.store_id} className={styles['store-card']}>
                      <div className={styles['store-image-container']}>
                        <img 
                          src={getStoreImage(store)} 
                          alt={store.name}
                          className={styles['store-image']}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <div className={styles['employee-badge']}>
                          Empleado
                        </div>
                      </div>
                      
                      <div className={styles['store-content']}>
                        <h3 className={styles['store-name']}>
                          {store.name}
                        </h3>
                        <p className={styles['store-description']}>
                          {store.description || 'Sin descripción'}
                        </p>
                        <div className={styles['store-branch']}>
                          <div className={styles['branch-name']}>
                            {store.branch_name}
                          </div>
                          <div className={styles['branch-address']}>
                            {store.branch_address}
                          </div>
                        </div>
                        <div className={styles['store-dates']}>
                          <div>📅 Registrada: {new Date(store.created_at).toLocaleDateString('es-ES')}</div>
                          {store.updated_at !== store.created_at && (
                            <div>🔄 Actualizada: {new Date(store.updated_at).toLocaleDateString('es-ES')}</div>
                          )}
                        </div>

                        <div className={styles['store-actions']}>
                          <button 
                            onClick={() => handleViewStore(store.store_id)}
                            className={`${styles['action-btn']} ${styles['btn-view']}`}
                            title="Ver tienda pública"
                          >
                            👁️ Ver Tienda
                          </button>
                          
                          <button 
                            onClick={() => handleEditMenu(store.store_id)}
                            className={`${styles['action-btn']} ${styles['btn-edit']}`}
                            title="Administrar menú de productos"
                          >
                            📋 Editar Menú
                          </button>

                          <button 
                            onClick={() => router.push(`/store/manage-customers-turns?storeId=${store.store_id}`)}
                            className={`${styles['action-btn']} ${styles['btn-manage']}`}
                            title="Gestionar turnos de clientes"
                          >
                            🎯 Gestionar Turnos
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </MockupLayout>
  );
}