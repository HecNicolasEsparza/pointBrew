'use client';
import MockupLayout from '@/components/MockupLayout';
import RestaurantCarousel from '@/components/RestaurantCarousel';
import RestaurantList from '@/components/RestaurantList';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <MockupLayout title="Point Brew" showAuthButtons={true}>
      {/* Logo fijo en la parte superior izquierda */}
      <div className="logo-fixed">
        <img src="/img/Logo.png" alt="Point Brew Logo" className="main-logo" />
      </div>

      <div className="landing-container">

        <div className="main-overview">
          {/* Barra de búsqueda */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar tu local" 
              className={`search-input ${!isAuthenticated ? 'disabled' : ''}`}
              disabled={!isAuthenticated}
            />
          </div>

          {/* Sección "Lo más popular el día" */}
          <section className="popular-section">
            <h2 className="section-title">Lo más popular el día</h2>
            
            {/* Carrusel de restaurante destacado */}
            <RestaurantCarousel />
            
            {/* Lista de restaurantes desde el backend */}
            <RestaurantList />
          </section>
        </div>

        {/* Sidebar de navegación del lado derecho */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link href="/" className={`nav-item ${!isAuthenticated ? 'disabled' : ''}`}>
              Inicio
            </Link>
            <div className={`nav-item ${!isAuthenticated ? 'disabled' : ''}`}>
              Ofertas
            </div>
            <div className={`nav-item ${!isAuthenticated ? 'disabled' : ''}`}>
              Administrar Trabajo
            </div>
            {isAuthenticated ? (
              <Link href="/register-store" className="nav-item">
                Registrar una tienda
              </Link>
            ) : (
              <div className="nav-item disabled">
                Registrar una tienda
              </div>
            )}
          </nav>
        </aside>
      </div>
    </MockupLayout>
  );
}