import MockupLayout from '@/components/MockupLayout';
import Link from 'next/link';

export default function Register() {
  return (
    <MockupLayout title="Point Brew" showAuthButtons={false}>
      <div className="auth-container">
        <div className="auth-image">
          <div className="cafe-bg"></div>
        </div>
        
        <div className="auth-form-container">
          <div className="logo-section">
            <img src="/img/Logo.png" alt="Point Brew Logo" className="auth-logo" />
            <h2>Point Brew</h2>
            <p>Registrarse</p>
          </div>
          
          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" required />
            </div>
            
            <button type="submit" className="auth-btn">
              Registrarse
            </button>
            
            <p className="auth-link">
              ¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </MockupLayout>
  );
}
