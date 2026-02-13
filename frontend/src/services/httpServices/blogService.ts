import { get } from '../httpMethods'
import type { BlogPost, BlogPostsResponse } from '@/types/blog'

export const blogService = {
  getBlogPosts: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.search) searchParams.append('search', params.search)
    return get<BlogPostsResponse>('/public/blog', { params: searchParams })
  },

  getBlogPost: (slug: string) =>
    get<{ data: BlogPost }>(`/public/blog/${slug}`).then((res) => res.data),
}
