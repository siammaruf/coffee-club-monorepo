import { httpService } from '../httpService';
import type { VendorPayment, VendorPaymentFilters, CreateVendorPaymentInput, UpdateVendorPaymentInput } from '~/types/vendorPayment';

const BASE_URL = '/vendor-payments';

export const vendorPaymentService = {
  create: (data: CreateVendorPaymentInput) => {
    const formData = new FormData();
    formData.append('vendor_id', data.vendor_id);
    formData.append('amount', String(data.amount));
    formData.append('payment_date', data.payment_date);
    formData.append('payment_type', data.payment_type);
    if (data.note) formData.append('note', data.note);
    if (data.screenshot_url) formData.append('screenshot_url', data.screenshot_url);
    return httpService.post<VendorPayment>(BASE_URL, formData);
  },
  getAll: (params?: VendorPaymentFilters) => httpService.get<VendorPayment[]>(BASE_URL, params ? { params } : undefined),
  getById: (id: string) => httpService.get<VendorPayment>(`${BASE_URL}/${id}`),
  update: (id: string, data: UpdateVendorPaymentInput) => {
    const formData = new FormData();
    if (data.vendor_id) formData.append('vendor_id', data.vendor_id);
    if (data.amount !== undefined) formData.append('amount', String(data.amount));
    if (data.payment_date) formData.append('payment_date', data.payment_date);
    if (data.payment_type) formData.append('payment_type', data.payment_type);
    if (data.note !== undefined) formData.append('note', data.note);
    if (data.screenshot_url !== undefined) formData.append('screenshot_url', data.screenshot_url);
    return httpService.put<VendorPayment>(`${BASE_URL}/${id}`, formData);
  },
  delete: (id: string) => httpService.delete(`${BASE_URL}/${id}`),
  bulkDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/delete`, { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get(`${BASE_URL}/trash/list`, params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`${BASE_URL}/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`${BASE_URL}/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch(`${BASE_URL}/bulk/restore`, { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete(`${BASE_URL}/bulk/permanent`, { data: { ids } }),
};
