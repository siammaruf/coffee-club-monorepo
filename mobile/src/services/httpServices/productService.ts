import { GetAllProductsParams, Product, ProductListResponse, ProductResponse } from '../../types/product';
import { httpService } from '../httpService';

export const productService = {
  create: (product: FormData) => httpService.post<Product>('/items', product),
  getById: (id: string) => httpService.get<ProductResponse>(`/items/${id}`),
  getBySlug: (slug: string) => httpService.get<Product>(`/items/slug/${slug}`),
  getAll: (params?: GetAllProductsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<ProductListResponse>('/items', config);
  },
};
