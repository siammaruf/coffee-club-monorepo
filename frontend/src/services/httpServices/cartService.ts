import { get, post, put, del } from '../httpMethods'
import type { Cart, AddToCartPayload, UpdateCartItemPayload } from '@/types/cart'

export const cartService = {
  getCart: () =>
    get<{ data: Cart }>('/customer/cart').then((res) => res.data),

  addItem: (payload: AddToCartPayload) =>
    post<{ data: Cart }>('/customer/cart/items', payload).then((res) => res.data),

  updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
    put<{ data: Cart }>(`/customer/cart/items/${itemId}`, payload).then((res) => res.data),

  removeItem: (itemId: string) =>
    del<{ data: Cart }>(`/customer/cart/items/${itemId}`).then((res) => res.data),

  clearCart: () =>
    del<{ data: Cart }>('/customer/cart').then((res) => res.data),
}
