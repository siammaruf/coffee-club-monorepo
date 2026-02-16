import { Minus, Plus, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { LocalCartItem } from '@/types/cart'

interface CartItemProps {
  cartItem: LocalCartItem
  compact?: boolean
}

export function CartItem({ cartItem, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { item, quantity, selectedVariation } = cartItem
  const price = selectedVariation
    ? (selectedVariation.sale_price ?? selectedVariation.regular_price ?? 0)
    : (item?.sale_price ?? item?.regular_price ?? 0)
  const itemTotal = price * quantity
  const imgSrc = item?.image || '/img/6-600x600.png'

  if (compact) {
    return (
      <div className="flex items-center gap-3 border-b border-border py-3">
        {/* Thumbnail */}
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-bg-secondary">
          <img
            src={imgSrc}
            alt={item?.name ?? ''}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-text-primary">
            {item?.name ?? ''}
            {selectedVariation && (
              <span className="text-text-muted"> - {selectedVariation.name}</span>
            )}
          </p>
          <p className="text-xs text-text-muted">{quantity} x {formatPrice(price)}</p>
        </div>
        {/* Total */}
        <span className="text-sm text-accent">{formatPrice(itemTotal)}</span>
      </div>
    )
  }

  return (
    <tr className="border-b border-border">
      {/* Remove Button */}
      <td className="py-4 pr-2">
        <button
          onClick={() => removeItem(cartItem.id)}
          className="flex h-6 w-6 items-center justify-center text-text-muted transition-colors hover:text-error"
          aria-label={`Remove ${item?.name ?? ''}`}
        >
          <X className="h-4 w-4" />
        </button>
      </td>
      {/* Thumbnail */}
      <td className="py-4 pr-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-bg-secondary">
          <img
            src={imgSrc}
            alt={item?.name ?? ''}
            className="h-full w-full object-cover"
          />
        </div>
      </td>
      {/* Product Name */}
      <td className="py-4 pr-4">
        <span className="font-heading text-sm uppercase tracking-[2px] text-text-primary">
          {item?.name ?? ''}
        </span>
        {selectedVariation && (
          <span className="block text-xs font-normal normal-case tracking-normal text-text-muted">
            {selectedVariation.name}
          </span>
        )}
      </td>
      {/* Price */}
      <td className="py-4 pr-4">
        <span className="text-sm text-text-muted">{formatPrice(price)}</span>
      </td>
      {/* Quantity */}
      <td className="py-4 pr-4">
        <div className="inline-flex items-center border-2 border-border">
          <button
            onClick={() => updateQuantity(cartItem.id, quantity - 1)}
            className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="flex h-8 w-10 items-center justify-center border-x-2 border-border text-sm text-text-primary">
            {quantity}
          </span>
          <button
            onClick={() => updateQuantity(cartItem.id, quantity + 1)}
            className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </td>
      {/* Total */}
      <td className="py-4">
        <span className="text-sm text-accent">{formatPrice(itemTotal)}</span>
      </td>
    </tr>
  )
}
