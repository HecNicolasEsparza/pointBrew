// services/userPaymentService.ts
import axios from "axios";

const BACKEND_ROUTE = process.env.NEXT_PUBLIC_API_BACKEND_ROUTE || "http://localhost:3001/api";

// Tipos para agregar un nuevo método de pago
export interface UserPaymentRequest {
  user_id: number;
  method_id: number;
  card_holder_name?: string;
  card_number?: string; // número completo
  card_expiry?: string;
  card_brand?: string;
  is_default?: boolean;
}

// Tipos de respuesta (opcional, puedes extender esto según lo que devuelva tu backend)
export interface UserPaymentMethod {
  user_payment_id: number;
  user_id: number;
  method_id: number;
  card_holder_name: string | null;
  card_number_last4: string | null;
  card_expiry: string | null;
  card_brand: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// POST: Agregar método de pago
export const addPaymentMethod = async (data: UserPaymentRequest): Promise<void> => {
  try {
    const payload = {
      userId: data.user_id,
      methodId: data.method_id,
      cardHolderName: data.card_holder_name,
      cardNumber: data.card_number, // número completo
      cardExpiry: data.card_expiry,
      cardBrand: data.card_brand,
      isDefault: data.is_default
    };

    await axios.post(`${BACKEND_ROUTE}/user-payment`, payload);
  } catch (error) {
    console.error("Error al agregar método de pago:", error);
    throw error;
  }
};

// GET: Obtener métodos de pago de un usuario
export const getUserPaymentMethods = async (userId: number): Promise<UserPaymentMethod[]> => {
  try {
    const response = await axios.get(`${BACKEND_ROUTE}/user-payment/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    throw error;
  }
};
