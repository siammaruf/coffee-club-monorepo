import type { ExpenseCategoryCreate } from '~/types/expenseCategory';
import { httpService } from '../httpService';

const BASE_URL = "/expense-categories";

const expenseCategoryService = {
  getAll: (params?: any) => httpService.get(BASE_URL, { params }),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: ExpenseCategoryCreate) => httpService.post(BASE_URL, data),
  update: (id: string, data: ExpenseCategoryCreate) => httpService.put(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  bulkDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/delete`, { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get(`${BASE_URL}/trash/list`, params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`${BASE_URL}/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`${BASE_URL}/${id}/permanent`),
};

export default expenseCategoryService;
