import { httpService } from '../httpService';

const BASE_URL = "/kitchen-items";

export const kitchenItemsService = {
  getAll: (params?: any) => httpService.get(BASE_URL, { params }),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: FormData) => httpService.post(BASE_URL, data),
  update: (id: string, data: FormData) => httpService.patch(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
};
