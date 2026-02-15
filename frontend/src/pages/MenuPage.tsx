import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useSearchParams } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { ItemDetailModal } from '@/components/menu/ItemDetailModal'
import { useMenu } from '@/hooks/useMenu'
import { useCart } from '@/hooks/useCart'
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const handleViewDetail = (item: Item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleQuickAdd = (e: React.MouseEvent, item: Item) => {
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
                    <div className="relative cursor-pointer overflow-hidden" onClick={() => handleViewDetail(item)}>
                      <div className="aspect-square overflow-hidden bg-bg-secondary">
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
                          className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full border-2 border-white text-white opacity-0 transition-all duration-300 hover:border-accent hover:text-accent group-hover:translate-y-0 group-hover:opacity-100"
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
                    </div>
                    {/* Product Info */}
                    <div className="mt-4 text-center">
                      <h5 className="cursor-pointer transition-colors hover:text-accent" onClick={() => handleViewDetail(item)}>
                        <span>{item?.name ?? ''}</span>
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

        {/* Advantages Section */}
        <div className="relative overflow-hidden bg-bg-secondary py-20">
          <div className="vincent-container">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {/* Quality Foods */}
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <img src="/img/icon_1.png" alt="Quality Foods" className="h-full w-full object-contain" />
                </div>
                <h4 className="mb-4">Quality Foods</h4>
                <p className="text-sm text-text-muted">
                  Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.
                </p>
              </div>
              {/* Fastest Delivery */}
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <img src="/img/icon_3.png" alt="Fastest Delivery" className="h-full w-full object-contain" />
                </div>
                <h4 className="mb-4">Fastest Delivery</h4>
                <p className="text-sm text-text-muted">
                  Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.
                </p>
              </div>
              {/* Original Recipes */}
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <img src="/img/icon_2.png" alt="Original Recipes" className="h-full w-full object-contain" />
                </div>
                <h4 className="mb-4">Original Recipes</h4>
                <p className="text-sm text-text-muted">
                  Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.
                </p>
              </div>
            </div>
          </div>
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
