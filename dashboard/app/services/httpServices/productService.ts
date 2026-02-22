import { httpService } from '../httpService';
import type { Product, ProductListResponse, GetAllProductsParams, ProductResponse } from '~/types/product';

export const productService = {
  create: (product: FormData) => httpService.post<Product>('/items', product),
  getById: (id: string) => httpService.get<ProductResponse>(`/items/${id}`),
  update: (id: string, product: FormData) =>httpService.put<Product>(`/items/${id}`, product),
  delete: (id: string) => httpService.delete(`/items/${id}`),
  getBySlug: (slug: string) => httpService.get<Product>(`/items/slug/${slug}`),
  getAll: (params?: GetAllProductsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<ProductListResponse>('/items', config);
  },
  bulkDelete: (ids: string[]) => httpService.delete('/items/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/items/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/items/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/items/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/items/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/items/bulk/permanent', { data: { ids } }),
};