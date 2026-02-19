export interface DiscountApplication {
  id: string;
  discount_type: string;
  discount: Discount | string | number | null;
  customers?: string[];
  products?: string[];
  categories?: string[];
}

export interface DiscountApplicationListResponse {
  data: DiscountApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface DiscountApplicationResponse {
  data: DiscountApplication;
  status?: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface GetAllDiscountApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: any;
}
