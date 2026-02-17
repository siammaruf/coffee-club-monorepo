import { useState, useCallback } from 'react'
import { useCategories, useInfiniteMenuItems } from '@/services/httpServices/queries/useMenu'
import type { ItemFilters } from '@/types/item'

export function useMenu() {
  const [filters, setFilters] = useState<Omit<ItemFilters, 'page'>>({ limit: 12 })

  const { data: categoriesRaw, isLoading: categoriesLoading } = useCategories()
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : ((categoriesRaw as any)?.data ?? [])

  const {
    data,
    isLoading: itemsLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMenuItems(filters)

  // Flatten all pages into a single items array
  const items = data?.pages.flatMap((page) => page?.data ?? []) ?? []
  const total = data?.pages[0]?.total ?? 0

  return {
    items,
    categories,
    isLoading: categoriesLoading || itemsLoading,
    error: error ? 'Failed to load menu items' : null,
    filters,
    total,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    loadMore: fetchNextPage,
    setSearch: useCallback((search: string) => setFilters((prev) => ({ ...prev, search })), []),
    setCategory: useCallback((categorySlug: string) => setFilters((prev) => {
      const next = { ...prev }
      if (categorySlug) next.categorySlug = categorySlug
      else delete next.categorySlug
      return next
    }), []),
  }
}
