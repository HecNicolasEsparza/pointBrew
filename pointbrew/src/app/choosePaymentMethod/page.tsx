'use client'; 
import React, { useEffect, useState } from 'react';
import MockupLayout from '@/components/MockupLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPaymentMethods, UserPaymentMethod } from '@/contexts/services/userPaymentService';
import { useRouter } from 'next/navigation';

export default function ChoosePaymentMethod() {
    const { user } = useAuth();
    const router = useRouter();
    const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            if (!user) {
                setError('Usuario no autenticado');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const methods = await getUserPaymentMethods(user.user_id);
                setPaymentMethods(methods);
            } catch (err) {
                setError('Error al obtener métodos de pago');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethods();
    }, [user]);

    const handleConfirm = () => {
        console.log('Confirmar selección (lógica aún no implementada)');
    };

    return (
        <MockupLayout title="Point Brew" showAuthButtons={false}>
            <div className="choose-payment-container">
                <div className="choose-payment-logo-section">
                    <h2>Elige un método de pago</h2>
                </div>

                <div className="choose-payment-form-container">
                    {loading && <p>Cargando métodos de pago...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {!loading && !error && (
                        <div className="credit-card-table">
                            <table>
                                <tbody>
                                    {paymentMethods.length === 0 && (
                                        <tr>
                                            <td colSpan={3}>No tienes métodos de pago registrados.</td>
                                        </tr>
                                    )}

                                    {paymentMethods.map((method) => (
                                        <tr key={method.user_payment_id}>
                                            <td>
                                                <img
                                                    src={
                                                        method.card_brand?.toLowerCase() === 'visa'
                                                            ? '/iconos/visa.png'
                                                            : method.card_brand?.toLowerCase() === 'mastercard'
                                                                ? '/iconos/mastercard.png'
                                                                : '/iconos/default-card.png'
                                                    }
                                                    alt={method.card_brand || 'Método de pago'}
                                                    style={{ width: '40px', height: 'auto' }}
                                                />
                                            </td>
                                            <td>
                                                {'**** **** **** ' + (method.card_number_last4 || '1234')}
                                            </td>
                                            <td>{method.card_holder_name || 'Nombre no disponible'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Botones confirm/cancel */}
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button className="confirm-button" onClick={handleConfirm}>Confirmar</button>
                        <button className="cancel-button" onClick={() => router.back()}>Regresar</button>
                    </div>
                </div>
            </div>
        </MockupLayout>
    );
}
