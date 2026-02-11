import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react'
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
    if (urlCategory && urlCategory !== filters.category) {
      setCategory(urlCategory)
    }
  }, [searchParams, filters.category, setCategory])

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
      <title>Our Menu | CoffeeClub</title>
      <meta name="description" content="Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes at CoffeeClub." />
      <meta property="og:title" content="Our Menu | CoffeeClub" />
      <meta property="og:description" content="Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes." />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
    <div className="bg-cream min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-4 py-2 text-sm text-primary-300">
            <UtensilsCrossed className="h-4 w-4" />
            <span>Fresh & Delicious</span>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Our Menu
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Discover our carefully curated selection of premium coffees, refreshing beverages, and delicious dishes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CategoryFilter
            categories={categories}
            selected={filters.category}
            onSelect={handleCategorySelect}
          />
          <SearchBar onSearch={setSearch} />
        </div>

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-coffee-light">
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
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-200 bg-white text-coffee transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'border border-primary-200 bg-white text-coffee hover:bg-primary-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-200 bg-white text-coffee transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
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
    </div>
  </>
  )
}
