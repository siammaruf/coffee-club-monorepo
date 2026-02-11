import type { KitchenOrder } from '~/types/kitchenOrder';
import { httpService } from '../httpService';

const BASE_URL = "/kitchen-orders";

export const kitchenOrderService = {
  getAll: (params?: any) => httpService.get(BASE_URL, { params }),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: KitchenOrder) => httpService.post(BASE_URL, data),
  update: (id: string, data: KitchenOrder) => httpService.put(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  approve: (id: string) => httpService.patch(`${BASE_URL}/approve/${id}`),
};
