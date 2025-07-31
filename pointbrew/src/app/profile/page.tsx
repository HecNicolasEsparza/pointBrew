'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <MockupLayout title="Point Brew">
        <div className="profile-container">
          <div className="loading">Cargando...</div>
        </div>
      </MockupLayout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MockupLayout title="Point Brew">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <h1>Mi Perfil</h1>
        </div>
        
        <div className="profile-info">
          <div className="info-group">
            <label>Nombre completo:</label>
            <span>{user.full_name}</span>
          </div>
          
          <div className="info-group">
            <label>Correo electrónico:</label>
            <span>{user.email}</span>
          </div>
          
          <div className="info-group">
            <label>Rol:</label>
            <span>{user.role_name}</span>
          </div>
          
          <div className="info-group">
            <label>Miembro desde:</label>
            <span>{new Date(user.created_at).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>
    </MockupLayout>
  );
}
