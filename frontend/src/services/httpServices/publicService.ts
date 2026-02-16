import { get, post } from '../httpMethods'
import type { Category, Item, ItemsResponse, ItemFilters } from '@/types/item'

export interface ContactMessagePayload {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}

export const publicService = {
  getCategories: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.search) searchParams.append('search', params.search)
    return get<Category[]>('/public/categories', { params: searchParams })
  },

  getItems: (filters?: ItemFilters) => {
    const params = new URLSearchParams()
    if (filters?.categorySlug) params.append('categorySlug', filters.categorySlug)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    return get<ItemsResponse>('/public/items', { params })
  },

  getItemBySlug: (slug: string) =>
    get<{ data: Item }>(`/public/items/by-slug/${slug}`).then((res) => res.data),

  getTables: () =>
    get<{ data: Array<{ id: string; name: string; capacity: number; status: string }> }>('/public/tables').then((res) => res.data),

  submitContactMessage: (data: ContactMessagePayload) =>
    post<{ data: unknown }>('/public/contact', data),
}
