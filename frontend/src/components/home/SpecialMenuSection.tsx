import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Coffee } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'
import { Button } from '@/components/ui/button'
import { useCategories, useMenuItems } from '@/services/httpServices/queries/useMenu'
import { useCart } from '@/hooks/useCart'
import { formatPrice, cn } from '@/lib/utils'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

export function SpecialMenuSection() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const { data: categoriesData } = useCategories()
  const { data: itemsData, isLoading } = useMenuItems({
    categorySlug: activeCategory,
    limit: 8,
  })
  const { addItem } = useCart()

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as { data?: unknown[] })?.data ?? []

  const items: Item[] = itemsData?.data ?? []

  const handleAddToCart = (item: Item) => {
    addItem(item, 1)
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <section className="section-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollFadeIn>
          <SectionHeading
            tagline="Our Specials"
            title="Explore Our Menu"
            subtitle="Discover our carefully crafted selection of coffee, beverages, and culinary delights."
          />
        </ScrollFadeIn>

        {/* Category Filter Pills */}
        <ScrollFadeIn delay={100}>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200',
                activeCategory === undefined
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'border border-border bg-white text-text-body hover:border-primary-400 hover:text-primary-600'
              )}
            >
              All Items
            </button>
            {categories.map((cat: { slug: string; name: string }) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200',
                  activeCategory === cat.slug
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'border border-border bg-white text-text-body hover:border-primary-400 hover:text-primary-600'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </ScrollFadeIn>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-white p-5"
              >
                <div className="aspect-square rounded-xl bg-warm-surface" />
                <div className="mt-4 h-4 w-3/4 rounded bg-warm-surface" />
                <div className="mt-2 h-3 w-1/2 rounded bg-warm-surface" />
                <div className="mt-4 h-8 w-full rounded bg-warm-surface" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Coffee className="mx-auto h-16 w-16 text-text-muted/40" />
            <p className="mt-4 text-lg text-text-muted">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => {
              const price = item.sale_price ?? item.regular_price
              return (
                <ScrollFadeIn key={item.id} delay={index * 80}>
                  <div className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-400/50">
                    {/* Sale badge */}
                    {item.sale_price && (
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-error px-2.5 py-0.5 text-xs font-bold text-white">
                        Sale
                      </div>
                    )}

                    {/* Image / Letter Initial */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-warm-surface to-warm-light">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-heading text-6xl font-bold text-primary-300/40">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-dark/0 transition-all duration-300 group-hover:bg-dark/20">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-600 opacity-0 shadow-lg transition-all duration-300 hover:bg-primary-600 hover:text-white group-hover:opacity-100"
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-text-primary transition-colors group-hover:text-primary-600">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-xl font-bold text-primary-600">
                            {formatPrice(price)}
                          </span>
                          {item.sale_price && (
                            <span className="text-sm text-text-muted line-through">
                              {formatPrice(item.regular_price)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-200 text-primary-500 transition-all duration-200 hover:bg-primary-600 hover:text-white hover:border-primary-600"
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollFadeIn>
              )
            })}
          </div>
        )}

        {/* View Full Menu Link */}
        <ScrollFadeIn delay={200}>
          <div className="mt-12 text-center">
            <Link to="/menu">
              <Button variant="outline" size="lg">
                View Full Menu
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  )
}
