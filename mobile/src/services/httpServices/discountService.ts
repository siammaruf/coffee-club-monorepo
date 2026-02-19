import { DiscountListResponse, DiscountResponse, GetAllDiscountsParams } from '../../types/discount';
import { httpService } from '../httpService';

export const discountService = {
  getById: (id: string) => httpService.get<DiscountResponse>(`/discounts/${id}`),
  getAll: (params?: GetAllDiscountsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<DiscountListResponse>('/discounts', config);
  },
  getNotExpired: (params?: GetAllDiscountsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<DiscountListResponse>('/discounts/not-expired', config);
  },
};
