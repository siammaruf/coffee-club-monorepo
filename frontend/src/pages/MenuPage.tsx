import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageBanner } from '@/components/ui/PageBanner'

export const meta: MetaFunction = () => [
  { title: 'Our Menu | CoffeeClub' },
  { name: 'description', content: 'Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes at CoffeeClub.' },
  { property: 'og:title', content: 'Our Menu | CoffeeClub' },
  { property: 'og:description', content: 'Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes at CoffeeClub.' },
  { property: 'og:type', content: 'website' },
]
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { SearchBar } from '@/components/menu/SearchBar'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { ItemDetailModal } from '@/components/menu/ItemDetailModal'
import { useMenu } from '@/hooks/useMenu'
import type { Item } from '@/types/item'

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    items,
    categories,
    isLoading,
    error,
    filters,
    totalPages,
    total,
    setSearch,
    setCategory,
    setPage,
  } = useMenu()

  // Sync URL category param with filter
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    if (urlCategory && urlCategory !== filters.categorySlug) {
      setCategory(urlCategory)
    }
  }, [searchParams, filters.categorySlug, setCategory])

  const handleCategorySelect = (slug: string) => {
    setCategory(slug)
    if (slug) {
      setSearchParams({ category: slug })
    } else {
      setSearchParams({})
    }
  }

  const handleViewDetail = (item: Item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const currentPage = filters.page ?? 1

  return (
    <>
      {/* Page Banner */}
      <PageBanner
        title="Our Menu"
        subtitle="Discover our carefully curated selection of premium coffees, refreshing beverages, and delicious dishes."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Menu' }]}
      />

      <div className="bg-warm-bg">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Filters Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryFilter
              categories={categories}
              selected={filters.categorySlug}
              onSelect={handleCategorySelect}
            />
            <SearchBar onSearch={setSearch} />
          </div>

          {/* Results Count */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {isLoading ? 'Loading...' : `Showing ${items.length} of ${total} items`}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-6 rounded-xl border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
              {error}
            </div>
          )}

          {/* Grid */}
          <div className="mt-6">
            <MenuGrid
              items={items}
              isLoading={isLoading}
              onViewDetail={handleViewDetail}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:bg-warm-surface hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPage(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'border border-border bg-white text-text-body hover:bg-warm-surface hover:text-primary-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:bg-warm-surface hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedItem(null)
        }}
      />
    </>
  )
}
