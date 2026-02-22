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
  bulkDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/delete`, { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get(`${BASE_URL}/trash/list`, params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`${BASE_URL}/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`${BASE_URL}/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch(`${BASE_URL}/bulk/restore`, { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/permanent`, { data: { ids } }),
};

export default expenseService;