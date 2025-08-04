'use client';

import { useState, useEffect, use } from 'react';
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
  category_id?: number; // Agregar este campo opcional
  is_available: boolean;
}

export default function MenuEditPage({ params }: { params: Promise<{ storeId: string }> }) {
  // Usar React.use() para obtener los parámetros
  const resolvedParams = use(params);
  const storeId = resolvedParams.storeId;
  
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
    description: '', // Puedes quitar este campo si no lo usas
    price: '',
    category: '',
    is_available: true // Esto debería ser true por defecto
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
      const response = await axios.get(`http://localhost:3001/api/products/store/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Mapear los datos del backend al formato del frontend
        const mappedProducts = response.data.data.map((product: any) => ({
          product_id: product.product_id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category_name || 'Otro', // Usar category_name del backend
          category_id: product.category_id,
          is_available: product.available // Mapear available a is_available
        }));
        setProducts(mappedProducts);
      } else {
        setError('Error al cargar los productos');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error al conectar con el servidor');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      // Convertir los datos al formato que espera el backend
      const productData = {
        store_id: parseInt(storeId),
        category_id: getCategoryId(product.category), // Función para obtener el ID
        name: product.name,
        description: product.description,
        price: product.price,
        available: product.is_available // Cambiar is_available a available
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
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Error al actualizar producto');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        store_id: parseInt(storeId),
        category_id: getCategoryId(newProduct.category),
        name: newProduct.name,
        // description: newProduct.description, // Quita esta línea
        price: parseFloat(newProduct.price),
        available: newProduct.is_available
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

  // Función auxiliar para convertir nombre de categoría a ID
  const getCategoryId = (categoryName: string): number | null => {
    const categoryMap: { [key: string]: number } = {
      'Bebidas': 1,
      'Comida': 2,
      'Postres': 3,
      'Aperitivos': 4,
      'Otro': 5
    };
    return categoryMap[categoryName] || null;
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
  return (
    <form className="edit-form" onSubmit={(e) => { e.preventDefault(); onSave(product); }}>
      <div className="form-group">
        <input
          type="text"
          value={product.name}
          onChange={(e) => onChange({...product, name: e.target.value})}
          required
          maxLength={100}
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
        <button type="button" onClick={onCancel} className="cancel-btn">Cancelar</button>
        <button type="submit" className="save-btn">Guardar</button>
      </div>
    </form>
  );
}
