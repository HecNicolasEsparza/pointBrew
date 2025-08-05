import MockupLayout from '@/components/MockupLayout';


export default function TicketGenerated() {
  return (
    <MockupLayout title="Point Brew" showAuthButtons={false}>
      <div className="ticket-generated-container">
        <div className="ticket-generated-box">
          <div className="ticket-generated-header">
            <h2>¡Felicidades, tu pedido ha sido generado!</h2>
            <p>Código de pedido: <strong>312</strong></p>
          </div>

          <button type="button" className="ticket-generated-btn">
            Ver estado del pedido
          </button>
        </div>
      </div>
    </MockupLayout>
  );
}
