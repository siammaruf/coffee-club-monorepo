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
  bulkDelete: (ids: string[]) => httpService.delete('/blog/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/blog/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/blog/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/blog/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/blog/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/blog/bulk/permanent', { data: { ids } }),
};
