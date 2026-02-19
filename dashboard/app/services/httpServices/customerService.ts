import type { Customer, CustomerListResponse, CustomerCreateResponse, GetAllCustomersParams } from '~/types/customer';
import { httpService } from '../httpService';

export const customerService = {
  getAll: (params?: GetAllCustomersParams) => httpService.get<CustomerListResponse>("/customers", { params }),
  get: (id: string) => httpService.get<Customer>(`/customers/${id}`),
  create: (data: FormData | Partial<Customer>) => httpService.post<CustomerCreateResponse>("/customers", data),
  update: (id: string, data: FormData | Partial<Customer>) => httpService.patch<Customer>(`/customers/${id}`, data),
  delete: (id: string) => httpService.delete(`/customers/${id}`),
  activate: (id: string) => httpService.patch<Customer>(`/customers/${id}/activate`),
  deactivate: (id: string) => httpService.patch<Customer>(`/customers/${id}/deactivate`),
  addPoints: (id: string, orderAmount: number) => httpService.post(`/customers/${id}/add-points`, { orderAmount }),
  redeemPoints: (id: string, amount: number) => httpService.post(`/customers/${id}/redeem-points`, { amount }),
  getBalance: (id: string) => httpService.get(`/customers/${id}/balance`),
  canRedeem: (id: string, amount: number) => httpService.get(`/customers/${id}/can-redeem/${amount}`),
  bulkDelete: (ids: string[]) => httpService.delete('/customers/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/customers/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/customers/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/customers/${id}/permanent`),
  resetPassword: (id: string, newPassword: string) => httpService.patch(`/customers/${id}/reset-password`, { newPassword }),
};