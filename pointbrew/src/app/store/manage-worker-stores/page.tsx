'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
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
      <div className="manage-stores-container">
        <div className="manage-stores-header">
          <button 
            onClick={() => router.push('/')}
            className="back-btn"
          >
            ← Volver al inicio
          </button>
          <h1>Tiendas en las que trabajo</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tus tiendas...</p>
          </div>
        ) : (
          <div className="manage-stores-content">
            {stores.length === 0 ? (
              <div className="no-stores">
                <div className="no-stores-icon">🏪</div>
                <h3>No tienes tiendas asignadas</h3>
                <p>Contacta con tu administrador para que te asigne a una tienda.</p>
              </div>
            ) : (
              <>
                <div className="stores-summary">
                  <div className="summary-card">
                    <h3>{stores.length}</h3>
                    <p>Tienda{stores.length !== 1 ? 's' : ''} Asignada{stores.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="summary-card">
                    <h3>{user?.full_name}</h3>
                    <p>Empleado</p>
                  </div>
                </div>

                <div className="stores-grid">
                  {stores.map((store) => (
                    <div key={store.store_id} style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={getStoreImage(store)} 
                          alt={store.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Empleado
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px' }}>
                        <h3 style={{
                          margin: '0 0 8px 0',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1F2937'
                        }}>
                          {store.name}
                        </h3>
                        <p style={{
                          margin: '0 0 12px 0',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}>
                          {store.description || 'Sin descripción'}
                        </p>
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ fontSize: '14px', color: '#1F2937' }}>
                            {store.branch_name}
                          </strong>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {store.branch_address}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#9CA3AF',
                          marginBottom: '16px'
                        }}>
                          <div>Registrada: {new Date(store.created_at).toLocaleDateString('es-ES')}</div>
                          {store.updated_at !== store.created_at && (
                            <div>Actualizada: {new Date(store.updated_at).toLocaleDateString('es-ES')}</div>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <button 
                            onClick={() => handleViewStore(store.store_id)}
                            style={{
                              backgroundColor: '#6B7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            title="Ver tienda pública"
                          >
                            👁️ Ver Tienda
                          </button>
                          
                          <button 
                            onClick={() => handleEditMenu(store.store_id)}
                            style={{
                              backgroundColor: '#3B82F6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            title="Administrar menú de productos"
                          >
                            📋 Editar Menú
                          </button>

                          <button 
                            onClick={() => router.push(`/store/manage-customers-turns?storeId=${store.store_id}`)}
                            style={{
                              backgroundColor: '#10B981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
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