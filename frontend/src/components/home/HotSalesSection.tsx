import { Link, useNavigate } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useMenuItems } from '@/services/httpServices/queries/useMenu'
import { useCart } from '@/hooks/useCart'
import { formatPrice, formatPriceRange, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Item } from '@/types/item'

export function HotSalesSection() {
  const { data, isLoading } = useMenuItems({ limit: 4 })
  const { addItem } = useCart()
  const navigate = useNavigate()
  const items = data?.data ?? []

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
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="vincent-container">
        <h2 className="mb-[50px] text-center text-text-heading">Hot Sales</h2>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mx-auto aspect-square w-full rounded-full bg-bg-lighter" />
                <div className="mt-4 mx-auto h-4 w-3/4 rounded bg-bg-lighter" />
                <div className="mt-2 mx-auto h-3 w-full rounded bg-bg-lighter" />
                <div className="mt-2 mx-auto h-4 w-1/4 rounded bg-bg-lighter" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group">
                {/* Circular Image with hover overlay */}
                <Link to={`/menu/${item.slug}`} className="relative block overflow-hidden">
                  <div className="aspect-square overflow-hidden rounded-full bg-bg-secondary">
                    <img
                      src={item.image ?? '/img/6-600x600.png'}
                      alt={item.name ?? 'Product'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* Dark Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, item)}
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
                {/* Product Info - Centered */}
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
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <p className="text-center text-text-muted">
            No items available at the moment.
          </p>
        )}
      </div>
    </section>
  )
}
