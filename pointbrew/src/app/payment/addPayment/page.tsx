"use client";
import MockupLayout from '@/components/MockupLayout';
import { addPaymentMethod } from '@/contexts/services/userPaymentService';
import { useAuth } from '@/contexts/AuthContext';
import {useState} from 'react';
import { useRouter } from 'next/navigation';


export default function AddPaymentMethod() {
  const { user } = useAuth();
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Debes estar autenticado para agregar un método de pago.');
      return;
    }

    const expiry = `${expiryMonth.padStart(2, '0')}/${expiryYear}`;

    const paymentData = {
      user_id: user.user_id,
      method_id: 1,
      card_holder_name: cardHolder,
      card_number: cardNumber.replace(/\s/g, ''),
      card_expiry: expiry,
      card_brand: 'Visa',
      is_default: true,
      is_active: true
    };

    try {
      setLoading(true);
      console.log("Datos que se envían al backend:", paymentData);
      await addPaymentMethod(paymentData);
      router.push('/');
    } catch (err) {
      setError('Ocurrió un error al guardar el método de pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MockupLayout title="Point Brew" showAuthButtons={false}>
      <div className="add-payment-container">
        <div className="logo-fixed-addPayment">
          <img src="/img/Logo.png" alt="Point Brew Logo" className="add-payment-logo" />
        </div>

        <div className="add-payment-form-container">
          <div className="add-payment-header">
            <h2>Agregar Método de Pago</h2>
          </div>

          <form className="add-payment-form" onSubmit={handleSubmit}>
            <div className="add-payment-group">
              <label htmlFor="cardNumber">Número de Tarjeta</label>
              <input
                type="text"
                id="cardNumber"
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>

            <div className="add-payment-group">
              <label htmlFor="nameInCard">Nombre en la tarjeta</label>
              <input
                type="text"
                id="nameInCard"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                required
              />
            </div>

            <div className="add-payment-horizontal-group">
              <div className="add-payment-group small-input">
                <label htmlFor="expiryMonth">Mes</label>
                <input
                  type="number"
                  id="expiryMonth"
                  min="1"
                  max="12"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  required
                />
              </div>

              <div className="add-payment-group small-input">
                <label htmlFor="expiryYear">Año</label>
                <input
                  type="number"
                  id="expiryYear"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 20}
                  placeholder="AAAA"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="add-payment-group small-input cvv-input">
              <label htmlFor="cvv">CVV</label>
              <input
                type="password"
                id="cvv"
                maxLength={4}
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="add-payment-btn-group">
              <button type="submit" className="add-payment-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar método'}
              </button>

              <button
                type="button"
                className="add-payment-btn red-btn"
                onClick={() => router.push('/')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </MockupLayout>
  );
}
