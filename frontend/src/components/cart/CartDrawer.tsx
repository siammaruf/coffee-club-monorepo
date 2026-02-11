import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, total, itemCount, closeDrawer } = useCart()

  // Lock body scroll when drawer is open
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
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed bottom-0 right-0 top-0 w-full max-w-md animate-slide-in-right bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-primary-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-bold text-coffee">
                Your Cart
                {itemCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-coffee-light">
                    ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="rounded-lg p-1.5 text-coffee-light transition-colors hover:bg-primary-100 hover:text-coffee"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                  <ShoppingBag className="h-10 w-10 text-primary-400" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-coffee">Your cart is empty</h3>
                <p className="mt-1 text-sm text-coffee-light">
                  Start adding delicious items from our menu!
                </p>
                <Link to="/menu" onClick={closeDrawer}>
                  <Button variant="primary" className="mt-6">
                    Browse Menu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((cartItem) => (
                  <CartItem key={cartItem.id} cartItem={cartItem} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-primary-100 px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-medium text-coffee">Subtotal</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(total)}</span>
              </div>
              <div className="flex gap-3">
                <Link to="/cart" onClick={closeDrawer} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link to="/checkout" onClick={closeDrawer} className="flex-1">
                  <Button className="w-full">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
