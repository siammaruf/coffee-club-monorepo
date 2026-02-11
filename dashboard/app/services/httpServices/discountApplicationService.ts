import { httpService } from '../httpService';
import type { DiscountApplication, DiscountApplicationListResponse, DiscountApplicationResponse, GetAllDiscountApplicationsParams } from '../../types/discountApplication';

export const discountApplicationService = {
  create: (application: FormData) => httpService.post<DiscountApplication>('/discount-applications', application),
  getById: (id: string) => httpService.get<DiscountApplicationResponse>(`/discount-applications/${id}`),
  update: (id: string, application: FormData) => httpService.put<DiscountApplication>(`/discount-applications/${id}`, application),
  delete: (id: string) => httpService.delete(`/discount-applications/${id}`),
  getAll: (params?: GetAllDiscountApplicationsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<DiscountApplicationListResponse>('/discount-applications', config);
  },
}