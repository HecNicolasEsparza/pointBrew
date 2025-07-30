'use client';

import { useState, useEffect } from 'react';

interface Store {
  store_id: number;
  name: string;
  description: string;
  branch_name: string;
  branch_address: string;
}

export default function RestaurantList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stores');
        const data = await response.json();
        
        if (data.success) {
          setStores(data.data.slice(0, 4)); // Show only first 4 stores
        } else {
          // Fallback to mock data
          setStores([
            {
              store_id: 1,
              name: "Pollo KFC",
              description: "Delicioso pollo frito",
              branch_name: "KFC Villa Asunción",
              branch_address: "Villa Asunción"
            },
            {
              store_id: 2,
              name: "Hamburguesas Gourmet",
              description: "Las mejores hamburguesas de la ciudad",
              branch_name: "Burger House Centro",
              branch_address: "Centro"
            },
            {
              store_id: 3,
              name: "Pizza Italiana",
              description: "Auténtica pizza italiana",
              branch_name: "Pizza Roma",
              branch_address: "Centro Histórico"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        // Fallback to mock data on error
        setStores([
          {
            store_id: 1,
            name: "Pollo KFC",
            description: "Delicioso pollo frito",
            branch_name: "KFC Villa Asunción",
            branch_address: "Villa Asunción"
          },
          {
            store_id: 2,
            name: "Hamburguesas Gourmet",
            description: "Las mejores hamburguesas de la ciudad",
            branch_name: "Burger House Centro",
            branch_address: "Centro"
          },
          {
            store_id: 3,
            name: "Pizza Italiana",
            description: "Auténtica pizza italiana",
            branch_name: "Pizza Roma",
            branch_address: "Centro Histórico"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const getRestaurantImage = (storeName: string): string => {
    if (storeName.toLowerCase().includes('kfc') || storeName.toLowerCase().includes('pollo')) {
      return "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (storeName.toLowerCase().includes('hamburguesa') || storeName.toLowerCase().includes('burger')) {
      return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else if (storeName.toLowerCase().includes('pizza')) {
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    } else {
      return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    }
  };

  if (loading) {
    return (
      <div className="restaurant-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando restaurantes...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-grid">
      {stores.map((store) => (
        <div key={store.store_id} className="restaurant-card-modern">
          <div className="restaurant-image-container">
            <img 
              src={getRestaurantImage(store.name)}
              alt={store.name}
              className="restaurant-card-image"
            />
          </div>
          <div className="restaurant-card-content">
            <h3 className="restaurant-card-title">{store.name}</h3>
            <p className="restaurant-card-location">{store.branch_address}</p>
            {store.description && (
              <p className="restaurant-card-description">{store.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
