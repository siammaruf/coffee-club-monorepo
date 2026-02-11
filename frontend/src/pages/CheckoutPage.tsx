import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import type { OrderType } from '@/types/order'

export default function CheckoutPage() {
  const { items } = useCart()
  const [orderType, setOrderType] = useState<OrderType>('DINEIN')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)

  const handleOrderTypeChange = useCallback((type: OrderType) => {
    setOrderType(type)
  }, [])

  const handleDeliveryAddressChange = useCallback((address: string) => {
    setDeliveryAddress(address)
  }, [])

  const handleOrderPlaced = useCallback(() => {
    setIsOrderPlaced(true)
  }, [])

  // Success State
  if (isOrderPlaced) {
    return (
      <>
        <title>Checkout | CoffeeClub</title>
        <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-[60vh] bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-coffee">Order Placed Successfully!</h1>
          <p className="mx-auto mt-2 max-w-md text-coffee-light">
            Your order has been confirmed. You can track your order status from the orders page.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/orders">
              <Button>
                View My Orders
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline">
                Order More
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </>
    )
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <>
        <title>Checkout | CoffeeClub</title>
        <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-[60vh] bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
            <ShoppingBag className="h-12 w-12 text-primary-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-coffee">Your cart is empty</h1>
          <p className="mt-2 text-coffee-light">
            Add some items to your cart before checking out.
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
      <title>Checkout | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-coffee sm:text-3xl">Checkout</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
              <CheckoutForm
                onOrderTypeChange={handleOrderTypeChange}
                onDeliveryAddressChange={handleDeliveryAddressChange}
                onOrderPlaced={handleOrderPlaced}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24">
              <OrderSummary
                orderType={orderType}
                deliveryAddress={deliveryAddress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
