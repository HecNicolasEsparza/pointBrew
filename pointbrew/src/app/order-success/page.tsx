"use client";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import { FaCheckCircle } from 'react-icons/fa';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  return (
    <MockupLayout title="Pedido Exitoso - Point Brew" showAuthButtons={true}>
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 2rem 2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <FaCheckCircle style={{ 
          fontSize: '4rem', 
          color: '#28a745', 
          marginBottom: '1rem' 
        }} />
        
        <h1 style={{ color: '#8B4513', marginBottom: '1rem' }}>
          ¡Pedido Realizado Exitosamente!
        </h1>
        
        {orderId && (
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Tu número de orden es: <strong>#{orderId}</strong>
          </p>
        )}
        
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Recibirás una confirmación por correo electrónico. 
          Puedes seguir comprando o revisar tus pedidos.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => router.push('/')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#8B4513',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Seguir Comprando
          </button>
          
          <button 
            onClick={() => router.push('/orders')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Ver Mis Pedidos
          </button>
        </div>
      </div>
    </MockupLayout>
  );
}