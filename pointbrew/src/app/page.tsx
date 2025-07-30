import MockupLayout from '@/components/MockupLayout';
import RestaurantCarousel from '@/components/RestaurantCarousel';
import RestaurantList from '@/components/RestaurantList';

export default function Home() {
  return (
    <MockupLayout title="Point Brew" showAuthButtons={true}>
      {/* Logo fijo en la parte superior izquierda */}
      <div className="logo-fixed">
        <img src="/img/Logo.png" alt="Point Brew Logo" className="main-logo" />
      </div>

      <div className="landing-container">

        <div className="main-overview">
          {/* Barra de búsqueda (disabled) */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar tu local" 
              className="search-input disabled"
              disabled
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
            <div className="nav-item disabled">Inicio</div>
            <div className="nav-item disabled">Ofertas</div>
            <div className="nav-item disabled">Administrar Trabajo</div>
            <div className="nav-item disabled">Registrar una tienda</div>
          </nav>
        </aside>
      </div>
    </MockupLayout>
  );
}