import type { ExpenseCreate, ExpenseItem, ExpenseUpdate } from '../../types/expense';
import { httpService } from '../httpService';

interface ExpenseListResponse {
  data: ExpenseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface ExpenseResponse {
  data: ExpenseItem;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

const BASE_URL = '/expenses';

const expenseService = {
  getAll: (params?: any) => httpService.get<ExpenseListResponse>(BASE_URL, { params }),
  getById: (id: string) => httpService.get<ExpenseResponse>(`${BASE_URL}/${id}`),
  create: (data: ExpenseCreate) => httpService.post<ExpenseResponse>(BASE_URL, data),
  update: (id: string, data: ExpenseUpdate) => httpService.put<ExpenseResponse>(`${BASE_URL}/${id}`, data),
  getByCategory: (categoryId: string) => httpService.get<ExpenseListResponse>(`${BASE_URL}/category/${categoryId}`),
  updateStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => httpService.patch<ExpenseResponse>(`${BASE_URL}/status/${id}`, { status }),
};

export default expenseService;
