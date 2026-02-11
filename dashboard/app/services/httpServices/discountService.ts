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
};