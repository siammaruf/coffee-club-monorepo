import { OrderStatus, OrderType, PaymentMethod } from '../enums/orderEnum';
import { Product } from './product';
import { Table } from './table';

export interface OrderTable {
  id: string;
  name?: string;
  number?: string;
  capacity?: number;
  status?: string;
}

export interface OrderCustomer {
  id: string;
  name?: string;
  phone?: string;
  customer_type?: 'regular' | 'member';
  points?: number;
  balance?: number;
}

export interface OrderUser {
  id: string;
  name?: string;
  role?: string;
}

export interface OrderItemProduct {
  id: string;
  name?: string;
  price?: number;
  category?: string;
}

export interface OrderItem {
  id?: string;
  item?: OrderItemProduct;
  item_id?: string;
  item_variation?: {
    id: string;
    name?: string;
    name_bn?: string;
    regular_price?: string;
    sale_price?: string;
    status?: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
  };
  item_variation_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface OrderToken {
  id: string;
  tokenNumber: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export interface Order {
  id: string;
  order_id: string;
  order_type: OrderType;
  tables: OrderTable[];
  customer: OrderCustomer | null;
  user: OrderUser;
  status: OrderStatus;
  total_amount: number;
  sub_total: number;
  discount_amount: number;
  completion_time: number;
  payment_method: PaymentMethod;
  order_items: OrderItem[];
  customer_id: string | null;
  user_id: string;
  discount_id: string | null;
  order_tables: string[];
  created_at: string;
  updated_at: string;
  order_tokens?: {
    kitchen?: {
      token: string;
      status: string;
      priority: string;
      order_items: Array<any>;
    };
    bar?: {
      token: string;
      status: string;
      priority: string;
      order_items: Array<any>;
    };
  };
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
}

export interface OrderResponse {
  data: Order;
  status: string;
  message: string;
  statusCode: number;
}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface CreateOrderItemPayload {
  quantity: number;
  unit_price: number;
  total_price: number;
  item_id: string;
}

export interface CreateOrderPayload {
  order_type: OrderType;
  customer_id: string | null;
  user_id: string;
  discount_id: string | null;
  order_tables: string[];
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  completion_time: number;
  payment_method: PaymentMethod;
  order_items: CreateOrderItemPayload[];
}

export interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  products: any[];
  categories: any[];
  onProductSelect: (product: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (categorySlug: string | null) => void;
  loading?: boolean;
}
