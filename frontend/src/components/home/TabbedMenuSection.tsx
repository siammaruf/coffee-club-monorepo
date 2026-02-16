import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useCategories, useMenuItems } from '@/services/httpServices/queries/useMenu'
import { useCart } from '@/hooks/useCart'
import { formatPrice, truncate, cn } from '@/lib/utils'
import type { Item } from '@/types/item'

export function TabbedMenuSection() {
  const [activeSlug, setActiveSlug] = useState<string | undefined>(undefined)

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const categories = Array.isArray(categoriesData) ? categoriesData : ((categoriesData as any)?.data ?? [])

  // Default to first category when categories load
  useEffect(() => {
    if (categories.length > 0 && activeSlug === undefined) {
      setActiveSlug(categories[0]?.slug)
    }
  }, [categories, activeSlug])

  const { data: itemsData, isLoading: itemsLoading } = useMenuItems({
    categorySlug: activeSlug,
    limit: 8,
  })
  const items = itemsData?.data ?? []

  const { addItem } = useCart()

  const handleAddToCart = (item: Item) => {
    addItem(item)
  }

  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="vincent-container">
        <h2 className="mb-4 text-center text-text-heading">
          Discover Our Menu
        </h2>
        <img src="/img/separator_dark.png" alt="" className="mx-auto mb-8" aria-hidden="true" />

        {/* Category tabs - no "All" tab, matching template */}
        {!categoriesLoading && categories.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveSlug(cat.slug)}
                className={cn(
                  'px-4 py-2 font-heading text-sm uppercase tracking-[3px] transition-colors duration-200',
                  activeSlug === cat.slug
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-text-muted hover:text-text-heading',
                )}
              >
                {cat.name ?? ''}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {itemsLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-full bg-bg-lighter" />
                <div className="mt-4 h-4 w-3/4 rounded bg-bg-lighter" />
                <div className="mt-2 h-3 w-full rounded bg-bg-lighter" />
                <div className="mt-2 h-4 w-1/4 rounded bg-bg-lighter" />
              </div>
            ))}
          </div>
        )}

        {/* Product grid */}
        {!itemsLoading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group">
                {/* Circular image with hover overlay */}
                <div className="relative overflow-hidden rounded-full">
                  <div className="aspect-square overflow-hidden rounded-full bg-bg-secondary">
                    <img
                      src={item.image ?? '/img/6-600x600.png'}
                      alt={item.name ?? 'Product'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* Hover overlay with add-to-cart */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-bg-primary opacity-0 transition-all duration-300 hover:bg-accent-hover group-hover:opacity-100"
                      aria-label={`Add ${item.name ?? 'item'} to cart`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Product info */}
                <h5 className="mt-4 text-center text-text-heading">
                  <Link
                    to={`/menu/${item.id}`}
                    className="transition-colors duration-200 hover:text-link-hover"
                  >
                    {item.name ?? ''}
                  </Link>
                </h5>
                <p className="mt-1 text-center text-text-body">
                  {truncate(item.description ?? '', 70)}
                </p>
                <div className="mt-2 text-center text-lg tracking-[2px] text-accent">
                  {formatPrice(item.sale_price ?? item.regular_price ?? 0)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!itemsLoading && items.length === 0 && (
          <p className="text-center text-text-muted">
            No menu items found for this category.
          </p>
        )}
      </div>
    </section>
  )
}
