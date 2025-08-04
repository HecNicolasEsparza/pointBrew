'use client';

import { useState, useEffect, useRef } from 'react';
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

interface StoreUpdateData {
  name: string;
  description: string;
  branch_name: string;
  branch_address: string;
  image_url?: string;
}

export default function ManageStoresPage() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeFormData, setStoreFormData] = useState<StoreUpdateData>({
    name: '',
    description: '',
    branch_name: '',
    branch_address: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role_name !== 'Admin') {
      router.push('/');
      return;
    }
    fetchUserStores();
  }, [isAuthenticated, user]);

  const fetchUserStores = async () => {
    try {
      setLoading(true);
      // Usar el endpoint específico para las tiendas del usuario autenticado
      const response = await axios.get('http://localhost:3001/api/stores/my-stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setStores(response.data.data);
      } else {
        setError('Error al cargar las tiendas');
      }
    } catch (error) {
      console.error('Error fetching user stores:', error);
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

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setStoreFormData({
      name: store.name,
      description: store.description || '',
      branch_name: store.branch_name,
      branch_address: store.branch_address,
      image_url: store.image_url || ''
    });
    setShowConfigModal(true);
    setError('');
    setSuccess('');
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'store_images');
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      
      const imageUrl = await uploadImageToCloudinary(file);
      setStoreFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setStoreFormData(prev => ({
      ...prev,
      image_url: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    try {
      setSubmitting(true);
      setError('');
      
      // Simular actualización exitosa (reemplazar con llamada real a la API cuando esté lista)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar los datos locales de la tienda
      setStores(prevStores => 
        prevStores.map(store => 
          store.store_id === editingStore.store_id 
            ? { ...store, ...storeFormData, updated_at: new Date().toISOString() }
            : store
        )
      );
      
      setSuccess('Configuración actualizada exitosamente');
      setShowConfigModal(false);
      setEditingStore(null);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);

    } catch (error: any) {
      console.error('Error updating store:', error);
      setError('Error al actualizar la tienda');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfigModal(false);
    setEditingStore(null);
    setError('');
    setSuccess('');
  };

  const getStoreImage = (store: Store): string => {
    // Si la tienda tiene una imagen personalizada, usarla
    if (store.image_url) {
      return store.image_url;
    }
    
    // Si no, usar imagen predeterminada basada en el nombre
    if (store.name.toLowerCase().includes('kfc') || store.name.toLowerCase().includes('pollo')) {
      return "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (store.name.toLowerCase().includes('hamburguesa') || store.name.toLowerCase().includes('burger')) {
      return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (store.name.toLowerCase().includes('pizza')) {
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (store.name.toLowerCase().includes('café') || store.name.toLowerCase().includes('coffee')) {
      return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else {
      return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    }
  };

  if (!isAuthenticated || (user && user.role_name !== 'Admin')) {
    return null;
  }

  return (
    <MockupLayout title="Administrar Mis Tiendas" showAuthButtons={true}>
      <div className="manage-stores-container">
        <div className="manage-stores-header">
          <button 
            onClick={() => router.push('/')}
            className="back-btn"
          >
            ← Volver al inicio
          </button>
          <h1>Administrar Mis Tiendas</h1>
          <button 
            onClick={() => router.push('/register-store')}
            className="add-store-btn"
          >
            + Registrar Nueva Tienda
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Configuration Modal */}
        {showConfigModal && editingStore && (
          <div className="modal-overlay">
            <div className="modal-content store-config-modal">
              <div className="modal-header">
                <h2>Configurar Tienda: {editingStore.name}</h2>
                <button 
                  onClick={handleCloseModal}
                  className="close-modal-btn"
                  aria-label="Cerrar modal"
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateStore} className="store-config-form">
                {/* Image Upload Section */}
                <div className="image-upload-container">
                  <label className="image-upload-label">Imagen de la Tienda</label>
                  
                  <div className="image-upload-area">
                    {storeFormData.image_url ? (
                      <div className="image-preview">
                        <img 
                          src={storeFormData.image_url} 
                          alt="Preview" 
                          className="preview-image" 
                        />
                        <div className="image-overlay">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="image-action-btn"
                            disabled={uploadingImage}
                          >
                            Cambiar
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="image-action-btn"
                            disabled={uploadingImage}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📷</div>
                        <h4>Subir imagen de la tienda</h4>
                        <p>Selecciona una imagen para tu tienda (máx. 5MB)</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="upload-btn"
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? 'Subiendo...' : 'Seleccionar Imagen'}
                        </button>
                      </div>
                    )}
                    
                    {uploadingImage && (
                      <div className="uploading-overlay">
                        <div className="upload-progress">
                          <div className="upload-spinner"></div>
                          <span className="upload-text">Subiendo imagen...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="upload-file-input"
                    disabled={uploadingImage || submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="store-name">Nombre de la Tienda *</label>
                  <input
                    type="text"
                    id="store-name"
                    value={storeFormData.name}
                    onChange={(e) => setStoreFormData({
                      ...storeFormData,
                      name: e.target.value
                    })}
                    required
                    maxLength={100}
                    placeholder="Ej: Mi Restaurante"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="store-description">Descripción</label>
                  <textarea
                    id="store-description"
                    value={storeFormData.description}
                    onChange={(e) => setStoreFormData({
                      ...storeFormData,
                      description: e.target.value
                    })}
                    maxLength={500}
                    rows={3}
                    placeholder="Describe tu tienda..."
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="branch-name">Nombre de la Sucursal *</label>
                  <input
                    type="text"
                    id="branch-name"
                    value={storeFormData.branch_name}
                    onChange={(e) => setStoreFormData({
                      ...storeFormData,
                      branch_name: e.target.value
                    })}
                    required
                    maxLength={100}
                    placeholder="Ej: Sucursal Centro"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="branch-address">Dirección de la Sucursal *</label>
                  <input
                    type="text"
                    id="branch-address"
                    value={storeFormData.branch_address}
                    onChange={(e) => setStoreFormData({
                      ...storeFormData,
                      branch_address: e.target.value
                    })}
                    required
                    maxLength={200}
                    placeholder="Ej: Av. Principal #123, Col. Centro"
                    disabled={submitting}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="cancel-btn"
                    disabled={submitting || uploadingImage}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="save-btn"
                    disabled={submitting || uploadingImage}
                  >
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                <h3>No tienes tiendas registradas</h3>
                <p>Registra tu primera tienda para comenzar a administrar tu negocio.</p>
                <button 
                  onClick={() => router.push('/register-store')}
                  className="register-first-store-btn"
                >
                  Registrar Primera Tienda
                </button>
              </div>
            ) : (
              <>
                <div className="stores-summary">
                  <div className="summary-card">
                    <h3>{stores.length}</h3>
                    <p>Tienda{stores.length !== 1 ? 's' : ''} Registrada{stores.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="summary-card">
                    <h3>{user?.full_name}</h3>
                    <p>Administrador</p>
                  </div>
                </div>

                <div className="stores-grid">
                  {stores.map((store) => (
                    <div key={store.store_id} className="store-management-card">
                      <div className="store-image-container">
                        <img 
                          src={getStoreImage(store)} 
                          alt={store.name}
                          className="store-image"
                        />
                        <div className="store-status-badge">
                          <span className="status-active">Activa</span>
                        </div>
                      </div>
                      
                      <div className="store-info">
                        <h3 className="store-name">{store.name}</h3>
                        <p className="store-description">{store.description || 'Sin descripción'}</p>
                        <div className="store-location">
                          <strong>{store.branch_name}</strong>
                          <span>{store.branch_address}</span>
                        </div>
                        <div className="store-dates">
                          <small>Registrada: {new Date(store.created_at).toLocaleDateString('es-ES')}</small>
                          {store.updated_at !== store.created_at && (
                            <small>Actualizada: {new Date(store.updated_at).toLocaleDateString('es-ES')}</small>
                          )}
                        </div>
                      </div>

                      <div className="store-management-actions">
                        <button 
                          onClick={() => handleViewStore(store.store_id)}
                          className="view-store-btn"
                          title="Ver tienda pública"
                        >
                          👁️ Ver Tienda
                        </button>
                        
                        <button 
                          onClick={() => handleEditMenu(store.store_id)}
                          className="edit-menu-btn"
                          title="Administrar menú de productos"
                        >
                          📋 Editar Menú
                        </button>
                        
                        <button 
                          onClick={() => handleEditStore(store)}
                          className="edit-store-btn"
                          title="Configurar información de la tienda"
                        >
                          ⚙️ Configurar
                        </button>
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
