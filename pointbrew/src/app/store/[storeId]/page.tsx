'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';

interface Store {
  store_id: number;
  name: string;
  description: string;
  branch_name: string;
  branch_address: string;
}

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
}

export default function StorePage({ params }: { params: { storeId: string } }) {
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
      const storeResponse = await axios.get(`http://localhost:3001/api/stores/${params.storeId}`);
      if (storeResponse.data.success) {
        setStore(storeResponse.data.data);
      }

      // Fetch products
      const productsResponse = await axios.get(`http://localhost:3001/api/products/store/${params.storeId}`);
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.data.filter((p: Product) => p.is_available));
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError('Error al cargar la información de la tienda');
    } finally {
      setLoading(false);
    }
  };

  const getStoreImage = (storeName: string): string => {
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
              src={getStoreImage(store.name)} 
              alt={store.name}
              className="store-hero-image"
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
                      <div key={product.product_id} className="menu-item">
                        <div className="menu-item-info">
                          <h4 className="menu-item-name">{product.name}</h4>
                          <p className="menu-item-description">
                            {product.description || 'Delicioso producto disponible'}
                          </p>
                        </div>
                        <div className="menu-item-price">
                          ${product.price.toFixed(2)}
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
