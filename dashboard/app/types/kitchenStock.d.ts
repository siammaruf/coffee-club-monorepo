export interface KitchenStockEntry {
  id: string;
  kitchen_item_id: string;
  kitchen_item: {
    id: string;
    name: string;
    type: string;
  };
  quantity: number;
  unit: string;
  purchase_price: number;
  purchase_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface KitchenStockSummaryItem {
  kitchen_item_id: string;
  name: string;
  type: string;
  total_quantity: number;
  total_value: number;
  low_stock_threshold: number | null;
  is_low_stock: boolean;
}

export interface KitchenStockListResponse {
  data: KitchenStockEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KitchenStockFilters {
  page?: number;
  limit?: number;
  type?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateKitchenStockInput {
  kitchen_item_id: string;
  quantity: number;
  unit?: string;
  purchase_price: number;
  purchase_date: string;
  note?: string;
}

export interface UpdateKitchenStockInput {
  quantity?: number;
  unit?: string;
  purchase_price?: number;
  purchase_date?: string;
  note?: string;
}
