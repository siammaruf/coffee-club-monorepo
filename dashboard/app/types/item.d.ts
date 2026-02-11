export interface Variation {
  id?: string;
  name: string;
  name_bn?: string;
  regular_price: number;
  sale_price?: number;
  status: string;
  sort_order?: number;
};

export interface Item {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  type: string;
  status: string;
  regular_price: number;
  sale_price: number;
  image: string;
  has_variations?: boolean;
  categories: Object[];
  variations?: Variation[];
  created_at?: string;
  updated_at?: string;
}
