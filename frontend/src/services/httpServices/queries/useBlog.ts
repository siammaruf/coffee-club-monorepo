import { useQuery } from '@tanstack/react-query'
import { blogService } from '../blogService'

export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  postList: (params: { page?: number; limit?: number; search?: string }) =>
    [...blogKeys.posts(), params] as const,
  post: (slug: string) => [...blogKeys.all, 'post', slug] as const,
}

export function useBlogPosts(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: blogKeys.postList(params ?? {}),
    queryFn: () => blogService.getBlogPosts(params),
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: blogKeys.post(slug),
    queryFn: () => blogService.getBlogPost(slug),
    enabled: Boolean(slug),
  })
}
