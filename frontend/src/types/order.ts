export type OrderType = 'DINEIN' | 'TAKEAWAY' | 'DELIVERY'
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'BKASH' | 'BANK' | 'OTHER'

export interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  item?: {
    id: string
    name: string
    image: string
    regular_price: number
    sale_price: number
  }
  variation?: {
    id: string
    name: string
    name_bn: string
  }
  created_at: string
  updated_at: string
}

export interface OrderTable {
  id: string
  number: string
  seat: number
  status?: string
}

export interface Order {
  id: string
  order_id: string
  order_type: OrderType
  status: OrderStatus
  sub_total: number
  total_amount: number
  discount_amount: number
  payment_method?: PaymentMethod
  delivery_address?: string
  special_instructions?: string
  order_source?: string
  /** Backend returns this as `order_items` (snake_case) */
  order_items: OrderItem[]
  tables?: OrderTable[]
  created_at: string
  updated_at: string
}

/**
 * Backend returns pagination fields at the root level, not inside a `meta` object.
 * Shape: { data, total, page, limit, totalPages, status, message, statusCode }
 */
export interface OrdersResponse {
  data: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
  status: string
  message: string
  statusCode: number
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
    variation_id?: string
  }>
}
