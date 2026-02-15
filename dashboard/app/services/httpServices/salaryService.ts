import type { GetAllSalariesParams, Salary, SalaryFormData, SalaryListResponse, SalaryResponse } from '~/types/salary';
import { httpService } from '../httpService';


export const salaryService = {
  create: (formData: FormData) =>
    httpService.post<SalaryResponse>('/staff-salary', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params?: GetAllSalariesParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<SalaryListResponse>('/staff-salary', config);
  },
  getById: (id: string) => httpService.get<Salary>(`/staff-salary/${id}`),
  update: (id: string, salary: SalaryFormData) => httpService.put<Salary>(`/staff-salary/${id}`, salary),
  delete: (id: string) => httpService.delete(`/staff-salary/${id}`),
  markAsPaid: (id: string) => httpService.post<Salary>(`/staff-salary/${id}/mark-as-paid`),
  markAsUnpaid: (id: string) => httpService.post<Salary>(`/staff-salary/${id}/mark-as-unpaid`),
  getUserHistory: (userId: string, params?: any) => httpService.post<SalaryListResponse>(`/staff-salary/user/${userId}/history`, params || {}),
  bulkDelete: (ids: string[]) => httpService.delete('/staff-salary/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/staff-salary/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/staff-salary/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/staff-salary/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/staff-salary/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/staff-salary/bulk/permanent', { data: { ids } }),
};