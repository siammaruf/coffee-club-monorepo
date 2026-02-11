import { get } from '../httpMethods'
import type { Category, Item, ItemsResponse, ItemFilters } from '@/types/item'

export const publicService = {
  getCategories: () =>
    get<{ data: Category[] }>('/public/categories').then((res) => res.data),

  getItems: (filters?: ItemFilters) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    return get<ItemsResponse>('/public/items', { params })
  },

  getItem: (id: string) =>
    get<{ data: Item }>(`/public/items/${id}`).then((res) => res.data),

  getTables: () =>
    get<{ data: Array<{ id: string; name: string; capacity: number; status: string }> }>('/public/tables').then((res) => res.data),
}
