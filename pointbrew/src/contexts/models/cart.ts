// models/cart.ts
export interface CartRequest {
  user_id: number;
  product_id: number;
  quantity: number;
}
