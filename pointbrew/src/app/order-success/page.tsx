"use client";

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import { FaCheckCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '@/lib/apiClient';

interface Ticket {
  ticket_id: number;
  ticket_date: string;
  total_amount: number;
  branch_name: string;
  store_name: string;
  branch_address?: string;
  customer_name?: string;
  customer_email?: string;
  payment_method?: string;
  payment_status?: string;
  products?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const res = await apiClient.get(`/api/orders/${orderId}`);
        if (res.data.success) {
          setTicket(res.data.data);
        }
      } catch (err) {
        console.error('Error al cargar el ticket:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [orderId]);

  const handleDownloadPDF = () => {
    if (!ticket) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Ticket de Pedido - Point Brew', 14, 18);
    doc.setFontSize(12);
    doc.text(`N° Ticket: #${ticket.ticket_id}`, 14, 28);
    doc.text(`Fecha: ${new Date(ticket.ticket_date).toLocaleString('es-MX')}`, 14, 36);
    doc.text(`Sucursal: ${ticket.branch_name}`, 14, 44);
    doc.text(`Tienda: ${ticket.store_name}`, 14, 52);
    if (ticket.branch_address) doc.text(`Dirección: ${ticket.branch_address}`, 14, 60);
    if (ticket.customer_name) doc.text(`Cliente: ${ticket.customer_name}`, 14, 68);
    if (ticket.customer_email) doc.text(`Email: ${ticket.customer_email}`, 14, 76);
    if (ticket.payment_method) doc.text(`Método de pago: ${ticket.payment_method}`, 14, 84);
    if (ticket.payment_status) doc.text(`Estado de pago: ${ticket.payment_status}`, 14, 92);
    doc.text(`Total: $${ticket.total_amount}`, 14, 100);

    // Tabla de productos
    if (ticket.products && ticket.products.length > 0) {
      autoTable(doc, {
        startY: 110,
        head: [["Producto", "Cantidad", "Precio Unitario", "Subtotal"]],
        body: ticket.products.map((p) => [
          p.product_name,
          p.quantity,
          `$${p.unit_price}`,
          `$${p.subtotal}`
        ]),
      });
    }

    doc.save(`ticket_${ticket.ticket_id}.pdf`);
  };

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
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !ticket}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading || !ticket ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading || !ticket ? 0.6 : 1
            }}
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </MockupLayout>
  );
}