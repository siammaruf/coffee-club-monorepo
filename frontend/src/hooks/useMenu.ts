import { useState, useCallback } from 'react'
import { useCategories, useMenuItems } from '@/services/httpServices/queries/useMenu'
import type { ItemFilters } from '@/types/item'

export function useMenu() {
  const [filters, setFilters] = useState<ItemFilters>({ page: 1, limit: 12 })

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: itemsData, isLoading: itemsLoading, error } = useMenuItems(filters)

  const items = itemsData?.data || []
  // Backend returns pagination fields at root level, not inside a `meta` object
  const totalPages = itemsData?.totalPages || 1
  const total = itemsData?.total || 0

  return {
    items,
    categories,
    isLoading: categoriesLoading || itemsLoading,
    error: error ? 'Failed to load menu items' : null,
    filters,
    totalPages,
    total,
    setSearch: useCallback((search: string) => setFilters((prev) => ({ ...prev, search, page: 1 })), []),
    setCategory: useCallback((categorySlug: string) => setFilters((prev) => ({ ...prev, categorySlug, page: 1 })), []),
    setPage: useCallback((page: number) => setFilters((prev) => ({ ...prev, page })), []),
  }
}
