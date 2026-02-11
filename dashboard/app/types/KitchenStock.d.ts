export interface KitchenItem{
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  image: string;
  description: string;
  type: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export interface KitchenStock{
  id: string;
  quantity: number;
  kitchen_item_id: string;
  price: number;
  total_price?: string;
  description: string;
  kitchen_item: KitchenItem;
  created_at?: string | null;
  updated_at?: string | null;
};  

export interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (data: Omit<KitchenStock, "id">) => Promise<void>;
}