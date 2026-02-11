import { useQuery } from '@tanstack/react-query'
import { publicService } from '../publicService'
import type { ItemFilters } from '@/types/item'

export const menuKeys = {
  all: ['menu'] as const,
  categories: () => [...menuKeys.all, 'categories'] as const,
  items: () => [...menuKeys.all, 'items'] as const,
  itemList: (filters: ItemFilters) => [...menuKeys.items(), filters] as const,
  detail: (id: string) => [...menuKeys.all, 'detail', id] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: menuKeys.categories(),
    queryFn: () => publicService.getCategories(),
  })
}

export function useMenuItems(filters: ItemFilters) {
  return useQuery({
    queryKey: menuKeys.itemList(filters),
    queryFn: () => publicService.getItems(filters),
  })
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: () => publicService.getItem(id),
    enabled: Boolean(id),
  })
}
