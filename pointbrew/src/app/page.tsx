'use client';
import MockupLayout from '@/components/MockupLayout';
import StoreManagement from '@/components/StoreManagement';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const getStoreImage = (store: Store): string => {
    // If the store has a custom image, use it
    if (store.image_url && store.image_url.trim() !== '') {
      return store.image_url;
    } else {
      // Fallback to default image
      return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
    }
  };

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
            {/* Gestión y lista de todas las tiendas - pass getStoreImage function */}
            <StoreManagement getStoreImage={getStoreImage} />
          </section>
        </div>

        {/* Sidebar de navegación del lado derecho */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {/* Botón para ver pedidos - solo para usuarios autenticados */}
            {isAuthenticated ? (
              <Link href="/orders" className="nav-item">
                Mis Pedidos
              </Link>
            ) : (
              <div className="nav-item disabled">
                Mis Pedidos
              </div>
            )}

            {/* Opciones de administración */}
            {isAuthenticated && user?.role_name === 'Admin' && (
              <Link href="/store/manage-stores" className="nav-item">
                Administrar mis tiendas
              </Link>
            )}
            {isAuthenticated && user?.role_name === 'Employee' && (
              <Link href="/store/manage-worker-stores" className="nav-item">
                Administrar tiendas en las que trabajo
              </Link>
            )}
            
            {/* Registro de tienda */}
            {isAuthenticated && user?.role_name !== 'Employee' ? (
              <Link href="/store/register-store" className="nav-item">
                Registrar una tienda
              </Link>
            ) : user?.role_name === 'Employee' ? null : (
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