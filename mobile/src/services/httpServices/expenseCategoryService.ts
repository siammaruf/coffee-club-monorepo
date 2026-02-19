import type { ExpenseCategory } from '../../types/expense';
import { httpService } from '../httpService';

interface ExpenseCategoryListResponse {
  data: ExpenseCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface ExpenseCategoryResponse {
  data: ExpenseCategory;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

const BASE_URL = '/expense-categories';

const expenseCategoryService = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) => {
    const config = params ? { params } : undefined;
    return httpService.get<ExpenseCategoryListResponse>(BASE_URL, config);
  },
  getById: (id: string) => httpService.get<ExpenseCategoryResponse>(`${BASE_URL}/${id}`),
};

export default expenseCategoryService;
