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
};