import { httpService } from '../httpService';
import type { OrderToken, OrderTokenListResponse } from '~/types/orderToken';

export const orderTokensService = {
  getAll: (params?: Record<string, any>) =>
    httpService.get<OrderTokenListResponse>('/order-tokens', params ? { params } : undefined),

  getTrash: (params?: Record<string, any>) =>
    httpService.get<OrderTokenListResponse>('/order-tokens/trash/list', params ? { params } : undefined),

  getById: (id: string) =>
    httpService.get<{ data: OrderToken }>(`/order-tokens/${id}`),

  update: (id: string, data: Partial<OrderToken>) =>
    httpService.patch<{ data: OrderToken }>(`/order-tokens/${id}`, data),

  delete: (id: string) => httpService.delete(`/order-tokens/${id}`),

  bulkDelete: (ids: string[]) =>
    httpService.delete('/order-tokens/bulk/delete', { data: { ids } }),

  restore: (id: string) => httpService.patch(`/order-tokens/${id}/restore`),

  bulkRestore: (ids: string[]) =>
    httpService.patch('/order-tokens/bulk/restore', { ids }),

  permanentDelete: (id: string) =>
    httpService.delete(`/order-tokens/${id}/permanent`),

  bulkPermanentDelete: (ids: string[]) =>
    httpService.delete('/order-tokens/bulk/permanent', { data: { ids } }),
};
