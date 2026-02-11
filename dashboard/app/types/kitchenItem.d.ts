export interface AddKitchenItemAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (data: FormData) => Promise<void>;
};

export interface KitchenItemForm{
  name: string;
  name_bn: string;
  slug: string;
  image: string;
  description: string;
  type: "KITCHEN" | "BAR";
};

export interface KitchenItem {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  image: string | null;
  description: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}