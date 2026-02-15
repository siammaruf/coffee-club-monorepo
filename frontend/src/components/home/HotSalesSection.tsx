import { Link } from 'react-router'
import { useMenuItems } from '@/services/httpServices/queries/useMenu'
import { formatPrice, truncate } from '@/lib/utils'

export function HotSalesSection() {
  const { data, isLoading } = useMenuItems({ limit: 4 })
  const items = data?.data ?? []

  return (
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="vincent-container">
        <h2 className="mb-10 text-center text-text-heading">Hot Sales</h2>

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
              <Link
                key={item.id}
                to={`/menu/${item.slug ?? item.id}`}
                className="group block"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.image ?? '/img/6-600x600.png'}
                    alt={item.name ?? 'Product'}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h5 className="mt-4 text-text-heading">
                  {item.name ?? ''}
                </h5>
                <p className="mt-1 text-text-body">
                  {truncate(item.description ?? '', 70)}
                </p>
                <div className="mt-2 text-lg tracking-[2px] text-text-heading">
                  {formatPrice(item.sale_price ?? item.regular_price ?? 0)}
                </div>
              </Link>
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
