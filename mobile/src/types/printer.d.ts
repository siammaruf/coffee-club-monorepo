export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  customizations?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tableNumbers: string[];
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType: 'DINEIN' | 'TAKEAWAY';
  createdAt: string;
  estimatedTime: string;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'mobile';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
}

export interface ReceiptData {
  orderId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  tableNumbers?: string[];
  orderType: 'DINEIN' | 'TAKEAWAY';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  estimatedTime?: string;
}
