import type { ExpenseCreate, ExpenseUpdate } from "~/types/expense";
import { httpService } from "../httpService";

const BASE_URL = "/expenses";

const expenseService = {
  getAll: (params?: any) => httpService.get(BASE_URL, { params }),
  getById: (id: string) => httpService.get(`${BASE_URL}/${id}`),
  create: (data: ExpenseCreate) => httpService.post(BASE_URL, data),
  update: (id: string, data: ExpenseUpdate) => httpService.put(`${BASE_URL}/${id}`, data),
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  getByCategory: (categoryId: string) => httpService.get(`${BASE_URL}/category/${categoryId}`),
  updateStatus: (id: string, status: string) => httpService.patch(`${BASE_URL}/status/${id}`, { status }),
};

export default expenseService;