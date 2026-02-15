import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useParams, Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { orderService } from '@/services/httpServices/orderService'
import type { Order } from '@/types/order'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Order Details | CoffeeClub' },
  {
    name: 'description',
    content: 'View your order details.',
  },
  { name: 'robots', content: 'noindex, nofollow' },
]

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const statusColors: Record<string, string> = {
  PENDING: 'text-warning',
  PREPARING: 'text-info',
  COMPLETED: 'text-success',
  CANCELLED: 'text-error',
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

// Timeline steps
const timelineSteps = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'COMPLETED', label: 'Completed' },
]

const statusOrder: Record<string, number> = {
  PENDING: 0,
  PREPARING: 1,
  COMPLETED: 2,
  CANCELLED: -1,
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

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="page-title-block">
          <h1>Order Details</h1>
        </div>
        <div className="flex min-h-[40vh] items-center justify-center bg-bg-primary">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </>
    )
  }

  // Error / not found
  if (error || !order) {
    return (
      <>
        <div className="page-title-block">
          <h1>Order Not Found</h1>
        </div>
        <div className="flex min-h-[40vh] flex-col items-center justify-center bg-bg-primary px-4 text-center">
          <p className="text-text-muted">{error || 'Order not found'}</p>
          <Link to="/orders" className="btn-vincent mt-6">
            Back to Orders
          </Link>
        </div>
      </>
    )
  }

  const currentIndex = statusOrder[order.status] ?? 0
  const isCancelled = order.status === 'CANCELLED'

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Order #{order?.order_id ?? '---'}</h1>
      </div>

      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="mx-auto max-w-4xl">
            {/* Order Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs uppercase tracking-[2px] ${
                      statusColors[order.status] ?? 'text-text-muted'
                    }`}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  Placed on {formatDateTime(order.created_at)}
                </p>
              </div>

              {order.status === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="border-2 border-error px-4 py-1.5 text-sm uppercase tracking-[3px] text-error transition-colors hover:bg-error hover:text-bg-primary disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column: Timeline + Items */}
              <div className="space-y-8 lg:col-span-2">
                {/* Timeline */}
                <div className="border-2 border-border bg-bg-card p-6">
                  <h5 className="mb-6">Order Timeline</h5>

                  {isCancelled ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center border-2 border-accent text-xs text-accent">
                            1
                          </div>
                          <div className="mt-1 h-8 w-0.5 bg-error/30" />
                        </div>
                        <div>
                          <p className="text-sm text-text-primary">
                            Order Placed
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatDateTime(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center border-2 border-error text-xs text-error">
                          X
                        </div>
                        <div>
                          <p className="text-sm text-error">Cancelled</p>
                          <p className="text-xs text-text-muted">
                            {formatDateTime(order.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {timelineSteps.map((step, index) => {
                        const stepIndex = statusOrder[step.status] ?? 0
                        const isActive = stepIndex <= currentIndex
                        const isLast = index === timelineSteps.length - 1

                        return (
                          <div key={step.status} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-8 w-8 items-center justify-center text-xs transition-colors ${
                                  isActive
                                    ? 'border-2 border-accent text-accent'
                                    : 'border-2 border-border text-text-muted'
                                }`}
                              >
                                {index + 1}
                              </div>
                              {!isLast && (
                                <div
                                  className={`mt-1 h-8 w-0.5 ${
                                    isActive && stepIndex < currentIndex
                                      ? 'bg-accent'
                                      : 'bg-border'
                                  }`}
                                />
                              )}
                            </div>
                            <div className={isLast ? '' : 'pb-4'}>
                              <p
                                className={`text-sm ${
                                  isActive
                                    ? 'text-text-primary'
                                    : 'text-text-muted/50'
                                }`}
                              >
                                {step.label}
                              </p>
                              {isActive && (
                                <p className="text-xs text-text-muted">
                                  {formatDateTime(
                                    stepIndex === currentIndex
                                      ? order.updated_at
                                      : order.created_at
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="border-2 border-border bg-bg-card p-6">
                  <h5 className="mb-4">Order Items</h5>
                  <div className="space-y-4">
                    {(order?.order_items ?? []).map((orderItem) => (
                      <div
                        key={orderItem.id}
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden border border-border">
                          {orderItem.item?.image ? (
                            <img
                              src={orderItem.item.image}
                              alt={orderItem.item?.name || 'Item'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm text-accent">
                              {orderItem.item?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-text-primary">
                            {orderItem.item?.name || 'Unknown Item'}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatPrice(orderItem?.unit_price ?? 0)} x{' '}
                            {orderItem?.quantity ?? 0}
                          </p>
                        </div>
                        <span className="text-sm text-text-primary">
                          {formatPrice(orderItem?.total_price ?? 0)}
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
                  <div className="border-2 border-border bg-bg-card p-6">
                    <h5 className="mb-4">Order Summary</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Subtotal</span>
                        <span className="text-text-primary">
                          {formatPrice(order?.sub_total ?? 0)}
                        </span>
                      </div>
                      {(order?.discount_amount ?? 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-success">Discount</span>
                          <span className="text-success">
                            -{formatPrice(order?.discount_amount ?? 0)}
                          </span>
                        </div>
                      )}
                      <hr className="border-border" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">Total</span>
                        <span className="text-lg text-accent">
                          {formatPrice(order?.total_amount ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="border-2 border-border bg-bg-card p-6">
                    <h5 className="mb-4">Order Details</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Order Type</span>
                        <span className="text-text-primary">
                          {orderTypeLabels[order.order_type] ??
                            order.order_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Payment</span>
                        <span className="text-text-primary">
                          {order.payment_method
                            ? paymentLabels[order.payment_method]
                            : 'N/A'}
                        </span>
                      </div>
                      {order.delivery_address && (
                        <div className="flex items-start justify-between gap-3 text-sm">
                          <span className="text-text-muted">Delivery</span>
                          <span className="text-right text-text-primary">
                            {order.delivery_address}
                          </span>
                        </div>
                      )}
                      {order.special_instructions && (
                        <div className="text-sm">
                          <span className="text-text-muted">Notes:</span>
                          <p className="mt-1 border border-border bg-bg-lighter p-2 text-xs text-text-primary">
                            {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back to Orders */}
                  <Link to="/orders" className="btn-vincent block text-center">
                    Back to Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
