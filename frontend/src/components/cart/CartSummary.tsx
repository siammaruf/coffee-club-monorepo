import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

export function CartSummary() {
  const { total, itemCount } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const tax = 0
  const discount = promoApplied ? Math.round(total * 0.1) : 0
  const grandTotal = total - discount + tax

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code')
      return
    }
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'COFFEE10') {
      setPromoApplied(true)
      toast.success('Promo code applied! 10% discount')
    } else {
      toast.error('Invalid promo code')
    }
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-coffee">Order Summary</h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-coffee-light">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-coffee">{formatPrice(total)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Discount (10%)</span>
            <span className="font-medium text-success">-{formatPrice(discount)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-coffee-light">Tax</span>
            <span className="font-medium text-coffee">{formatPrice(tax)}</span>
          </div>
        )}

        <hr className="border-primary-100" />

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-coffee">Total</span>
          <span className="text-xl font-bold text-primary-600">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Promo Code */}
      {!promoApplied && (
        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-coffee">
            Promo Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-light" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                className="h-10 w-full rounded-lg border border-primary-200 bg-white pl-9 pr-3 text-sm text-coffee placeholder:text-coffee-light/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleApplyPromo}>
              Apply
            </Button>
          </div>
        </div>
      )}

      {promoApplied && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <Tag className="h-4 w-4" />
          <span>COFFEE10 applied - 10% off!</span>
        </div>
      )}

      {/* Checkout Button */}
      <div className="mt-6">
        <Link to="/checkout">
          <Button size="lg" className="w-full">
            Proceed to Checkout
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
