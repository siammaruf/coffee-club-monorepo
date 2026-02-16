import { Link, useNavigate } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useMenuItems } from '@/services/httpServices/queries/useMenu'
import { useCart } from '@/hooks/useCart'
import { formatPrice, truncate } from '@/lib/utils'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

export function TabbedMenuSection() {
  const { data: itemsData, isLoading } = useMenuItems({ limit: 8 })
  const items = itemsData?.data ?? []
  const { addItem } = useCart()
  const navigate = useNavigate()

  const handleAddToCart = (e: React.MouseEvent, item: Item) => {
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
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="vincent-container">
        <h2 className="mb-4 text-center text-text-heading">
          Discover Our Menu
        </h2>
        <img src="/img/separator_dark.png" alt="" className="mx-auto mb-10" aria-hidden="true" />

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-full bg-bg-lighter" />
                <div className="mt-4 mx-auto h-4 w-3/4 rounded bg-bg-lighter" />
                <div className="mt-2 mx-auto h-3 w-full rounded bg-bg-lighter" />
                <div className="mt-2 mx-auto h-4 w-1/4 rounded bg-bg-lighter" />
              </div>
            ))}
          </div>
        )}

        {/* Product grid */}
        {!isLoading && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <div key={item.id} className="group">
                  {/* Circular image with hover overlay */}
                  <Link to={`/menu/${item.slug}`} className="relative block overflow-hidden">
                    <div className="aspect-square overflow-hidden rounded-full bg-bg-secondary">
                      <img
                        src={item.image ?? '/img/6-600x600.png'}
                        alt={item.name ?? 'Product'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, item)}
                        className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full border-2 border-white text-white opacity-0 transition-all duration-300 hover:border-link-hover hover:text-link-hover group-hover:translate-y-0 group-hover:opacity-100"
                        aria-label={`Add ${item.name ?? 'item'} to cart`}
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

                  {/* Product info */}
                  <div className="mt-4 text-center">
                    <h5 className="text-text-heading">
                      <Link
                        to={`/menu/${item.slug}`}
                        className="transition-colors duration-200 hover:text-link-hover"
                      >
                        {item.name ?? ''}
                      </Link>
                    </h5>
                    <p className="mt-1 text-text-body">
                      {truncate(item.description ?? '', 70)}
                    </p>
                    <div className="mt-2 font-heading text-lg tracking-wider text-accent">
                      {item?.sale_price ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="text-text-muted line-through">{formatPrice(item?.regular_price ?? 0)}</span>
                          <span>{formatPrice(item.sale_price)}</span>
                        </span>
                      ) : (
                        <>
                          {item.has_variations && <span className="text-sm text-text-muted">From </span>}
                          {formatPrice(item.regular_price ?? 0)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-12 text-center">
              <Link to="/menu" className="btn-vincent">
                View Full Menu <span className="ml-2" aria-hidden="true">&rsaquo;</span>
              </Link>
            </div>
          </>
        )}

        {!isLoading && items.length === 0 && (
          <p className="text-center text-text-muted">
            No menu items available at the moment.
          </p>
        )}
      </div>
    </section>
  )
}
