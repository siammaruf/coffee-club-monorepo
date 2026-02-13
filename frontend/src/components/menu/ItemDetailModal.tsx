import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

interface ItemDetailModalProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const { addItem } = useCart()

  if (!item) return null

  const price = item.sale_price ?? item.regular_price
  const total = price * quantity

  const handleAddToCart = () => {
    addItem(item, quantity)
    if (notes) {
      // Notes are handled separately if needed
    }
    toast.success(`${quantity}x ${item.name} added to cart!`)
    setQuantity(1)
    setNotes('')
    onClose()
  }

  const handleClose = () => {
    setQuantity(1)
    setNotes('')
    onClose()
  }

  const gradientMap: Record<string, string> = {
    BAR: 'from-primary-900/30 to-dark-card',
    KITCHEN: 'from-emerald-900/30 to-dark-card',
  }
  const gradient = gradientMap[item.type] ?? 'from-primary-900/30 to-dark-card'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="-mx-6 -mt-4">
        {/* Item Image / Placeholder */}
        <div className={`relative h-56 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-7xl font-black text-primary-500/30">
              {item.name.charAt(0)}
            </div>
          )}
          {item.sale_price && (
            <div className="absolute right-4 top-4 rounded-full bg-error px-3 py-1 text-sm font-bold text-white shadow-md">
              Sale
            </div>
          )}
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-2 pt-5">
          <h2 className="text-2xl font-bold text-cream">{item.name}</h2>
          {item.name_bn && (
            <p className="mt-0.5 text-sm text-coffee-light">{item.name_bn}</p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-coffee-light">
            {item.description}
          </p>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-heading text-2xl font-bold text-primary-400">
              {formatPrice(price)}
            </span>
            {item.sale_price && (
              <span className="text-base text-coffee-light line-through">
                {formatPrice(item.regular_price)}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-cream">
              Quantity
            </label>
            <div className="inline-flex items-center rounded-lg border border-primary-800/40">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-l-lg text-coffee-light transition-colors hover:bg-primary-500/10 hover:text-primary-400"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x border-primary-800/40 text-base font-semibold text-cream">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-r-lg text-coffee-light transition-colors hover:bg-primary-500/10 hover:text-primary-400"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Special Notes */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-cream">
              Special Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests? (e.g., less sugar, extra spicy...)"
              rows={3}
              className="w-full rounded-lg border border-primary-800/40 bg-dark-card px-4 py-2.5 text-sm text-cream shadow-sm transition-colors placeholder:text-coffee-light/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Add to Cart Button */}
          <div className="mt-6 pb-2">
            <Button
              onClick={handleAddToCart}
              disabled={item.status === 'UNAVAILABLE'}
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart - {formatPrice(total)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
