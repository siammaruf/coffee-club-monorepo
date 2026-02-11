export type OrderType = 'DINEIN' | 'TAKEAWAY' | 'DELIVERY'
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'BKASH' | 'BANK' | 'OTHER'

export interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  item: {
    id: string
    name: string
    image: string
  }
}

export interface Order {
  id: string
  order_id: string
  order_type: OrderType
  status: OrderStatus
  sub_total: number
  total_amount: number
  discount_amount: number
  payment_method: PaymentMethod
  delivery_address?: string
  special_instructions?: string
  order_source: string
  orderItems: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrdersResponse {
  data: Order[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateOrderPayload {
  order_type: OrderType
  payment_method: PaymentMethod
  delivery_address?: string
  special_instructions?: string
  table_ids?: string[]
  items: Array<{
    item_id: string
    quantity: number
  }>
}
