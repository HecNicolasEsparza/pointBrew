'use client';

import { useState, useEffect, use } from 'react';
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
}

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}

export default function StorePage({ params }: { params: Promise<{ storeId: string }> }) {
  // Usar React.use() para obtener los parámetros
  const resolvedParams = use(params);
  const storeId = resolvedParams.storeId;
  
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      
      // Fetch store info
      const storeResponse = await axios.get(`http://localhost:3001/api/stores/${storeId}`);
      if (storeResponse.data.success) {
        setStore(storeResponse.data.data);
      }

      // Fetch products
      const productsResponse = await axios.get(`http://localhost:3001/api/products/store/${storeId}`);
      if (productsResponse.data.success) {
        // Mapear los productos igual que en menu-edit
        const mappedProducts = productsResponse.data.data.map((product: any) => ({
          product_id: product.product_id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category_name || 'Otro',
          category_id: product.category_id,
          image_url: product.image_url,
          is_available: product.available
        }));
        
        // Mostrar solo productos disponibles, pero primero verifica que el mapeo sea correcto
        console.log('Productos mapeados:', mappedProducts); // Para debug
        setProducts(mappedProducts.filter((p: any) => p.is_available));
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError('Error al cargar la información de la tienda');
    } finally {
      setLoading(false);
    }
  };

  const getStoreImage = (store: Store): string => {
    // Primero usar la imagen personalizada si existe
    if (store.image_url && store.image_url.trim() !== '') {
      return store.image_url;
    }
    
    // Fallback a imágenes por nombre
    const storeName = store.name;
    if (storeName.toLowerCase().includes('kfc') || storeName.toLowerCase().includes('pollo')) {
      return "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    } else if (storeName.toLowerCase().includes('hamburguesa') || storeName.toLowerCase().includes('burger')) {
      return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    } else if (storeName.toLowerCase().includes('pizza')) {
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    } else if (storeName.toLowerCase().includes('café') || storeName.toLowerCase().includes('coffee')) {
      return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    } else {
      return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    }
  };

  const groupProductsByCategory = (products: Product[]) => {
    return products.reduce((acc, product) => {
      const category = product.category || 'Otros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  };

  const getProductImage = (product: Product): string => {
    if (product.image_url) {
      return product.image_url;
    }
    // Imagen por defecto basada en la categoría
    const categoryImages: { [key: string]: string } = {
      'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'Comida': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'Aperitivos': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'Otro': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    };
    return categoryImages[product.category] || categoryImages['Otro'];
  };

  if (loading) {
    return (
      <MockupLayout title="Cargando..." showAuthButtons={true}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información de la tienda...</p>
        </div>
      </MockupLayout>
    );
  }

  if (error || !store) {
    return (
      <MockupLayout title="Error" showAuthButtons={true}>
        <div className="error-container">
          <p>{error || 'Tienda no encontrada'}</p>
          <button onClick={() => router.push('/')} className="back-home-btn">
            Volver al inicio
          </button>
        </div>
      </MockupLayout>
    );
  }

  const groupedProducts = groupProductsByCategory(products);

  return (
    <MockupLayout title={store.name} showAuthButtons={true}>
      <div className="store-page-container">
        {/* Header de la tienda */}
        <div className="store-header">
          <button 
            onClick={() => router.push('/')}
            className="back-btn"
          >
            ← Volver
          </button>
          
          <div className="store-hero">
            <img 
              src={getStoreImage(store)} 
              alt={store.name}
              className="store-hero-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="store-hero-content">
              <h1 className="store-title">{store.name}</h1>
              <p className="store-description">{store.description || 'Deliciosa comida te espera'}</p>
              <div className="store-location">
                <strong>{store.branch_name}</strong>
                <span>{store.branch_address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menú de productos */}
        <div className="store-menu">
          {products.length === 0 ? (
            <div className="no-menu">
              <h3>Menú no disponible</h3>
              <p>Esta tienda aún no ha agregado productos a su menú.</p>
            </div>
          ) : (
            <div className="menu-sections">
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <div key={category} className="menu-category">
                  <h3 className="category-title">{category}</h3>
                  <div className="products-list">
                    {categoryProducts.map((product) => (
                      <div key={product.product_id} style={{
                        display: 'flex',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        marginBottom: '16px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}>
                        <div style={{
                          width: '120px',
                          height: '120px',
                          flexShrink: 0
                        }}>
                          <img 
                            src={getProductImage(product)} 
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getProductImage({...product, image_url: undefined});
                            }}
                          />
                        </div>
                        <div style={{
                          padding: '16px',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h4 style={{
                              margin: '0 0 8px 0',
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#1F2937'
                            }}>
                              {product.name}
                            </h4>
                            <p style={{
                              margin: '0',
                              fontSize: '14px',
                              color: '#6B7280',
                              lineHeight: '1.4'
                            }}>
                              {product.description || 'Delicioso producto disponible'}
                            </p>
                          </div>
                          <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#059669',
                            marginTop: '8px'
                          }}>
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MockupLayout>
  );
}
