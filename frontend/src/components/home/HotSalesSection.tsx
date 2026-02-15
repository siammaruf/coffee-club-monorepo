import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { useMenuItems } from '@/services/httpServices/queries/useMenu'
import { useCart } from '@/hooks/useCart'
import { formatPrice, truncate } from '@/lib/utils'

export function HotSalesSection() {
  const { data, isLoading } = useMenuItems({ limit: 4 })
  const { addItem } = useCart()
  const items = data?.data ?? []

  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="vincent-container">
        <h2 className="mb-[50px] text-center text-text-heading">Hot Sales</h2>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded bg-bg-lighter" />
                <div className="mt-4 h-4 w-3/4 rounded bg-bg-lighter" />
                <div className="mt-2 h-3 w-full rounded bg-bg-lighter" />
                <div className="mt-2 h-4 w-1/4 rounded bg-bg-lighter" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image ?? '/img/6-600x600.png'}
                    alt={item.name ?? 'Product'}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                    <button
                      type="button"
                      onClick={() => addItem(item)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-bg-primary opacity-0 transition-all duration-300 hover:bg-accent-hover group-hover:opacity-100"
                      aria-label={`Add ${item.name ?? 'item'} to cart`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <h5 className="mt-4 text-text-heading">
                  <Link
                    to={`/menu/${item.slug ?? item.id}`}
                    className="transition-colors duration-200 hover:text-accent"
                  >
                    {item.name ?? ''}
                  </Link>
                </h5>
                <p className="mt-1 text-text-body">
                  {truncate(item.description ?? '', 70)}
                </p>
                <div className="mt-2 text-lg tracking-[2px] text-accent">
                  {formatPrice(item.sale_price ?? item.regular_price ?? 0)}
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
