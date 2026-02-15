import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react'
import { useMenuItem, useMenuItems } from '@/services/httpServices/queries/useMenu'
import { useCart } from '@/hooks/useCart'
import { formatPrice, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Item } from '@/types/item'

type TabKey = 'description' | 'additional' | 'reviews'

export default function MenuItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: item, isLoading, error } = useMenuItem(id ?? '')
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<TabKey>('description')

  // Fetch related products from same category
  const categorySlug = item?.categories?.[0]?.slug
  const { data: relatedData } = useMenuItems({
    categorySlug,
    limit: 4,
  })
  const relatedItems = (relatedData?.data ?? [])
    .filter((i) => i.id !== item?.id)
    .slice(0, 3)

  const handleAddToCart = () => {
    if (!item) return
    addItem(item, quantity)
    toast.success(`${item.name} added to cart!`)
  }

  const handleQuickAdd = (e: React.MouseEvent, relatedItem: Item) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(relatedItem, 1)
    toast.success(`${relatedItem.name} added to cart!`)
  }

  const incrementQty = () => setQuantity((q) => q + 1)
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1))

  const price = item?.sale_price ?? item?.regular_price ?? 0

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'additional', label: 'Additional Information' },
    { key: 'reviews', label: 'Reviews (0)' },
  ]

  if (isLoading) {
    return (
      <>
        <div className="page-title-block">
          <h1>Product Detail</h1>
        </div>
        <div className="flex items-center justify-center bg-bg-primary py-32">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      </>
    )
  }

  if (error || !item) {
    return (
      <>
        <div className="page-title-block">
          <h1>Product Detail</h1>
        </div>
        <div className="bg-bg-primary py-32 text-center">
          <p className="text-text-muted">Product not found.</p>
          <Link to="/menu" className="mt-4 inline-block text-accent hover:text-link-hover">
            Back to Menu
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Product Detail</h1>
      </div>

      {/* Product Detail Section */}
      <div className="bg-bg-primary">
        <div className="vincent-container py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column - Product Image */}
            <div className="flex items-start justify-center">
              <div className="w-full max-w-md">
                <div className="aspect-square overflow-hidden rounded-full bg-bg-secondary">
                  <img
                    src={item.image || '/img/6-600x600.png'}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div>
              <h1 className="font-heading text-3xl uppercase tracking-[4px] text-accent">
                {item.name}
              </h1>

              {/* Price */}
              <div className="mt-4 font-heading text-2xl tracking-wider">
                {item.sale_price ? (
                  <span className="flex items-center gap-3">
                    <span className="text-text-muted line-through">
                      {formatPrice(item.regular_price)}
                    </span>
                    <span className="text-accent">{formatPrice(item.sale_price)}</span>
                  </span>
                ) : (
                  <span className="text-accent">{formatPrice(item.regular_price)}</span>
                )}
              </div>

              {/* Description */}
              <p className="mt-6 leading-relaxed text-text-body">
                {item.description}
              </p>

              {/* Quantity Selector + Add to Cart */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-border">
                  <button
                    type="button"
                    onClick={decrementQty}
                    className="flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-text-heading"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-12 w-12 items-center justify-center border-x border-border font-heading text-lg text-text-heading">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={incrementQty}
                    className="flex h-12 w-12 items-center justify-center text-text-muted transition-colors hover:text-text-heading"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-vincent-filled flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>

              {/* Product Meta */}
              <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-text-muted">
                <li>
                  <span className="text-text-heading">SKU:</span> {item.id.slice(0, 8).toUpperCase()}
                </li>
                {item.categories.length > 0 && (
                  <li>
                    <span className="text-text-heading">Category:</span>{' '}
                    {item.categories.map((cat, idx) => (
                      <span key={cat.id}>
                        <Link
                          to={`/menu?category=${cat.slug}`}
                          className="text-accent transition-colors hover:text-link-hover"
                        >
                          {cat.name}
                        </Link>
                        {idx < item.categories.length - 1 && ', '}
                      </span>
                    ))}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-16 border-t border-border">
            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-0 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-4 font-heading text-sm uppercase tracking-[3px] transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'text-accent after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-accent'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-8">
              {activeTab === 'description' && (
                <p className="leading-relaxed text-text-body">
                  {item.description}
                </p>
              )}

              {activeTab === 'additional' && (
                <div className="text-text-body">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 pr-8 font-heading uppercase tracking-wider text-text-heading">
                          Type
                        </td>
                        <td className="py-3 text-text-muted">{item.type}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 pr-8 font-heading uppercase tracking-wider text-text-heading">
                          Status
                        </td>
                        <td className="py-3 text-text-muted">{item.status}</td>
                      </tr>
                      {item.categories.length > 0 && (
                        <tr className="border-b border-border">
                          <td className="py-3 pr-8 font-heading uppercase tracking-wider text-text-heading">
                            Categories
                          </td>
                          <td className="py-3 text-text-muted">
                            {item.categories.map((c) => c.name).join(', ')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <p className="text-text-muted">There are no reviews yet.</p>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedItems.length > 0 && (
            <div className="mt-16 border-t border-border pt-12">
              <h2 className="mb-2 text-center text-text-heading">Related Products</h2>
              <img src="/img/separator_dark.png" alt="" className="mx-auto mb-10" aria-hidden="true" />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedItems.map((relItem) => (
                  <div key={relItem.id} className="group">
                    <Link to={`/menu/${relItem.id}`} className="relative block overflow-hidden">
                      <div className="aspect-square overflow-hidden rounded-full bg-bg-secondary">
                        <img
                          src={relItem.image ?? '/img/6-600x600.png'}
                          alt={relItem.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, relItem)}
                          className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full border-2 border-white text-white opacity-0 transition-all duration-300 hover:border-link-hover hover:text-link-hover group-hover:translate-y-0 group-hover:opacity-100"
                          aria-label={`Add ${relItem.name} to cart`}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                    </Link>
                    <div className="mt-4 text-center">
                      <h5 className="text-text-heading">
                        <Link
                          to={`/menu/${relItem.id}`}
                          className="transition-colors duration-200 hover:text-link-hover"
                        >
                          {relItem.name}
                        </Link>
                      </h5>
                      <p className="mt-1 text-sm text-text-muted">
                        {truncate(relItem.description ?? '', 70)}
                      </p>
                      <div className="mt-2 font-heading text-lg tracking-wider text-accent">
                        {formatPrice(relItem.sale_price ?? relItem.regular_price ?? 0)}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, relItem)}
                        className="btn-vincent mt-3 inline-flex items-center gap-2 text-sm"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
