import { httpService } from '../httpService';
import type { Order, OrderListResponse, GetAllOrdersParams, OrderResponse } from '~/types/order';

export const orderService = {
  create: (order: FormData) => httpService.post<Order>('/orders', order),
  getById: (id: string) => httpService.get<OrderResponse>(`/orders/${id}`),
  update: (id: string, order: FormData) => httpService.put<Order>(`/orders/${id}`, order),
  delete: (id: string) => httpService.delete(`/orders/${id}`),
  getAll: (params?: GetAllOrdersParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<OrderListResponse>('/orders', config);
  },
  bulkDelete: (ids: string[]) => httpService.delete('/orders/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/orders/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/orders/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/orders/${id}/permanent`),
};