import MockupLayout from '@/components/MockupLayout';
import Link from 'next/link';

export default function AddPaymentMethod() {
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

          <form className="add-payment-form">
            <div className="add-payment-group">
              <label htmlFor="cardNumber">Número de Tarjeta</label>
              <input
                type="text"
                id="cardNumber"
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div className="add-payment-group">
              <label htmlFor="nameInCard">Nombre en la tarjeta</label>
              <input type="text" id="nameInCard" required />
            </div>

            {/* Grupo horizontal para Mes y Año */}
            <div className="add-payment-horizontal-group">
              <div className="add-payment-group small-input">
                <label htmlFor="expiryMonth">Mes</label>
                <input
                  type="number"
                  id="expiryMonth"
                  min="1"
                  max="12"
                  placeholder="MM"
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
                  required
                />
              </div>
            </div>

            {/* CVV separado */}
            <div className="add-payment-group small-input cvv-input">
              <label htmlFor="cvv">CVV</label>
              <input
                type="password"
                id="cvv"
                maxLength={4}
                placeholder="123"
                required
              />
            </div>

            <div className="add-payment-btn-group">
              <button type="submit" className="add-payment-btn">
                Guardar método
              </button>

              <button type="button" className="add-payment-btn red-btn">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </MockupLayout>
  );
}
