import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useSearchParams, Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { useCart } from '@/hooks/useCart'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { AdvantagesSection } from '@/components/home/AdvantagesSection'
import { defaultAdvantages } from '@/lib/defaults'
import { formatPrice, truncate } from '@/lib/utils'
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
  const [activeTab, setActiveTab] = useState<string>('')

  const {
    items,
    categories,
    isLoading,
    error,
    filters,
    setCategory,
  } = useMenu()

  const { addItem } = useCart()
  const { data: websiteContent } = useWebsiteContent()

  // Sync URL category param with filter and active tab
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    if (urlCategory && urlCategory !== filters.categorySlug) {
      setCategory(urlCategory)
      setActiveTab(urlCategory)
    }
  }, [searchParams, filters.categorySlug, setCategory])

  // Set first category as active if none selected
  useEffect(() => {
    if (categories && categories.length > 0 && !activeTab) {
      const firstSlug = categories[0]?.slug ?? ''
      setActiveTab(firstSlug)
      setCategory(firstSlug)
    }
  }, [categories, activeTab, setCategory])

  const handleTabClick = (slug: string) => {
    setActiveTab(slug)
    setCategory(slug)
    if (slug) {
      setSearchParams({ category: slug })
    } else {
      setSearchParams({})
    }
  }

  const handleQuickAdd = (e: React.MouseEvent, item: Item) => {
    e.preventDefault()
    e.stopPropagation()
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
          {/* Category Tabs */}
          <div className="mb-10 flex flex-wrap justify-center gap-0 border-b border-border">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleTabClick(cat.slug)}
                className={`relative px-6 py-3 font-heading text-sm uppercase tracking-[3px] transition-all duration-200 ${
                  activeTab === cat.slug
                    ? 'text-accent after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-accent'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {cat.name ?? ''}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
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
                    <Link to={`/menu/${item.id}`} className="relative block cursor-pointer overflow-hidden">
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
                        <Link to={`/menu/${item.id}`}>{item?.name ?? ''}</Link>
                      </h5>
                      <p className="mt-2 text-sm text-text-muted">
                        {truncate(item?.description ?? '', 70)}
                      </p>
                      <div className="mt-2 font-heading text-lg tracking-wider text-accent">
                        {item?.sale_price ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="text-text-muted line-through">{formatPrice(item?.regular_price ?? 0)}</span>
                            <span>{formatPrice(price)}</span>
                          </span>
                        ) : (
                          formatPrice(price)
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
