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
  bulkDelete: (ids: string[]) => httpService.delete('/partners/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/partners/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/partners/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/partners/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/partners/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/partners/bulk/permanent', { data: { ids } }),
};
