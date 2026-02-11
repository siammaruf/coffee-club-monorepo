import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import type { OrderType } from '@/types/order'

interface OrderSummaryProps {
  orderType: OrderType
  deliveryAddress?: string
  discount?: number
}

const orderTypeLabels: Record<OrderType, string> = {
  DINEIN: 'Dine-in',
  TAKEAWAY: 'Pickup',
  DELIVERY: 'Delivery',
}

export function OrderSummary({ orderType, deliveryAddress, discount = 0 }: OrderSummaryProps) {
  const { items, total } = useCart()

  const grandTotal = total - discount

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-coffee">Order Summary</h3>

      {/* Items */}
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((cartItem) => {
          const price = cartItem.item.sale_price ?? cartItem.item.regular_price
          return (
            <div key={cartItem.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-coffee">
                  {cartItem.item.name}
                </p>
                <p className="text-xs text-coffee-light">
                  {formatPrice(price)} x {cartItem.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-coffee">
                {formatPrice(price * cartItem.quantity)}
              </span>
            </div>
          )
        })}
      </div>

      <hr className="my-4 border-primary-100" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-coffee-light">Subtotal</span>
          <span className="font-medium text-coffee">{formatPrice(total)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Discount</span>
            <span className="font-medium text-success">-{formatPrice(discount)}</span>
          </div>
        )}

        <hr className="border-primary-100" />

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-coffee">Total</span>
          <span className="text-xl font-bold text-primary-600">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Order Info */}
      <div className="mt-4 space-y-2 rounded-lg bg-cream p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-coffee-light">Order Type</span>
          <span className="font-medium text-coffee">{orderTypeLabels[orderType]}</span>
        </div>
        {orderType === 'DELIVERY' && deliveryAddress && (
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-coffee-light">Delivery to</span>
            <span className="text-right font-medium text-coffee">{deliveryAddress}</span>
          </div>
        )}
      </div>
    </div>
  )
}
