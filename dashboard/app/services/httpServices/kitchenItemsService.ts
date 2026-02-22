import { httpService } from '../httpService';

const BASE_URL = "/kitchen-items";

export const kitchenItemsService = {
  getAll: (params?: any) => httpService.get(BASE_URL, { params }),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: FormData) => httpService.post(BASE_URL, data),
  update: (id: string, data: FormData) => httpService.patch(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  bulkDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/delete`, { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get(`${BASE_URL}/trash/list`, params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`${BASE_URL}/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`${BASE_URL}/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch(`${BASE_URL}/bulk/restore`, { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/permanent`, { data: { ids } }),
};
