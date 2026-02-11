export interface OrderTable {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  [key: string]: any;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nid_number: string;
  nid_front_picture: string;
  nid_back_picture: string;
  address: string;
  date_joined: string;
  password: string;
  status: string;
  role: string;
  picture: string;
  base_salary: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  regular_price: string;
  sale_price: string;
  image: string;
  has_variations: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemVariation {
  id: string;
  name: string;
  name_bn: string;
  regular_price: string;
  sale_price: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  item: Item;
  item_variation: ItemVariation | null;
  created_at: string;
  updated_at: string;
}

export interface OrderTokenItem {
  id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  item: Item;
  item_variation: ItemVariation | null;
}

export interface OrderToken {
  id: string;
  token: string;
  token_type: string;
  order_items: OrderTokenItem[];
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  readyAt: string | null;
}

export interface OrderTokens {
  bar: OrderToken | null;
  kitchen: OrderToken | null;
}

export interface Order {
  id: string;
  order_id: string;
  order_type: string;
  tables: OrderTable[];
  customer: Customer | null;
  user: User;
  status: string;
  sub_total: number;
  total_amount: number;
  discount: any;
  discount_amount: number;
  payment_method: string;
  order_items: OrderItem[];
  order_tokens: OrderTokens;
  created_at: string;
  updated_at: string;
  order_tables: string[];
}