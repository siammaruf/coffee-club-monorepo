export interface KitchenItem {
  name: string;
  name_bn?: string;
  image?: string;
  price: number; 
}

export interface KitchenStock {
  kitchen_item: KitchenItem;
  quantity: number;
  created_at?: string;
}

export interface KitchenOrderItem {
  kitchen_stock_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface KitchenOrder {
  order_items: KitchenOrderItem[];
  is_approved: boolean;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface KitchenOrderItemResponse {
  id: string;
  kitchen_stock_id: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  created_at?: string;
  updated_at?: string;
  kitchen_stock?: {
    id: string;
    price: string;
    quantity: number;
    kitchen_item?: {
      id: string;
      name: string;
    };
  };
}

export interface KitchenOrderResponse {
  id: string;
  order_id: string;
  order_items: KitchenOrderItem[];
  is_approved: boolean;
  description: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
}