'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './MockupLayout.module.css';

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
    <div className={styles.homeContainer}>
      <header className={styles.homeHeader}>
        <h1></h1>
        
        {showAuthButtons && (
          <div className={styles.navButtons}>
            {isAuthenticated && user ? (
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>{user.full_name}</span>
                </div>
                <div className={styles.userActions}>
                  <Link href="/profile" className={`${styles.navBtn} ${styles.profileBtn}`}>
                    Perfil
                  </Link>
                  <button onClick={handleLogout} className={`${styles.navBtn} ${styles.logoutBtn}`}>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className={`${styles.navBtn} ${styles.loginBtn}`}>
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className={`${styles.navBtn} ${styles.registerBtn}`}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      
      <main className={styles.mainContent}>
        {children}
      </main>
      
      <footer className={styles.homeFooter}>
        Point Brew - Universidad Politécnica de Aguascalientes
      </footer>
    </div>
  );
}
