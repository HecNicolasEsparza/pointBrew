// services/cartService.ts
import axios from "axios";

const BACKEND_ROUTE = process.env.NEXT_PUBLIC_API_BACKEND_ROUTE || "http://localhost:3001/api";

interface CartRequest {
  user_id: number;
  product_id: number;
  quantity: number;
}

export const addToCart = async (data: CartRequest): Promise<void> => {
  try {
    const payload = {
      userId: data.user_id,
      productId: data.product_id,
      quantity: data.quantity
    };

    await axios.post(`${BACKEND_ROUTE}/cart/add`, payload);
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    throw error;
  }
};
