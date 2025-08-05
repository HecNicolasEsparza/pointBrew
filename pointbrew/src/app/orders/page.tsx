"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Aquí puedes cargar las órdenes del usuario
    // fetchUserOrders();
  }, [isAuthenticated, router]);

  return (
    <MockupLayout title="Mis Pedidos - Point Brew" showAuthButtons={true}>
      <div style={{ padding: '80px 2rem 2rem', textAlign: 'center' }}>
        <h1>Mis Pedidos</h1>
        <p>Aquí aparecerán tus pedidos realizados</p>
        <button onClick={() => router.push('/')} style={{ 
          padding: '1rem 2rem', 
          backgroundColor: '#8B4513', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          Volver al Inicio
        </button>
      </div>
    </MockupLayout>
  );
}