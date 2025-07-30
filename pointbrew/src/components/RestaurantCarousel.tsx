'use client';

import { useState, useEffect } from 'react';

interface Store {
  store_id: number;
  name: string;
  description: string;
  branch_name: string;
  branch_address: string;
}

interface CarouselImage {
  id: number;
  src: string;
  alt: string;
}

const carouselImages: CarouselImage[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1513185158878-8d064c2de2a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    alt: "KFC Restaurant"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    alt: "Hamburger Restaurant"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    alt: "Pizza Restaurant"
  }
];

export default function RestaurantCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featuredStore, setFeaturedStore] = useState<Store | null>(null);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured store (could be random or based on popularity)
  useEffect(() => {
    const fetchFeaturedStore = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stores');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // Get a random store as featured
          const randomStore = data.data[Math.floor(Math.random() * data.data.length)];
          setFeaturedStore(randomStore);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        // Fallback to mock data
        setFeaturedStore({
          store_id: 1,
          name: "Pollo KFC",
          description: "Delicioso pollo frito",
          branch_name: "KFC Villa Asunción",
          branch_address: "Villa Asunción"
        });
      }
    };

    fetchFeaturedStore();
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="featured-restaurant">
      <div className="carousel-container">
        <div className="carousel-wrapper">
          <img 
            src={carouselImages[currentImageIndex].src}
            alt={carouselImages[currentImageIndex].alt}
            className="carousel-image"
          />
          
          {/* Navigation arrows */}
          <button className="carousel-btn carousel-prev" onClick={prevImage}>
            ‹
          </button>
          <button className="carousel-btn carousel-next" onClick={nextImage}>
            ›
          </button>
          
          {/* Dots indicator */}
          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        </div>
        
        {/* Restaurant info overlay */}
        {featuredStore && (
          <div className="restaurant-overlay">
            <h3 className="featured-restaurant-name">{featuredStore.name}</h3>
            <p className="featured-restaurant-location">
              Dirección: {featuredStore.branch_address}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
