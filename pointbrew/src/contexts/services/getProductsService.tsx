// services/productService.ts
import axios from "axios";
import { ProductResponse } from "../models/products";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchProductsByStore = async (storeId: number): Promise<ProductResponse> => {
  const response = await axios.get<ProductResponse>(`${BASE_URL}/products/store/${storeId}`);
  return response.data;
};
