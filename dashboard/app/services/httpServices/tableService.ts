import type { TableFormData, TableListResponse, TableResponse } from '~/types/table';
import { httpService } from '../httpService';

export const tableService = {
  create: (formData: FormData) => httpService.post<TableResponse>('/tables', formData),
  getAll: (params?: any) => {
    const config = params ? { params } : undefined;
    return httpService.get<TableListResponse>('/tables', config);
  },
  getAvailable: () => httpService.get<TableListResponse>('/tables/available'),
  getByNumber: (number: string) => httpService.get<TableResponse>(`/tables/number/${number}`),
  getById: (id: string) => httpService.get<TableResponse>(`/tables/${id}`),
  update: (id: string, data: TableFormData) => httpService.patch<TableResponse>(`/tables/${id}`, data),
  delete: (id: string) => httpService.delete(`/tables/${id}`),
  changeStatus: (id: string, status: string) => httpService.patch<TableResponse>(`/tables/${id}/status`, { status }),
};