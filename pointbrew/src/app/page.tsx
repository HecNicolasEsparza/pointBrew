'use client';
import MockupLayout from '@/components/MockupLayout';
import StoreManagement from '@/components/StoreManagement';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';

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
      <div className={styles.logoFixed}>
        <img src="/img/Logo.png" alt="Point Brew Logo" className={styles.mainLogo} />
      </div>

      <div className={styles.landingContainer}>
        <div className={styles.mainOverview}>
          {/* Barra de búsqueda */}
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Buscar tu local" 
              className={`${styles.searchInput} ${!isAuthenticated ? 'disabled' : ''}`}
              disabled={!isAuthenticated}
            />
          </div>

          {/* Sección "Lo más popular el día" */}
          <section className={styles.popularSection}>
            {/* Gestión y lista de todas las tiendas - pass getStoreImage function */}
            <StoreManagement getStoreImage={getStoreImage} />
          </section>
        </div>

        {/* Sidebar de navegación del lado derecho */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <Link href="/" className={`${styles.navItem} ${!isAuthenticated ? 'disabled' : ''}`}>
              Inicio
            </Link>
            <div className={`${styles.navItem} ${!isAuthenticated ? 'disabled' : ''}`}>
              Ofertas
            </div>
            {isAuthenticated && user?.role_name === 'Admin' && (
              <Link href="/store/manage-stores" className={styles.navItem}>
                Administrar mis tiendas
              </Link>
            )}
            {isAuthenticated && user?.role_name === 'Employee' && (
              <Link href="/store/manage-worker-stores" className={styles.navItem}>
                Administrar tiendas en las que trabajo
              </Link>
            )}
            {isAuthenticated && user?.role_name !== 'Employee' ? (
              <Link href="/store/register-store" className={styles.navItem}>
                Registrar una tienda
              </Link>
            ) : user?.role_name === 'Employee' ? null : (
              <div className={`${styles.navItem} disabled`}>
                Registrar una tienda
              </div>
            )}
          </nav>
        </aside>
      </div>
    </MockupLayout>
  );
}