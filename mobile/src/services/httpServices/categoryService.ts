import { Category, CategoryListResponse, GetAllCategoriesParams } from '../../types/category';
import { httpService } from '../httpService';

export const categoryService = {
  getAll: (params?: GetAllCategoriesParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<CategoryListResponse>('/categories', config);
  },
  getById: (id: string) => httpService.get<Category>(`/categories/${id}`),
  getBySlug: (slug: string) => httpService.get<Category>(`/categories/slug/${slug}`),
};
