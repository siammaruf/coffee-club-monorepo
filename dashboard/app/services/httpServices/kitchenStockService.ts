import { httpService } from '../httpService';
import type { KitchenStockFilters, CreateKitchenStockInput, CreateUsageStockInput, UpdateKitchenStockInput } from '~/types/kitchenStock';

const BASE_URL = '/kitchen-stock';

export const kitchenStockService = {
  getAll: (params?: KitchenStockFilters) => httpService.get(BASE_URL, { params }),
  getSummary: (type?: string) =>
    httpService.get(`${BASE_URL}/summary`, type ? { params: { type } } : undefined),
  getLowStockAlerts: () => httpService.get(`${BASE_URL}/low-stock-alerts`),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: CreateKitchenStockInput) => httpService.post(BASE_URL, data),
  recordUsage: (data: CreateUsageStockInput) =>
    httpService.post(BASE_URL, { ...data, purchase_price: 0 }),
  update: (id: string, data: UpdateKitchenStockInput) => httpService.patch(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
};
