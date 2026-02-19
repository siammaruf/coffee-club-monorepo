import { Customer, CustomerListResponse, GetAllCustomersParams } from '../../types/customer';
import { httpService } from '../httpService';

export const customerService = {
  getAll: (params?: GetAllCustomersParams) => httpService.get<CustomerListResponse>('/customers/', { params: { is_active: true, ...params } }),
  get: (id: string) => httpService.get<any>(`/customers/${id}`),
  create: (data: { name: string; phone: string; email?: string; address?: string; note?: string }) =>
    httpService.post<{ data: Customer }>('/customers/', data),
  redeemPoints: (id: string, data: { amount: number }) => httpService.post(`/customers/${id}/redeem-points`, data),
  getBalance: (id: string) => httpService.get(`/customers/${id}/balance`),
  canRedeem: (id: string, amount: number) => httpService.get(`/customers/${id}/can-redeem/${amount}`),
  addPoints: (id: string, data: { orderAmount: number; order_id?: string }) => httpService.post(`/customers/${id}/add-points`, data),
};
