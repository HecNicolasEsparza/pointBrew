"use client";
import './checkout.css';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import { FaCreditCard, FaMoneyBillWave, FaMobile, FaUniversity } from 'react-icons/fa';
import axios from 'axios';
import CouponSection from '@/components/CouponSection';
import { useSelector } from 'react-redux';
import { RootState } from '@/contexts/redux/store';


interface PaymentMethod {
  method_id: number;
  method_name: string;
  icon?: React.ReactElement;
}

export default function CheckoutPage() {

  const paymentId = useSelector((state: RootState) => state.payment.paymentId);



  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  useEffect(() => {
    console.log('valor de paymentMethod:', selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  const [loading, setLoading] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Variable faltante añadida
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart, refreshCart } = useCart();
  const router = useRouter();




  // Mapeo de iconos para métodos de pago
  const getPaymentIcon = (methodName: string): React.ReactElement => {
    switch (methodName.toLowerCase()) {
      case 'cash':
      case 'efectivo':
        return <FaMoneyBillWave />;
      case 'credit card':
      case 'tarjeta de crédito':
        return <FaCreditCard />;
      case 'debit card':
      case 'tarjeta de débito':
        return <FaUniversity />;
      case 'mobile payment':
      case 'pago móvil':
        return <FaMobile />;
      default:
        return <FaCreditCard />;
    }
  };

  useEffect(() => {
    console.log("📢 Estado de paymentId en Redux:", paymentId);
  }, [paymentId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Pre-llenar datos del usuario
    if (user) {
      setCustomerName(user.full_name || '');
      setCustomerEmail(user.email || '');
    }

    // Cargar métodos de pago
    fetchPaymentMethods();
  }, [isAuthenticated, user, router]);

  // Efecto separado para manejar el carrito vacío
  useEffect(() => {
    if (isAuthenticated && !isProcessing && cartItems.length === 0) {
      // Esperar un poco antes de redirigir para evitar redirecciones inmediatas
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, cartItems.length, isProcessing, router]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await axios.get('http://localhost:3001/api/payment-methods');

      if (response.data.success) {
        const methodsWithIcons = response.data.data.map((method: any) => ({
          method_id: method.method_id,
          method_name: method.method_name,
          icon: getPaymentIcon(method.method_name)
        }));
        setPaymentMethods(methodsWithIcons);

        // Seleccionar el primer método por defecto
        if (methodsWithIcons.length > 0) {
          setSelectedPaymentMethod(methodsWithIcons[0].method_id);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback a métodos predeterminados si falla la API
      const fallbackMethods: PaymentMethod[] = [
        { method_id: 1, method_name: 'Efectivo', icon: <FaMoneyBillWave /> },
        { method_id: 2, method_name: 'Tarjeta de Crédito', icon: <FaCreditCard /> },
        { method_id: 3, method_name: 'Pago Móvil', icon: <FaMobile /> }
      ];
      setPaymentMethods(fallbackMethods);
      setSelectedPaymentMethod(1);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleCouponApplied = (discount: number, newTotal: number, couponCode: string) => {
    setAppliedCoupon(couponCode);
    setDiscountAmount(discount);
  };

  const calculateFinalTotal = () => {
    const numCartTotal = parseFloat(cartTotal.toString()) || 0; // Conversión mejorada
    return Math.max(0, numCartTotal - discountAmount);
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      alert('Por favor, verifica que tu información esté completa');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Por favor, selecciona un método de pago');
      return;
    }

    // Por ahora usar storeId = 1, esto se puede mejorar más tarde
    const storeId = 1;

    try {
      setLoading(true);
      setIsProcessing(true);

      console.log({
        userId: user?.user_id,
        storeId: storeId,
        paymentMethodId: selectedPaymentMethod,
        customerName,
        customerEmail,
        discountAmount,
        appliedCoupon,
        finalTotal: calculateFinalTotal()
      });

      const response = await axios.post('http://localhost:3001/api/cart/checkout', {
        userId: user?.user_id,
        storeId: storeId,
        paymentMethodId: selectedPaymentMethod,
        customerName,
        customerEmail,
        discountAmount: discountAmount,
        appliedCoupon: appliedCoupon,
        finalTotal: calculateFinalTotal()
      });

      if (response.data.success) {
        await clearCart();

        const orderData = response.data.data;
        alert(`¡Pedido realizado exitosamente!
        
          📋 Número de orden: #${orderData.ticketId}
          👤 Cliente: ${orderData.customerName}
          📧 Email: ${orderData.customerEmail}
          💰 Total pagado: $${orderData.finalTotal}
          ${orderData.discountAmount > 0 ? `🎟️ Descuento aplicado: $${orderData.discountAmount}` : ''}
                  
          ¡Gracias por tu compra!`);

        // Redirigir a una página de éxito
        router.push(`/order-success?orderId=${orderData.ticketId}`);
      } else {
        alert('Error al procesar el pedido: ' + response.data.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error durante el checkout:', error);
      alert('Error al procesar el pedido');
      setIsProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <MockupLayout title="Checkout - Point Brew" showAuthButtons={true}>
        <div className="checkout-container">
          <div className="loading-container">
            <p>Verificando autenticación...</p>
          </div>
        </div>
      </MockupLayout>
    );
  }

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <MockupLayout title="Checkout - Point Brew" showAuthButtons={true}>
        <div className="checkout-container">
          <div className="empty-checkout">
            <h2>No hay productos en el carrito</h2>
            <p>Serás redirigido al inicio en unos segundos...</p>
            <button onClick={() => router.push('/')} className="continue-shopping-btn">
              Ir al Inicio Ahora
            </button>
          </div>
        </div>
      </MockupLayout>
    );
  }

  return (
    <MockupLayout title="Finalizar Pedido - Point Brew" showAuthButtons={true}>
      <div className="checkout-container">
        <h1 className="checkout-title">Finalizar Pedido</h1>

        <div className="checkout-layout">
          {/* Resumen del pedido */}
          <div className="order-summary">
            <h2>Resumen del Pedido</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.cart_id} className="order-item">
                  <img
                    src={item.image_url || "/img/placeHolderFood.jpg"}
                    alt={item.product_name}
                    className="order-item-image"
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeHolderFood.jpg";
                    }}
                  />
                  <div className="order-item-details">
                    <h4>{item.product_name}</h4>
                    <p>Cantidad: {item.quantity}</p>
                    <p className="item-price">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div className="order-total-line">
                <span>Subtotal:</span>
                <span>${cartTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="order-total-line discount">
                  <span>Descuento ({appliedCoupon}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="order-total-line final-total">
                <span>Total:</span>
                <span>${calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formulario de checkout */}
          <div className="checkout-form">
            <h2>Información del Cliente</h2>

            <div className="form-group">
              <label htmlFor="customerName">Nombre Completo</label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">Correo Electrónico</label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
                disabled={loading}
              />
            </div>

            {/* Sección de cupones */}
            <CouponSection
              totalAmount={parseFloat(cartTotal.toString()) || 0}
              userId={user?.user_id || 0}
              onCouponApplied={handleCouponApplied}
            />

            <div className="form-group">
              <label>Método de Pago</label>
              {loadingPaymentMethods ? (
                <div className="loading-payment-methods">
                  <p>Cargando métodos de pago...</p>
                </div>
              ) : (
                <div className="payment-methods">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.method_id}
                      type="button"
                      className={`payment-method ${selectedPaymentMethod === method.method_id ? 'selected' : ''}`}
                      onClick={() => {
                        // 🆕 Validación chistosa
                        if (method.method_id === 2 && paymentId === null) {
                          router.push("/choosePaymentMethod");
                          return;
                        }
                        setSelectedPaymentMethod(method.method_id);
                      }}
                      disabled={loading}
                    >
                      {method.icon}
                      <span>{method.method_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="checkout-actions">
              <button
                onClick={() => router.push('/')}
                className="back-to-cart-btn"
                disabled={loading}
              >
                Seguir Comprando
              </button>
              <button
                onClick={handleCheckout}
                className="place-order-btn"
                disabled={loading || loadingPaymentMethods || !selectedPaymentMethod}
              >
                {loading ? 'Procesando...' : 'Realizar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MockupLayout>
  );
}