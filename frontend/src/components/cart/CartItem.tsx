import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { LocalCartItem } from '@/types/cart'

interface CartItemProps {
  cartItem: LocalCartItem
  compact?: boolean
}

export function CartItem({ cartItem, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { item, quantity } = cartItem
  const price = item.sale_price ?? item.regular_price
  const itemTotal = price * quantity

  const gradientMap: Record<string, string> = {
    BAR: 'from-primary-900/30 to-dark-card',
    KITCHEN: 'from-emerald-900/30 to-dark-card',
  }
  const gradient = gradientMap[item.type] ?? 'from-primary-900/30 to-dark-card'

  return (
    <div className="flex gap-3 rounded-xl border border-primary-800/30 bg-dark-light p-3">
      {/* Image / Placeholder */}
      <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} ${compact ? 'h-12 w-12' : ''}`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <span className="text-lg font-bold text-primary-500/50">
            {item.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-cream">{item.name}</h4>
            <p className="text-xs text-coffee-light">{formatPrice(price)} each</p>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="flex-shrink-0 rounded-md p-1 text-coffee-light transition-colors hover:bg-error/10 hover:text-error"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="inline-flex items-center rounded-md border border-primary-800/40 bg-dark-card">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-l-md text-coffee-light transition-colors hover:bg-primary-500/10 hover:text-primary-400"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center border-x border-primary-800/40 text-xs font-semibold text-cream">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-r-md text-coffee-light transition-colors hover:bg-primary-500/10 hover:text-primary-400"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Item Total */}
          <span className="text-sm font-bold text-primary-400">
            {formatPrice(itemTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
