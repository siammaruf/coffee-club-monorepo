import { httpService } from '../httpService';
import type { Discount, DiscountListResponse, DiscountResponse, GetAllDiscountsParams } from '~/types/discount';

export const discountService = {
  create: (discount: FormData) => httpService.post<Discount>('/discounts', discount),
  getById: (id: string) => httpService.get<DiscountResponse>(`/discounts/${id}`),
  update: (id: string, discount: FormData) => httpService.put<Discount>(`/discounts/${id}`, discount),
  delete: (id: string) => httpService.delete(`/discounts/${id}`),
  getAll: (params?: GetAllDiscountsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<DiscountListResponse>('/discounts', config);
  },
  getNotExpired: (params?: GetAllDiscountsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<DiscountListResponse>('/discounts/not-expired', config);
  },
  bulkDelete: (ids: string[]) => httpService.delete('/discounts/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/discounts/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/discounts/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/discounts/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/discounts/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/discounts/bulk/permanent', { data: { ids } }),
};