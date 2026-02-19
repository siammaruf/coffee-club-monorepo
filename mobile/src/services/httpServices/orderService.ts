import { Order, OrderListResponse, OrderResponse, GetAllOrdersParams } from '../../types/order';
import { httpService } from '../httpService';

export const orderService = {
  getAll: (params?: GetAllOrdersParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<OrderListResponse>('/orders', config);
  },
  create: (order: Partial<Order>) => httpService.post<OrderResponse>('/orders', order),
  update: (id: string, order: Partial<Order>) => httpService.put<OrderResponse>(`/orders/${id}`, order),
  getById: (id: string) => httpService.get<OrderResponse>(`/orders/${id}`),
  delete: (id: string) => httpService.delete<{ message: string }>(`/orders/${id}`),
};
