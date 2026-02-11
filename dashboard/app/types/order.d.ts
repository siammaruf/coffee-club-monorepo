import type { Item } from "./item";

export interface OrderTable {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: 'available' | 'occupied' | 'reserved' | 'unavailable' | 'out_of_service';
  created_at: string;
  updated_at: string;
}

export interface OrderItemProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  item: Item;
  order: Order;
  created_at: string;
  updated_at: string;
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
  order_type: 'DINEIN' | 'TAKEAWAY';
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  payment_method: string;
  discount_amount: number;
  sub_total: number;
  total_amount: number;
  customer: any;
  user: any;
  tables: OrderTable[];
  order_items: OrderItem[];
  order_tokens?: {
    bar?: {
      id: string;
      token: string;
      token_type: string;
      order_items: OrderItem[];
      priority: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      readyAt: string | null;
    };
    kitchen?: {
      id: string;
      token: string;
      token_type: string;
      order_items: OrderItem[];
      priority: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      readyAt: string | null;
    };
    [key: string]: any;
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
  status?: string;
  message?: string;
  statusCode?: number;
}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

interface ApiTable {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiOrder {
  order_tokens: any;
  id: string;
  order_id: string
  tables: ApiTable[];
  customer: any;
  user: any;
  status: string;
  total_amount: number;
  sub_total: Number;
  order_type: string;
  order_items: any[];
  discount_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface ApiOrderListResponse {
  data: ApiOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface ApiTable {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: string;
}

interface ApiOrder {
  id: string;
  tables: ApiTable[];
  customer: any;
  user: any;
  status: string;
  total_amount: number;
  discount_amount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface ApiOrderListResponse {
  data: ApiOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}