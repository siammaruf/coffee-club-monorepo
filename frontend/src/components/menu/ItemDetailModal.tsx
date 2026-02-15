import { useState, useEffect, useCallback } from 'react'
import { Minus, Plus, ShoppingCart, X } from 'lucide-react'
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

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])

  // Reset quantity when modal opens with a new item
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setNotes('')
    }
  }, [isOpen, item?.id])

  if (!isOpen || !item) return null

  const price = item.sale_price ?? item.regular_price ?? 0
  const totalPrice = price * quantity
  const imgSrc = item.image || '/img/6-600x600.png'

  const handleAddToCart = () => {
    addItem(item, quantity)
    toast.success(`${quantity}x ${item?.name ?? 'Item'} added to cart!`)
    setQuantity(1)
    setNotes('')
    onClose()
  }

  const handleClose = () => {
    setQuantity(1)
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg animate-fade-in overflow-hidden border border-border bg-bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/60"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Item Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
          <img
            src={imgSrc}
            alt={item.name ?? ''}
            className="h-full w-full object-cover"
          />
          {item.sale_price && (
            <div className="absolute left-3 top-3 bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary">
              Sale
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-text-heading">{item.name ?? ''}</h2>
          {item.name_bn && (
            <p className="mt-1 text-sm text-text-muted">{item.name_bn}</p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-text-body">
            {item.description ?? ''}
          </p>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="font-heading text-2xl tracking-wider text-accent">
              {formatPrice(price)}
            </span>
            {item.sale_price && (
              <span className="text-base text-text-muted line-through">
                {formatPrice(item.regular_price)}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mt-6">
            <label className="mb-2 block text-sm text-text-muted">Quantity</label>
            <div className="inline-flex items-center border-2 border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x-2 border-border text-base text-text-primary">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Special Notes */}
          <div className="mt-5">
            <label className="mb-2 block text-sm text-text-muted">
              Special Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests? (e.g., less sugar, extra spicy...)"
              rows={2}
              className="h-auto w-full resize-none border-2 border-border bg-transparent px-4 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Add to Cart Button */}
          <div className="mt-6">
            <button
              onClick={handleAddToCart}
              disabled={item.status === 'UNAVAILABLE'}
              className="btn-vincent-filled flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart - {formatPrice(totalPrice)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
