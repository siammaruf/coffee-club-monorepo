import { httpService } from '../httpService';
import type { BlogPost, BlogPostListResponse, GetAllBlogPostsParams, BlogPostPayload } from '~/types/blog';

export const blogService = {
  create: (data: BlogPostPayload) => httpService.post<BlogPost>('/blog', data),
  getAll: (params?: GetAllBlogPostsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<BlogPostListResponse>('/blog', config);
  },
  getById: (id: string) => httpService.get<{ data: BlogPost }>(`/blog/${id}`),
  update: (id: string, data: Partial<BlogPostPayload>) => httpService.put<{ data: BlogPost }>(`/blog/${id}`, data),
  delete: (id: string) => httpService.delete(`/blog/${id}`),
};
