export type OrderTokenStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
export type OrderTokenPriority = 'Normal' | 'High' | 'Urgent';
export type TokenType = 'BAR' | 'KITCHEN';

export interface OrderTokenItem {
  id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item?: {
    id: string;
    name: string;
    [key: string]: any;
  };
  item_id?: string;
}

export interface OrderToken {
  id: string;
  token: string;
  token_type: TokenType;
  orderId: string;
  order_items: OrderTokenItem[];
  priority: OrderTokenPriority;
  status: OrderTokenStatus;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  deleted_at?: string | null;
}

export interface OrderTokenListResponse {
  data: OrderToken[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
}
