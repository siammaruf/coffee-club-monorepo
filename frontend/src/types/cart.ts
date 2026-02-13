import type { Item } from './item'

/** Shape returned by backend CartItemResponseDto */
export interface CartItemResponse {
  id: string
  item: {
    id: string
    name: string
    name_bn: string
    image: string
    regular_price: number
    sale_price: number
  }
  quantity: number
  special_notes: string | null
  line_total: number
}

/** Shape returned by backend CartResponseDto */
export interface Cart {
  id: string
  items: CartItemResponse[]
  total: number
  item_count: number
}

export interface AddToCartPayload {
  item_id: string
  quantity: number
  special_notes?: string
}

export interface UpdateCartItemPayload {
  quantity?: number
  special_notes?: string
}

/** Local cart item (used in local store before syncing with server) */
export interface LocalCartItem {
  id: string
  item: Item
  quantity: number
  special_notes?: string
}
