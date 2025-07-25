import React from 'react';
import Link from 'next/link';

interface MockupLayoutProps {
  title: string;
  children: React.ReactNode;
  showAuthButtons?: boolean;
}

export default function MockupLayout({ title, children, showAuthButtons = true }: MockupLayoutProps) {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1></h1>
        
        {showAuthButtons && (
          <div className="nav-buttons">
            <Link href="/login" className="nav-btn login-btn">
              Iniciar sesión
            </Link>
            <Link href="/register" className="nav-btn register-btn">
              Registrarse
            </Link>
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
