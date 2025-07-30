import MockupLayout from '@/components/MockupLayout';
import Link from 'next/link';

export default function Login() {
  return (
    <MockupLayout title="Point Brew" showAuthButtons={false}>
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="logo-section">
            <img src="/img/Logo.png" alt="Point Brew Logo" className="auth-logo" />
            <h2>Point Brew</h2>
            <p>Iniciar sesión</p>
          </div>
          
          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" required />
            </div>
            
            <button type="submit" className="auth-btn">
              Iniciar sesión
            </button>
            
            <p className="auth-link">
              ¿No tienes una cuenta? <Link href="/register">Regístrate</Link>
            </p>
          </form>
        </div>
        
        <div className="auth-image">
          <div className="cafe-bg"></div>
        </div>
      </div>
    </MockupLayout>
  );
}