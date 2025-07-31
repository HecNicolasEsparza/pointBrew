import MockupLayout from '@/components/MockupLayout';

export default function OrderState() {
  const states = ['en preparación', 'listo para ser recibido'];
  const icons = ['/iconos/cookingIcon.png', '/iconos/readyIcon.png']; // ✅ Rutas desde /public

  return (
    <MockupLayout title="Point Brew" showAuthButtons={false}>
      <div className="order-state-container">
        <h2>Estado de la orden</h2>
        <div className="order-state-form-container">
          <h3>Código del pedido: 312</h3>
          <img src="/img/placeHolderFood.jpg" alt="Foto del platillo" className="auth-logo" />
          <div className="status-block">
             <img src={icons[0]} alt="Estado del pedido" className="state-icon" />
            <h3>Tu pedido está {states[0]}</h3>
          </div>
        </div>
      </div>
    </MockupLayout>
  );
}
