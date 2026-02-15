import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { CartItem } from '@/components/cart/CartItem'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export const meta: MetaFunction = () => [
  { title: 'Cart | CoffeeClub' },
  { name: 'description', content: 'View and manage items in your shopping cart.' },
  { property: 'og:title', content: 'Cart | CoffeeClub' },
  { property: 'og:description', content: 'View and manage items in your shopping cart.' },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Cart | CoffeeClub' },
  { name: 'twitter:description', content: 'View and manage items in your shopping cart.' },
  { name: 'robots', content: 'index, follow' },
]

export default function CartPage() {
  const { items, total, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState('')

  // Empty Cart State
  if (!items || items.length === 0) {
    return (
      <>
        <div className="page-title-block">
          <h1>Cart</h1>
        </div>
        <div className="bg-bg-primary py-20">
          <div className="vincent-container text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-border">
              <ShoppingCart className="h-12 w-12 text-text-muted" />
            </div>
            <h3 className="mt-8">Your cart is empty</h3>
            <p className="mt-4 text-text-muted">
              Looks like you have not added anything to your cart yet.
            </p>
            <Link to="/menu" className="btn-vincent-filled mt-8 inline-block">
              Browse Menu
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Cart</h1>
      </div>

      <div className="bg-bg-primary">
        <div className="vincent-container py-16">
          {/* Cart Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left" />
                  <th className="pb-3 text-left" />
                  <th className="pb-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                    Product
                  </th>
                  <th className="pb-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                    Price
                  </th>
                  <th className="pb-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                    Quantity
                  </th>
                  <th className="pb-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items?.map((cartItem) => (
                  <CartItem key={cartItem.id} cartItem={cartItem} />
                ))}
                {/* Cart Actions Row */}
                <tr>
                  <td colSpan={6} className="pt-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      {/* Coupon */}
                      <div className="flex gap-0">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Coupon code"
                          className="w-48 border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                        />
                        <button className="btn-vincent border-l-0">
                          Apply coupon
                        </button>
                      </div>
                      {/* Update / Clear */}
                      <div className="flex gap-3">
                        <button onClick={clearCart} className="btn-vincent">
                          Clear cart
                        </button>
                        <button className="btn-vincent">
                          Update cart
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cart Totals */}
          <div className="mt-10">
            <h5 className="mb-4">Cart totals</h5>
            <table className="w-full max-w-sm">
              <tbody>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                    Subtotal
                  </th>
                  <td className="py-3 text-right">
                    <span className="text-sm text-text-primary">{formatPrice(total)}</span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                    Total
                  </th>
                  <td className="py-3 text-right">
                    <span className="text-sm font-bold text-accent">{formatPrice(total)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <Link
              to="/checkout"
              className="btn-vincent-filled mt-6 inline-block"
            >
              Proceed to checkout
            </Link>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8">
            <Link
              to="/menu"
              className="text-sm uppercase tracking-[2px] text-text-muted transition-colors hover:text-link-hover"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
