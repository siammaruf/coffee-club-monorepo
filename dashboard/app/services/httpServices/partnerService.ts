import { httpService } from '../httpService';
import type {
  Partner,
  PartnerListResponse,
  GetAllPartnersParams,
  PartnerPayload,
} from '~/types/partner';

export const partnerService = {
  getAll: (params?: GetAllPartnersParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<PartnerListResponse>('/partners', config);
  },
  getById: (id: string) => httpService.get<{ data: Partner }>(`/partners/${id}`),
  create: (data: PartnerPayload) => httpService.post<Partner>('/partners', data),
  update: (id: string, data: Partial<PartnerPayload>) =>
    httpService.put<{ data: Partner }>(`/partners/${id}`, data),
  delete: (id: string) => httpService.delete(`/partners/${id}`),
};
