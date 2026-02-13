import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useParams, Link } from 'react-router'
import { ArrowLeft, XCircle } from 'lucide-react'
import { PageBanner } from '@/components/ui/PageBanner'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { orderService } from '@/services/httpServices/orderService'
import type { Order } from '@/types/order'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Order Details | CoffeeClub' },
  { name: 'description', content: 'View your order details.' },
  { property: 'og:title', content: 'Order Details | CoffeeClub' },
  { property: 'og:description', content: 'View your order details.' },
  { property: 'og:type', content: 'website' },
]

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
      <Loading fullPage text="Loading order details..." />
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] bg-warm-bg">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
              <XCircle className="h-10 w-10 text-error" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-text-primary">{error || 'Order not found'}</h1>
            <Link to="/orders" className="mt-6">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
    )
  }

  return (
    <>
      <PageBanner
        title={`Order #${order.order_id}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Orders', href: '/orders' }, { label: `#${order.order_id}` }]}
      />

      <div className="bg-warm-bg">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Order Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariantMap[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-text-muted">
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
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="font-heading text-lg font-bold text-text-primary">Order Items</h3>
                <div className="mt-4 space-y-4">
                  {(order.order_items || []).map((orderItem) => (
                    <div key={orderItem.id} className="flex items-center gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-warm-surface">
                        {orderItem.item?.image ? (
                          <img
                            src={orderItem.item.image}
                            alt={orderItem.item?.name || 'Item'}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary-400">
                            {orderItem.item?.name?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-text-primary">
                          {orderItem.item?.name || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatPrice(orderItem.unit_price)} x {orderItem.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
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
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="font-heading text-lg font-bold text-text-primary">Order Summary</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Subtotal</span>
                      <span className="font-medium text-text-primary">{formatPrice(order.sub_total)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-success">Discount</span>
                        <span className="font-medium text-success">-{formatPrice(order.discount_amount)}</span>
                      </div>
                    )}
                    <hr className="border-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-text-primary">Total</span>
                      <span className="font-heading text-xl font-bold text-primary-600">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="font-heading text-lg font-bold text-text-primary">Order Details</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Order Type</span>
                      <Badge variant="outline">{orderTypeLabels[order.order_type]}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Payment</span>
                      <span className="font-medium text-text-primary">{order.payment_method ? paymentLabels[order.payment_method] : 'N/A'}</span>
                    </div>
                    {order.delivery_address && (
                      <div className="flex items-start justify-between gap-3 text-sm">
                        <span className="text-text-muted">Delivery</span>
                        <span className="text-right font-medium text-text-primary">{order.delivery_address}</span>
                      </div>
                    )}
                    {order.special_instructions && (
                      <div className="text-sm">
                        <span className="text-text-muted">Notes:</span>
                        <p className="mt-1 rounded-lg bg-warm-surface p-2 text-xs text-text-primary">
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
