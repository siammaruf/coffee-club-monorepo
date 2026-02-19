import { TableListResponse, TableResponse } from '../../types/table';
import { httpService } from '../httpService';

export const tableService = {
  getAll: (params?: any) => {
    const config = params ? { params } : undefined;
    return httpService.get<TableListResponse>('/tables', config);
  },
  getAvailable: () => httpService.get<TableListResponse>('/tables/available'),
  getByNumber: (number: string) => httpService.get<TableResponse>(`/tables/number/${number}`),
  getById: (id: string) => httpService.get<TableResponse>(`/tables/${id}`),
  changeStatus: (id: string, status: string) => httpService.patch<TableResponse>(`/tables/${id}/status`, { status }),
};
