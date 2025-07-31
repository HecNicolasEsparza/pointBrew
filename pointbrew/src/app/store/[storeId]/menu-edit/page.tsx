'use client';

import { useState, useEffect } from 'react';
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
  is_available: boolean;
}

export default function MenuEditPage({ params }: { params: { storeId: string } }) {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_available: true
  });

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
    fetchProducts();
  }, [isAuthenticated, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/products/store/${params.storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        setError('Error al cargar los productos');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error al conectar con el servidor');
      setProducts([]); // Set empty array for new stores
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        store_id: parseInt(params.storeId)
      };

      const response = await axios.post('http://localhost:3001/api/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess('Producto agregado exitosamente');
        setNewProduct({ name: '', description: '', price: '', category: '', is_available: true });
        setShowAddForm(false);
        fetchProducts();
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || 'Error al agregar producto');
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/products/${product.product_id}`, product, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess('Producto actualizado exitosamente');
        setEditingProduct(null);
        fetchProducts();
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
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Error al eliminar producto');
    }
  };

  const categories = ['Bebidas', 'Comida', 'Postres', 'Aperitivos', 'Otro'];

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
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    maxLength={255}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Precio *</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoría *</label>
                  <select
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn">
                    Agregar Producto
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
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.product_id} className="product-card">
                    {editingProduct?.product_id === product.product_id ? (
                      <ProductEditForm 
                        product={editingProduct}
                        categories={categories}
                        onSave={handleUpdateProduct}
                        onCancel={() => setEditingProduct(null)}
                        onChange={setEditingProduct}
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
  return (
    <>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description || 'Sin descripción'}</p>
        <div className="product-details">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <span className="product-category">{product.category}</span>
        </div>
        <div className={`product-status ${product.is_available ? 'available' : 'unavailable'}`}>
          {product.is_available ? 'Disponible' : 'No disponible'}
        </div>
      </div>
      <div className="product-actions">
        <button onClick={onEdit} className="edit-btn">Editar</button>
        <button onClick={onDelete} className="delete-btn">Eliminar</button>
      </div>
    </>
  );
}

// Componente para editar producto
function ProductEditForm({ 
  product, 
  categories, 
  onSave, 
  onCancel, 
  onChange 
}: { 
  product: Product; 
  categories: string[]; 
  onSave: (product: Product) => void; 
  onCancel: () => void; 
  onChange: (product: Product) => void; 
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
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

      <div className="form-group">
        <textarea
          value={product.description}
          onChange={(e) => onChange({...product, description: e.target.value})}
          maxLength={255}
          placeholder="Descripción"
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

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={product.is_available}
            onChange={(e) => onChange({...product, is_available: e.target.checked})}
          />
          Disponible
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancelar
        </button>
        <button type="submit" className="save-btn">
          Guardar
        </button>
      </div>
    </form>
  );
}
