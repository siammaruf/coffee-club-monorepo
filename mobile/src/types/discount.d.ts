export interface Discount {
  id: string;
  name: string;
  discount_type: string;
  discount_value: number;
  description: string;
  expiry_date: string;
}

export interface DiscountListResponse {
  data: Discount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface DiscountResponse {
  data: Discount;
  status?: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface GetAllDiscountsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface AddDiscountApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}
