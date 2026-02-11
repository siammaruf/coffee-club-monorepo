import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const { items, itemCount, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <>
        <title>Your Cart | CoffeeClub</title>
        <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-[60vh] bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
            <ShoppingBag className="h-12 w-12 text-primary-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-coffee">Your cart is empty</h1>
          <p className="mt-2 text-coffee-light">
            Looks like you have not added anything to your cart yet.
          </p>
          <Link to="/menu" className="mt-8">
            <Button size="lg">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <title>Your Cart | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-coffee sm:text-3xl">Your Cart</h1>
            <p className="mt-1 text-sm text-coffee-light">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cart
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((cartItem) => (
                <CartItem key={cartItem.id} cartItem={cartItem} />
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
