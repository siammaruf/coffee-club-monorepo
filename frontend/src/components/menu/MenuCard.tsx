import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

interface MenuCardProps {
  item: Item
  onViewDetail: (item: Item) => void
}

const gradientMap: Record<string, string> = {
  BAR: 'from-primary-400 to-amber-500',
  KITCHEN: 'from-emerald-400 to-teal-500',
}

export function MenuCard({ item, onViewDetail }: MenuCardProps) {
  const { addItem } = useCart()
  const price = item.sale_price ?? item.regular_price
  const gradient = gradientMap[item.type] ?? 'from-primary-400 to-primary-600'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(item, 1)
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <div
      onClick={() => onViewDetail(item)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image / Gradient Placeholder */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="text-5xl font-black text-white/30 transition-transform duration-300 group-hover:scale-110">
            {item.name.charAt(0)}
          </div>
        )}
        {item.sale_price && (
          <div className="absolute right-3 top-3 rounded-full bg-error px-2.5 py-1 text-xs font-bold text-white shadow-md">
            Sale
          </div>
        )}
        {item.status === 'UNAVAILABLE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-coffee">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-coffee transition-colors group-hover:text-primary-700">
          {item.name}
        </h3>
        {item.name_bn && (
          <p className="text-xs text-coffee-light">{item.name_bn}</p>
        )}
        <p className="mt-1.5 line-clamp-2 text-sm text-coffee-light">
          {item.description}
        </p>

        {/* Price Row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(price)}
            </span>
            {item.sale_price && (
              <span className="text-xs text-coffee-light line-through">
                {formatPrice(item.regular_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={item.status === 'UNAVAILABLE'}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Add ${item.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
