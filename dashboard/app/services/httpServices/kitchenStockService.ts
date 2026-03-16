import { httpService } from '../httpService';

const BASE_URL = '/kitchen-stock';

export const kitchenStockService = {
  getAll: (params?: Record<string, any>) => httpService.get(BASE_URL, { params }),
  getSummary: (type?: string) =>
    httpService.get(`${BASE_URL}/summary`, type ? { params: { type } } : undefined),
  getLowStockAlerts: () => httpService.get(`${BASE_URL}/low-stock-alerts`),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: Record<string, any>) => httpService.post(BASE_URL, data),
  update: (id: string, data: Record<string, any>) => httpService.patch(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
};
