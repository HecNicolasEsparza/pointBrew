export interface Product {
  product_id: number;
  name: string;
  price: number;
  available: boolean;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_id: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
}
