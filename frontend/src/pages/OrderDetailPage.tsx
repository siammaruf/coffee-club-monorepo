import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, XCircle } from 'lucide-react'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { orderService } from '@/services/httpServices/orderService'
import type { Order } from '@/types/order'
import toast from 'react-hot-toast'

const statusVariantMap: Record<string, 'default' | 'success' | 'error' | 'warning' | 'info'> = {
  PENDING: 'warning',
  PREPARING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const orderTypeLabels: Record<string, string> = {
  DINEIN: 'Dine-in',
  TAKEAWAY: 'Pickup',
  DELIVERY: 'Delivery',
}

const paymentLabels: Record<string, string> = {
  CASH: 'Cash',
  BKASH: 'bKash',
  BANK: 'Bank Card',
  OTHER: 'Other',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
      setIsLoading(true)
      try {
        const data = await orderService.getOrder(id)
        setOrder(data)
      } catch {
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const handleCancel = async () => {
    if (!order) return

    setIsCancelling(true)
    try {
      const updated = await orderService.cancelOrder(order.id)
      setOrder(updated)
      toast.success('Order cancelled successfully')
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <title>Order Details | CoffeeClub</title>
        <meta name="robots" content="noindex, nofollow" />
        <Loading fullPage text="Loading order details..." />
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <title>Order Details | CoffeeClub</title>
        <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-[60vh] bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
            <XCircle className="h-10 w-10 text-error" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-coffee">{error || 'Order not found'}</h1>
          <Link to="/orders" className="mt-6">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <title>{`Order #${order.order_id} | CoffeeClub`}</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-coffee">
                Order #{order.order_id}
              </h1>
              <Badge variant={statusVariantMap[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-coffee-light">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>

          {order.status === 'PENDING' && (
            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={isCancelling}
            >
              Cancel Order
            </Button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Timeline + Items */}
          <div className="space-y-6 lg:col-span-2">
            {/* Timeline */}
            <OrderTimeline
              status={order.status}
              createdAt={order.created_at}
              updatedAt={order.updated_at}
            />

            {/* Order Items */}
            <div className="rounded-2xl border border-primary-100 bg-white p-6">
              <h3 className="text-lg font-bold text-coffee">Order Items</h3>
              <div className="mt-4 space-y-4">
                {order.orderItems.map((orderItem) => (
                  <div key={orderItem.id} className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600">
                      {orderItem.item.image ? (
                        <img
                          src={orderItem.item.image}
                          alt={orderItem.item.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white/50">
                          {orderItem.item.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-coffee">
                        {orderItem.item.name}
                      </p>
                      <p className="text-xs text-coffee-light">
                        {formatPrice(orderItem.unit_price)} x {orderItem.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-coffee">
                      {formatPrice(orderItem.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Info */}
          <div>
            <div className="sticky top-24 space-y-6">
              {/* Order Summary */}
              <div className="rounded-2xl border border-primary-100 bg-white p-6">
                <h3 className="text-lg font-bold text-coffee">Order Summary</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-coffee-light">Subtotal</span>
                    <span className="font-medium text-coffee">{formatPrice(order.sub_total)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success">Discount</span>
                      <span className="font-medium text-success">-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <hr className="border-primary-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-coffee">Total</span>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="rounded-2xl border border-primary-100 bg-white p-6">
                <h3 className="text-lg font-bold text-coffee">Order Details</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-coffee-light">Order Type</span>
                    <Badge variant="outline">{orderTypeLabels[order.order_type]}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-coffee-light">Payment</span>
                    <span className="font-medium text-coffee">{paymentLabels[order.payment_method]}</span>
                  </div>
                  {order.delivery_address && (
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-coffee-light">Delivery</span>
                      <span className="text-right font-medium text-coffee">{order.delivery_address}</span>
                    </div>
                  )}
                  {order.special_instructions && (
                    <div className="text-sm">
                      <span className="text-coffee-light">Notes:</span>
                      <p className="mt-1 rounded-lg bg-cream p-2 text-xs text-coffee">
                        {order.special_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
