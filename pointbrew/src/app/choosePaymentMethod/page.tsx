import MockupLayout from '@/components/MockupLayout';

export default function choosePaymentMethod() {
    const creditCards = [
        { icon: '/iconos/google pay.png', number: '**** **** **** 1234', name: 'Juan Pérez' },
        { icon: '/iconos/efectivo.png', number: '**** **** **** 5678', name: 'Ana Gómez' },
    ];


    return (
        <MockupLayout title="Point Brew" showAuthButtons={false}>
            <div className="choose-payment-container">
                <div className="choose-payment-logo-section">
                    <h2>Elige un método de pago</h2>
                </div>

                <div className="choose-payment-form-container">
                    <div className="credit-card-table">
                        <table>
                            <tbody>
                                {creditCards.map((card, index) => (
                                    <tr key={index}>
                                        <td>
                                            <img src={card.icon} alt="Método de pago" style={{ width: '40px', height: 'auto' }} />
                                        </td>
                                        <td>{card.number}</td>
                                        <td>{card.name}</td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MockupLayout>
    );
}
