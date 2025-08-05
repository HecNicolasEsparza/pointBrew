'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/components/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message || 'Error en el login');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MockupLayout title="Point Brew" showAuthButtons={false}>
      <div className={styles.authContainer}>
        <div className={styles.authFormContainer}>
          <div className={styles.logoSection}>
            <img src="/img/Logo.png" alt="Point Brew Logo" className={styles.authLogo} />
            <h2>Point Brew</h2>
            <p>Iniciar sesión</p>
          </div>
          
          <form className={styles.authForm} onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
            
            <button type="submit" className={styles.authBtn} disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            
            <p className={styles.authLink}>
              ¿No tienes una cuenta? <Link href="/auth/register">Regístrate</Link>
            </p>
          </form>
        </div>
        
        <div className={styles.authImage}>
          <div className={styles.cafeBg}></div>
        </div>
      </div>
    </MockupLayout>
  );
}