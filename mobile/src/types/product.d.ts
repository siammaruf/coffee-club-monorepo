export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
  name_bn?: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  name_bn?: string;
  regular_price: string;
  sale_price?: string | null;
  status: string;
  sort_order: number;
  item_id?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id?: string;
  name: string;
  name_bn?: string;
  slug?: string;
  description?: string;
  image?: string;
  type: 'BAR' | 'KITCHEN' | 'bar' | 'kitchen';
  status: string;
  regular_price: number;
  sale_price?: number | null;
  has_variations?: boolean;
  variations?: ProductVariation[];
  max_price?: number;
  categories: ProductCategory[];
  deleted_at?: string | null;
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
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface GetAllProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "BAR" | "KITCHEN";
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
