import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useSearchParams, Link, useNavigate } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { ScrollableCategories } from '@/components/menu/ScrollableCategories'
import { useCart } from '@/hooks/useCart'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { AdvantagesSection } from '@/components/home/AdvantagesSection'
import { defaultAdvantages } from '@/lib/defaults'
import { formatPrice, formatPriceRange, truncate } from '@/lib/utils'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Our Menu | CoffeeClub' },
  { name: 'description', content: 'Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes at CoffeeClub.' },
  { property: 'og:title', content: 'Our Menu | CoffeeClub' },
  { property: 'og:description', content: 'Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes at CoffeeClub.' },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Our Menu | CoffeeClub' },
  { name: 'twitter:description', content: 'Browse our carefully curated menu of premium coffees, refreshing beverages, and delicious dishes at CoffeeClub.' },
  { name: 'robots', content: 'index, follow' },
]

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>('all')

  const {
    items,
    categories,
    isLoading,
    error,
    filters,
    setCategory,
  } = useMenu()

  const { addItem } = useCart()
  const navigate = useNavigate()
  const { data: websiteContent } = useWebsiteContent()

  // Sync URL category param with filter and active tab
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    if (urlCategory && urlCategory !== filters.categorySlug) {
      setCategory(urlCategory)
      setActiveTab(urlCategory)
    }
  }, [searchParams, filters.categorySlug, setCategory])

  const handleTabClick = (slug: string) => {
    setActiveTab(slug)
    if (slug === 'all') {
      setCategory('')
      setSearchParams({})
    } else {
      setCategory(slug)
      setSearchParams({ category: slug })
    }
  }

  const handleQuickAdd = (e: React.MouseEvent, item: Item) => {
    e.preventDefault()
    e.stopPropagation()
    if (item.has_variations) {
      navigate(`/menu/${item.slug}`)
      return
    }
    addItem(item, 1)
    toast.success(`${item?.name ?? 'Item'} added to cart!`)
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Discover Our Menu</h1>
      </div>

      {/* Menu Content */}
      <div className="bg-bg-primary">
        <div className="vincent-container py-16">
          {/* Category Pills */}
          <ScrollableCategories
            categories={categories}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-full bg-bg-lighter" />
                  <div className="mx-auto mt-4 h-4 w-3/4 rounded bg-bg-lighter" />
                  <div className="mx-auto mt-2 h-3 w-full rounded bg-bg-lighter" />
                  <div className="mx-auto mt-2 h-4 w-1/4 rounded bg-bg-lighter" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-20 text-center">
              <p className="text-text-muted">{error}</p>
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {items?.map((item) => {
                const price = item?.sale_price ?? item?.regular_price ?? 0
                const imgSrc = item?.image || '/img/6-600x600.png'

                return (
                  <div key={item.id} className="group">
                    {/* Image Container */}
                    <Link to={`/menu/${item.slug}`} className="relative block cursor-pointer overflow-hidden">
                      <div className="aspect-square overflow-hidden rounded-full bg-bg-secondary">
                        <img
                          src={imgSrc}
                          alt={item?.name ?? ''}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      {/* Dark Overlay on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                        <button
                          onClick={(e) => handleQuickAdd(e, item)}
                          className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full border-2 border-white text-white opacity-0 transition-all duration-300 hover:border-link-hover hover:text-link-hover group-hover:translate-y-0 group-hover:opacity-100"
                          aria-label={`Add ${item?.name ?? ''} to cart`}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                      {/* Sale Badge */}
                      {item?.sale_price && (
                        <div className="absolute left-3 top-3 bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary">
                          Sale
                        </div>
                      )}
                    </Link>
                    {/* Product Info */}
                    <div className="mt-4 text-center">
                      <h5 className="transition-colors hover:text-link-hover">
                        <Link to={`/menu/${item.slug}`}>{item?.name ?? ''}</Link>
                      </h5>
                      <p className="mt-2 text-sm text-text-muted">
                        {truncate(item?.description ?? '', 70)}
                      </p>
                      <div className="mt-2 font-heading text-lg tracking-wider text-accent">
                        {item.has_variations ? (
                          item.sale_price ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="text-text-muted line-through">
                                {formatPriceRange(item.regular_price, item.max_price)}
                              </span>
                              <span>{formatPriceRange(item.sale_price, item.max_sale_price)}</span>
                            </span>
                          ) : (
                            formatPriceRange(item.regular_price, item.max_price)
                          )
                        ) : item.sale_price ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="text-text-muted line-through">{formatPrice(item.regular_price)}</span>
                            <span>{formatPrice(item.sale_price)}</span>
                          </span>
                        ) : (
                          formatPrice(item.regular_price)
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!items || items.length === 0) && (
            <div className="py-20 text-center">
              <p className="text-text-muted">No items found in this category.</p>
            </div>
          )}
        </div>

      </div>

      {/* Advantages Section */}
      <AdvantagesSection advantages={websiteContent?.advantages ?? defaultAdvantages} />
    </>
  )
}
