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

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-white p-3">
      {/* Image / Placeholder */}
      <div className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-warm-surface ${compact ? 'h-12 w-12' : 'h-16 w-16'}`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <span className="text-lg font-bold text-primary-400">
            {item.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-text-primary">{item.name}</h4>
            <p className="text-xs text-text-muted">{formatPrice(price)} each</p>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="flex-shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="inline-flex items-center rounded-md border border-border bg-warm-bg">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-l-md text-text-muted transition-colors hover:bg-warm-surface hover:text-primary-600"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center border-x border-border text-xs font-semibold text-text-primary">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-r-md text-text-muted transition-colors hover:bg-warm-surface hover:text-primary-600"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Item Total */}
          <span className="text-sm font-bold text-primary-600">
            {formatPrice(itemTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
