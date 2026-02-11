import type { Item } from './item'

export interface CartItem {
  id: string
  item: Item
  quantity: number
  special_notes?: string
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
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

// Local cart item (used in Redux store, not server-side cart)
export interface LocalCartItem {
  id: string
  item: Item
  quantity: number
  special_notes?: string
}
