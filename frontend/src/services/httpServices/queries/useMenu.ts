import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { publicService } from '../publicService'
import type { ItemFilters } from '@/types/item'

export const menuKeys = {
  all: ['menu'] as const,
  categories: () => [...menuKeys.all, 'categories'] as const,
  items: () => [...menuKeys.all, 'items'] as const,
  itemList: (filters: ItemFilters) => [...menuKeys.items(), filters] as const,
  detail: (slug: string) => [...menuKeys.all, 'detail', slug] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: menuKeys.categories(),
    queryFn: () => publicService.getCategories({ limit: 100 }),
  })
}

export function useMenuItems(filters: ItemFilters) {
  return useQuery({
    queryKey: menuKeys.itemList(filters),
    queryFn: () => publicService.getItems(filters),
  })
}

export function useInfiniteMenuItems(filters: Omit<ItemFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...menuKeys.items(), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      publicService.getItems({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage?.page ?? 1
      const total = lastPage?.totalPages ?? 1
      return current < total ? current + 1 : undefined
    },
  })
}

export function useMenuItem(slug: string) {
  return useQuery({
    queryKey: menuKeys.detail(slug),
    queryFn: () => publicService.getItemBySlug(slug),
    enabled: Boolean(slug),
  })
}
