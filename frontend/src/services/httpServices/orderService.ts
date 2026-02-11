import { get, post, put } from '../httpMethods'
import type { Order, OrdersResponse, CreateOrderPayload } from '@/types/order'

export const orderService = {
  createOrder: (payload: CreateOrderPayload) =>
    post<{ data: Order }>('/customer/orders', payload).then((res) => res.data),

  getOrders: (page = 1, limit = 10) =>
    get<OrdersResponse>('/customer/orders', { params: { page, limit } }),

  getOrder: (id: string) =>
    get<{ data: Order }>(`/customer/orders/${id}`).then((res) => res.data),

  cancelOrder: (id: string) =>
    put<{ data: Order }>(`/customer/orders/${id}/cancel`).then((res) => res.data),
}
