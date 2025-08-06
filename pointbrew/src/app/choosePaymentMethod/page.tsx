'use client';
import React, { useEffect, useState } from 'react';
import MockupLayout from '@/components/MockupLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPaymentMethods, UserPaymentMethod } from '@/contexts/services/userPaymentService';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setPaymentId } from '@/contexts/redux/slides/idPaymentSlice'; 

export default function ChoosePaymentMethod() {
    const { user } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch();

    const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

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

                if (methods.length > 0) {
                    setSelectedPaymentId(methods[0].user_payment_id);
                }
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
        if (selectedPaymentId === null) {
            alert('Por favor selecciona un método de pago.');
            return;
        }

        // Guardar en redux
        dispatch(setPaymentId(selectedPaymentId));

        // Aquí puedes continuar con navegación o mostrar mensaje
        console.log('Método de pago guardado en redux:', selectedPaymentId);
        router.push('/checkout');
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
                                            <td colSpan={4}>No tienes métodos de pago registrados.</td>
                                        </tr>
                                    )}

                                    {paymentMethods.map((method) => (
                                        <tr key={method.user_payment_id}>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.user_payment_id}
                                                    checked={selectedPaymentId === method.user_payment_id}
                                                    onChange={() => setSelectedPaymentId(method.user_payment_id)}
                                                />
                                            </td>
                                            <td>
                                                
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

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button className="confirm-button" onClick={handleConfirm}>Confirmar</button>
                        <button className="cancel-button"  onClick={() => router.push('/payment/addPayment')}>Agregar métodos de pago</button>
                    </div>
                </div>
            </div>
        </MockupLayout>
    );
}
