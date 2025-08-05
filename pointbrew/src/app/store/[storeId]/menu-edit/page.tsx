'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  category_id?: number;
  image_url?: string;
  is_available: boolean;
}

interface Category {
  category_id: number;
  name: string;
}

export default function MenuEditPage({ params }: { params: Promise<{ storeId: string }> }) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.storeId;
  
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user && user.role_name !== 'Admin') {
      router.push('/');
      return;
    }
    fetchCategories();
    fetchProducts();
  }, [isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 segundos timeout
      });
      
      if (response.data.success && response.data.data.length > 0) {
        setCategories(response.data.data);
      } else {
        setCategories([
          { category_id: 1, name: 'Bebidas' },
          { category_id: 2, name: 'Comida' },
          { category_id: 3, name: 'Postres' },
          { category_id: 4, name: 'Aperitivos' },
          { category_id: 5, name: 'Otro' }
        ]);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      
      // Mostrar error específico en desarrollo
      if (process.env.NODE_ENV === 'development') {
        if (error.code === 'ECONNREFUSED') {
          setError('Backend no está corriendo. Inicia el servidor en el puerto 3001.');
        } else if (error.response?.status === 404) {
          setError('Endpoint de categorías no encontrado. Verifica las rutas del backend.');
        } else if (error.message.includes('timeout')) {
          setError('Timeout al conectar con el servidor. Verifica que el backend esté corriendo.');
        } else {
          setError(`Error de conexión: ${error.message}`);
        }
      }
      
      // Usar categorías por defecto como fallback
      setCategories([
        { category_id: 1, name: 'Bebidas' },
        { category_id: 2, name: 'Comida' },
        { category_id: 3, name: 'Postres' },
        { category_id: 4, name: 'Aperitivos' },
        { category_id: 5, name: 'Otro' }
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      
      const response = await axios.get(`http://localhost:3001/api/products/store/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 segundos timeout
      });
      
      if (response.data.success) {
        const mappedProducts = response.data.data.map((product: any) => ({
          product_id: product.product_id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category_name || 'Otro',
          category_id: product.category_id,
          image_url: product.image_url,
          is_available: product.available
        }));
        setProducts(mappedProducts);
      } else {
        setError('Error al cargar los productos');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      
      // Mostrar error específico
      if (error.code === 'ECONNREFUSED') {
        setError('No se puede conectar al servidor. Verifica que el backend esté corriendo en el puerto 3001.');
      } else if (error.response?.status === 404) {
        setError('Endpoint de productos no encontrado. Verifica las rutas del backend.');
      } else if (error.response?.status === 401) {
        setError('No autorizado. Por favor inicia sesión nuevamente.');
      } else if (error.message.includes('timeout')) {
        setError('Timeout al conectar con el servidor.');
      } else {
        setError(`Error al conectar con el servidor: ${error.message}`);
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    console.log('Starting Cloudinary upload for product...');
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
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Error de Cloudinary: ${errorData.error?.message || errorText}`);
        } catch {
          throw new Error(`Error de Cloudinary (${response.status}): ${errorText}`);
        }
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

  const handleProductImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Product image upload started for file:', file.name);

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      
      console.log('Uploading product image to Cloudinary...');
      const imageUrl = await uploadImageToCloudinary(file);
      console.log('Product image uploaded successfully, URL:', imageUrl);
      
      setNewProduct(prev => {
        const updated = {
          ...prev,
          image_url: imageUrl
        };
        console.log('Updated product form data with image URL:', updated);
        return updated;
      });
      
      setSuccess('Imagen subida exitosamente');
      setTimeout(() => setSuccess(''), 2000);
      
    } catch (error: any) {
      console.error('Error uploading product image:', error);
      
      let errorMessage = 'Error al subir la imagen';
      
      if (error.message.includes('Cloudinary cloud name')) {
        errorMessage = 'Configuración de Cloudinary faltante. Contacta al administrador.';
      } else if (error.message.includes('upload_preset')) {
        errorMessage = 'Upload preset no configurado correctamente.';
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Upload preset no autorizado. Verifica la configuración.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 8000);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveProductImage = () => {
    setNewProduct(prev => ({
      ...prev,
      image_url: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryId = (categoryName: string): number | null => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.category_id : null;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (categories.length === 0) {
        setError('Cargando categorías, por favor espera...');
        return;
      }

      const categoryId = getCategoryId(newProduct.category);
      
      if (!categoryId) {
        setError(`Categoría no válida. Disponibles: ${categories.map(c => c.name).join(', ')}`);
        return;
      }

      const priceValue = parseFloat(newProduct.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setError('Precio debe ser mayor a 0');
        return;
      }

      const productData = {
        store_id: parseInt(storeId),
        category_id: categoryId,
        name: newProduct.name.trim(),
        price: priceValue,
        image_url: newProduct.image_url || null,
        available: newProduct.is_available
      };

      console.log('Sending product data:', productData);

      const response = await axios.post('http://localhost:3001/api/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess('¡Producto agregado exitosamente!');
        setNewProduct({ name: '', price: '', category: '', image_url: '', is_available: true });
        setShowAddForm(false);
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error: any) {
      console.error('Error al agregar producto:', error);
      setError(error.response?.data?.message || 'Error al agregar producto');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const productData = {
        store_id: parseInt(storeId),
        category_id: getCategoryId(product.category),
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url || null,
        available: product.is_available
      };

      const response = await axios.put(`http://localhost:3001/api/products/${product.product_id}`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess('Producto actualizado exitosamente');
        setEditingProduct(null);
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Error al actualizar producto');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3001/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess('Producto eliminado exitosamente');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Error al eliminar producto');
    }
  };

  if (!isAuthenticated || (user && user.role_name !== 'Admin')) {
    return null;
  }

  return (
    <MockupLayout title="Editar Menú" showAuthButtons={true}>
      <div className="menu-edit-container">
        <div className="menu-edit-header">
          <button 
            onClick={() => router.back()}
            className="back-btn"
          >
            ← Volver
          </button>
          <h1>Editar Menú de la Tienda</h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-product-btn"
          >
            + Agregar Producto
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Formulario para agregar producto */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Agregar Nuevo Producto</h3>
              <form onSubmit={handleAddProduct}>
                {/* Sección de imagen del producto */}
                <div className="image-upload-container">
                  <label className="image-upload-label">Imagen del Producto</label>
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
                      <strong>Debug info:</strong><br />
                      Cloudinary configured: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Yes' : 'No'}<br />
                      Current image URL: {newProduct.image_url || 'None'}
                    </div>
                  )}
                  
                  <div className="image-upload-area">
                    {newProduct.image_url ? (
                      <div className="image-preview">
                        <img 
                          src={newProduct.image_url} 
                          alt="Preview del producto" 
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
                            onClick={handleRemoveProductImage}
                            className="image-action-btn"
                            disabled={uploadingImage}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">🍽️</div>
                        <h4>Subir imagen del producto</h4>
                        <p>Selecciona una imagen para el producto (máx. 5MB)</p>
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
                    onChange={handleProductImageUpload}
                    className="upload-file-input"
                    disabled={uploadingImage}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Precio *</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoría *</label>
                  <select
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">
                      {categories.length === 0 ? 'Cargando categorías...' : 'Seleccionar categoría'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => {
                    setShowAddForm(false);
                    setNewProduct({ name: '', price: '', category: '', image_url: '', is_available: true });
                    setError('');
                  }} className="cancel-btn" disabled={uploadingImage}>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={!newProduct.name.trim() || !newProduct.price || !newProduct.category || categories.length === 0 || uploadingImage}
                  >
                    {uploadingImage ? 'Subiendo imagen...' : 'Agregar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de productos */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="products-container">
            {products.length === 0 ? (
              <div className="no-products">
                <p>No hay productos en el menú aún.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="add-first-product-btn"
                >
                  Agregar primer producto
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '20px'
              }}>
                {products.map((product) => (
                  <div key={product.product_id}>
                    {editingProduct?.product_id === product.product_id ? (
                      <ProductEditForm 
                        product={editingProduct}
                        categories={categories.map(cat => cat.name)}
                        onSave={handleUpdateProduct}
                        onCancel={() => setEditingProduct(null)}
                        onChange={setEditingProduct}
                        token={token}
                      />
                    ) : (
                      <ProductDisplay 
                        product={product}
                        onEdit={() => setEditingProduct(product)}
                        onDelete={() => handleDeleteProduct(product.product_id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MockupLayout>
  );
}

// Componente para mostrar producto
function ProductDisplay({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: Product; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const getProductImage = (product: Product): string => {
    if (product.image_url) {
      return product.image_url;
    }
    // Imagen por defecto basada en la categoría
    const categoryImages: { [key: string]: string } = {
      'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Comida': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Aperitivos': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Otro': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    };
    return categoryImages[product.category] || categoryImages['Otro'];
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        overflow: 'hidden'
      }}>
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: product.is_available ? '#10B981' : '#EF4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {product.is_available ? 'Disponible' : 'No disponible'}
        </div>
      </div>
      
      <div style={{
        padding: '16px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1F2937',
            lineHeight: '1.4'
          }}>
            {product.name}
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#059669'
            }}>
              ${product.price.toFixed(2)}
            </span>
            <span style={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {product.category}
            </span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px'
        }}>
          <button 
            onClick={onEdit}
            style={{
              flex: 1,
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
          >
            Editar
          </button>
          <button 
            onClick={onDelete}
            style={{
              flex: 1,
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para editar producto
function ProductEditForm({ 
  product, 
  categories, 
  onSave, 
  onCancel, 
  onChange,
  token
}: { 
  product: Product; 
  categories: string[]; 
  onSave: (product: Product) => void; 
  onCancel: () => void; 
  onChange: (product: Product) => void;
  token: string | null;
}) {
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name not configured.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'store_images');
    
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Error de Cloudinary: ${errorData.error?.message || errorText}`);
        } catch {
          throw new Error(`Error de Cloudinary (${response.status}): ${errorText}`);
        }
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploadingEditImage(true);
      
      const imageUrl = await uploadImageToCloudinary(file);
      
      onChange({
        ...product,
        image_url: imageUrl
      });
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Error al subir la imagen';
      if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleRemoveEditImage = () => {
    onChange({
      ...product,
      image_url: ''
    });
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const getProductImage = (product: Product): string => {
    if (product.image_url) {
      return product.image_url;
    }
    const categoryImages: { [key: string]: string } = {
      'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Comida': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Aperitivos': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Otro': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    };
    return categoryImages[product.category] || categoryImages['Otro'];
  };

  return (
    <form className="edit-form" onSubmit={(e) => { e.preventDefault(); onSave(product); }}>
      {/* Sección de imagen para editar */}
      <div className="image-upload-container">
        <label className="image-upload-label">Imagen del Producto</label>
        
        <div className="image-upload-area">
          <div className="image-preview">
            <img 
              src={getProductImage(product)} 
              alt="Preview del producto" 
              className="preview-image" 
            />
            <div className="image-overlay">
              <button
                type="button"
                onClick={() => editFileInputRef.current?.click()}
                className="image-action-btn"
                disabled={uploadingEditImage}
              >
                {uploadingEditImage ? 'Subiendo...' : (product.image_url ? 'Cambiar' : 'Subir')}
              </button>
              {product.image_url && (
                <button
                  type="button"
                  onClick={handleRemoveEditImage}
                  className="image-action-btn"
                  disabled={uploadingEditImage}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
          
          {uploadingEditImage && (
            <div className="uploading-overlay">
              <div className="upload-progress">
                <div className="upload-spinner"></div>
                <span className="upload-text">Subiendo imagen...</span>
              </div>
            </div>
          )}
        </div>
        
        <input
          ref={editFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleEditImageUpload}
          className="upload-file-input"
          disabled={uploadingEditImage}
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          value={product.name}
          onChange={(e) => onChange({...product, name: e.target.value})}
          required
          maxLength={100}
          placeholder="Nombre del producto"
        />
      </div>
      
      <div className="form-row">
        <input
          type="number"
          step="0.01"
          min="0"
          value={product.price}
          onChange={(e) => onChange({...product, price: parseFloat(e.target.value)})}
          required
          placeholder="Precio"
        />
        <select
          value={product.category}
          onChange={(e) => onChange({...product, category: e.target.value})}
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={product.is_available}
          onChange={(e) => onChange({...product, is_available: e.target.checked})}
        />
        Disponible
      </label>
      
      <div className="form-actions">
        <button 
          type="button" 
          onClick={onCancel} 
          className="cancel-btn"
          disabled={uploadingEditImage}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="save-btn"
          disabled={uploadingEditImage}
        >
          {uploadingEditImage ? 'Subiendo imagen...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
