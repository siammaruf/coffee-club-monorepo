import type { Product } from "./product";

export interface ProductCategory {
  id: string;
  name: string;
  name_bn?: string;
  slug: string;
}

export interface Variation {
  id?: string;
  name: string;
  name_bn?: string;
  regular_price: number;
  sale_price?: number;
  status: string;
  sort_order?: number;
};

export interface Product {
  id?: string;
  name: string;
  name_bn?: string;
  slug?: string;
  description?: string;
  image?: string;
  type: "BAR" | "KITCHEN";
  status: string;
  regular_price: number;
  sale_price?: number;
  has_variations?: boolean;
  categories: ProductCategory[];
  variations?: Variation[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormValues {
  name: string;
  name_bn?: string;
  description?: string;
  type: string;
  regular_price: number;
  sale_price?: number;
  category: string;
  status: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAllProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "BAR" | "KITCHEN";
  category?: string;
  categorySlug?: string;
  status?: string;
  sort?: 'name' | 'price' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
}

export interface ProductResponse {
  data: Product;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}