'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface MockupLayoutProps {
  title: string;
  children: React.ReactNode;
  showAuthButtons?: boolean;
}

export default function MockupLayout({ title, children, showAuthButtons = true }: MockupLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1></h1>
        
        {showAuthButtons && (
          <div className="nav-buttons">
            {isAuthenticated && user ? (
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.full_name}</span>
                </div>
                <div className="user-actions">
                  <Link href="/profile" className="nav-btn profile-btn">
                    Perfil
                  </Link>
                  <button onClick={handleLogout} className="nav-btn logout-btn">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="nav-btn login-btn">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="nav-btn register-btn">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="home-footer">
        Point Brew - Universidad Politécnica de Aguascalientes
      </footer>
    </div>
  );
}
