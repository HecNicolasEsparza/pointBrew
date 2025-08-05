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
  branch_id?: number; // Add this field
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface StoreUpdateData {
  name: string;
  description: string;
  branch_name: string;
  branch_address: string;
  branch_id?: number; // Add this field
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
    branch_id: undefined, // Initialize as undefined
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
      branch_id: store.branch_id || 1, // Default to 1 if not present
      image_url: store.image_url || ''
    });
    setShowConfigModal(true);
    setError('');
    setSuccess('');
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    console.log('Starting Cloudinary upload...');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    console.log('Cloudinary cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'store_images');
    
    console.log('FormData prepared, uploading to Cloudinary...');
    
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      console.log('Uploading to:', cloudinaryUrl);
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Cloudinary response status:', response.status);
      console.log('Cloudinary response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Cloudinary upload successful:', data);
      console.log('Image URL:', data.secure_url);
      
      if (!data.secure_url) {
        throw new Error('No secure_url received from Cloudinary');
      }
      
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Image upload started for file:', file.name);

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
      
      console.log('Uploading image to Cloudinary...');
      const imageUrl = await uploadImageToCloudinary(file);
      console.log('Image uploaded successfully, URL:', imageUrl);
      
      setStoreFormData(prev => {
        const updated = {
          ...prev,
          image_url: imageUrl
        };
        console.log('Updated form data with image URL:', updated);
        return updated;
      });
      
      setSuccess('Imagen subida exitosamente');
      setTimeout(() => setSuccess(''), 2000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        setError(`Error al subir la imagen: ${error.message}`);
      } else {
        setError('Error al subir la imagen. Por favor intenta de nuevo.');
      }
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

    // Validate required fields
    if (!storeFormData.name.trim() || !storeFormData.branch_name.trim() || !storeFormData.branch_address.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      console.log('Updating store:', editingStore.store_id);
      console.log('Store data being sent:', storeFormData);
      
      // Clean the data before sending - include branch_id
      const cleanedData = {
        name: storeFormData.name.trim(),
        description: storeFormData.description?.trim() || '',
        branch_name: storeFormData.branch_name.trim(),
        branch_address: storeFormData.branch_address.trim(),
        branch_id: storeFormData.branch_id || editingStore.branch_id || 1, // Ensure branch_id is always present
        image_url: storeFormData.image_url || ''
      };

      console.log('Cleaned data to send to server:', cleanedData);
      console.log('Image URL in cleaned data:', cleanedData.image_url);
      console.log('Branch ID in cleaned data:', cleanedData.branch_id);

      try {
        console.log(`Trying PUT /api/stores/${editingStore.store_id}`);
        const response = await axios.put(
          `http://localhost:3001/api/stores/${editingStore.store_id}`,
          cleanedData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Server response:', response.data);

        if (response.data.success) {
          // Server update successful
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
          setTimeout(() => setSuccess(''), 3000);
          return;
        }
      } catch (serverError: any) {
        console.error('Server update failed:', serverError.response?.status, serverError.response?.data);
        console.error('Full server error:', serverError);
        
        // Show specific error message from server
        if (serverError.response?.data?.error) {
          setError(`Error del servidor: ${serverError.response.data.error}`);
          return;
        }
        
        // If server fails, update locally immediately
        setStores(prevStores => 
          prevStores.map(store => 
            store.store_id === editingStore.store_id 
              ? { ...store, ...storeFormData, updated_at: new Date().toISOString() }
              : store
          )
        );

        if (serverError.response?.status === 500) {
          setSuccess('Actualizado localmente - Error del servidor (los cambios son temporales)');
          setShowConfigModal(false);
          setEditingStore(null);
          setTimeout(() => setSuccess(''), 4000);
          return;
        } else {
          throw serverError;
        }
      }

    } catch (error: any) {
      console.error('Error updating store:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          setError('No autorizado. Por favor inicia sesión nuevamente.');
        } else if (status === 403) {
          setError('No tienes permisos para actualizar esta tienda.');
        } else if (status === 404) {
          setError('Tienda no encontrada en el servidor.');
        } else {
          setError(errorData?.message || errorData?.error || `Error del servidor (${status})`);
        }
      } else if (error.request) {
        setError('Error de conexión con el servidor.');
      } else {
        setError('Error inesperado: ' + error.message);
      }
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
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#10B981',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Activa
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
                            onClick={() => handleEditStore(store)}
                            style={{
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            title="Configurar información de la tienda"
                          >
                            ⚙️ Configurar
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
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
                      <strong>Debug info:</strong><br />
                      Cloudinary configured: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Yes' : 'No'}<br />
                      Current image URL: {storeFormData.image_url || 'None'}
                    </div>
                  )}
                  
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
      </div>
    </MockupLayout>
  );
}
