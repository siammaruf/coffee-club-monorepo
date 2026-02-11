import { httpService } from '../httpService';
import type { Category, CategoryListResponse, GetAllCategoriesParams, CategoryPayload } from '~/types/category';

export const categoryService = {
  create: (category: CategoryPayload) => httpService.post<Category>('/categories', category),
  getAll: (params?: GetAllCategoriesParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<CategoryListResponse>('/categories', config);
  },
  getById: (id: string) => httpService.get<Category>(`/categories/${id}`),
  update: (id: string, category: CategoryPayload) => httpService.patch<Category>(`/categories/${id}`, category),
  delete: (id: string) => httpService.delete(`/categories/${id}`),
  getBySlug: (slug: string) => httpService.get<Category>(`/categories/slug/${slug}`),
};