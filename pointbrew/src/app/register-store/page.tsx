'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';

export default function RegisterStorePage() {
  const { user, isAuthenticated, setUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    branchName: '',
    branchAddress: ''
  });

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await axios.post(
        'http://localhost:3001/api/stores/register',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('¡Tienda registrada exitosamente! Ahora eres administrador.');
        
        // Actualizar el usuario en el contexto para reflejar el nuevo rol
        setUser(prev => prev ? ({
          ...prev,
          role_id: 1 // Admin role
        }) : null);

        // Redirigir a la página principal después de 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error registrando tienda:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error registrando la tienda. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MockupLayout title="Registrar Tienda" showAuthButtons={true}>
      <div className="auth-container">
        <div className="auth-form-container" style={{ maxWidth: '100%' }}>
          <div className="logo-section">
            <img src="/img/Logo.png" alt="Point Brew Logo" className="auth-logo" />
            <h2>Registrar Tienda</h2>
            <p>Convierte tu negocio en parte de Point Brew</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-section">
              <h3>Información de la Tienda</h3>
              
              <div className="form-group">
                <label htmlFor="storeName">Nombre de la Tienda *</label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  placeholder="Ej: Café Central"
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="storeDescription">Descripción (Opcional)</label>
                <input
                  type="text"
                  id="storeDescription"
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  placeholder="Breve descripción de tu tienda"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Información de la Sucursal</h3>
              
              <div className="form-group">
                <label htmlFor="branchName">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Ej: Sucursal Centro"
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="branchAddress">Dirección Completa *</label>
                <input
                  type="text"
                  id="branchAddress"
                  name="branchAddress"
                  value={formData.branchAddress}
                  onChange={handleInputChange}
                  placeholder="Calle, número, colonia, ciudad"
                  required
                  maxLength={150}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrar Tienda'}
            </button>
          </form>

          <div className="auth-link">
            <a href="/" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
              ← Volver al inicio
            </a>
          </div>
        </div>

        <div className="auth-image">
          <div className="cafe-bg"></div>
        </div>
      </div>
    </MockupLayout>
  );
}
