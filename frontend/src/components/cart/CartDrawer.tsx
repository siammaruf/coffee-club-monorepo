import { useEffect } from 'react'
import { Link } from 'react-router'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItem } from './CartItem'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, total, itemCount, closeDrawer } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed bottom-0 right-0 top-0 w-full max-w-md animate-slide-in-right border-l border-border bg-bg-secondary shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" />
              <h2 className="text-lg mb-0 font-bold leading-none tracking-[3px] text-text-primary">
                YOUR CART
                {itemCount > 0 && (
                  <span className="ml-2 text-sm font-normal tracking-normal text-text-muted">
                    ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-text-muted transition-colors hover:text-text-primary"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-lighter">
                  <ShoppingBag className="h-10 w-10 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-[3px] text-text-primary">
                  CART IS EMPTY
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  Start adding delicious items from our menu!
                </p>
                <Link
                  to="/menu"
                  onClick={closeDrawer}
                  className="btn-vincent-filled mt-6 flex items-center gap-2"
                >
                  Browse Menu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div>
                {items.map((cartItem) => (
                  <CartItem key={cartItem.id} cartItem={cartItem} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t-[2px] border-border px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-[3px] text-text-primary">
                  Subtotal
                </span>
                <span className="font-heading text-xl font-bold text-accent">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="btn-vincent flex-1 text-center"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="btn-vincent-filled flex-1 text-center"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
