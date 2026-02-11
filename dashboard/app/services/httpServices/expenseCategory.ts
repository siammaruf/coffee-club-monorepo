import type { ExpenseCategoryCreate } from '~/types/expenseCategory';
import { httpService } from '../httpService';

const BASE_URL = "/expense-categories";

const expenseCategoryService = {
  getAll: () => httpService.get(BASE_URL),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: ExpenseCategoryCreate) => httpService.post(BASE_URL, data),
  update: (id: string, data: ExpenseCategoryCreate) => httpService.put(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
};

export default expenseCategoryService;
