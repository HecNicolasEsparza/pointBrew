// services/productService.ts
import axios from "axios";
import { ProductResponse } from "../models/products";

const BACKEND_ROUTE = process.env.NEXT_PUBLIC_API_BACKEND_ROUTE || "http://localhost:3001/api";

export const fetchProductsByStore = async (storeId: number): Promise<ProductResponse> => {
  const response = await axios.get<ProductResponse>(`${BACKEND_ROUTE}/products/store/${storeId}`);
  return response.data;
};
