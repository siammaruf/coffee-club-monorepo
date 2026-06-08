import { httpService } from '../httpService';
import type { Vendor, VendorFilters, CreateVendorInput, UpdateVendorInput } from '~/types/vendor';

const BASE_URL = '/vendors';

export const vendorService = {
  create: (data: CreateVendorInput) => httpService.post<Vendor>(BASE_URL, data),
  getAll: (params?: VendorFilters) => httpService.get<Vendor[]>(BASE_URL, params ? { params } : undefined),
  getActive: () => httpService.get<Vendor[]>(`${BASE_URL}/active`),
  getById: (id: string) => httpService.get<Vendor>(`${BASE_URL}/${id}`),
  update: (id: string, data: UpdateVendorInput) => httpService.put<Vendor>(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  bulkDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/delete`, { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get(`${BASE_URL}/trash/list`, params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`${BASE_URL}/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`${BASE_URL}/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch(`${BASE_URL}/bulk/restore`, { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/permanent`, { data: { ids } }),
};
