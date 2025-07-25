import MockupLayout from '@/components/MockupLayout';
import Link from 'next/link';

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
            
            <div className="restaurant-card">
              <div className="restaurant-image">
                <img src="/img/kfc-placeholder.jpg" alt="KFC" className="restaurant-img" />
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">Pollo KFC</h3>
                <p className="restaurant-location">Dirección: Villa Asunción</p>
              </div>
            </div>

            <div className="restaurant-card">
              <div className="restaurant-image">
                <img src="/img/burger-placeholder.jpg" alt="Hamburguesas" className="restaurant-img" />
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">Hamburguesas Gourmet</h3>
                <p className="restaurant-location">Dirección: Centro</p>
              </div>
            </div>

            <div className="restaurant-card">
              <div className="restaurant-image">
                <img src="/img/pizza-placeholder.jpg" alt="Pizza" className="restaurant-img" />
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">Pizza Italiana</h3>
                <p className="restaurant-location">Dirección: Centro Histórico</p>
              </div>
            </div>
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