import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import { orderService } from '@/services/httpServices/orderService'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types/order'

export const meta: MetaFunction = () => [
  { title: 'My Orders | CoffeeClub' },
  {
    name: 'description',
    content: 'Track and view your order history at CoffeeClub.',
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

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const response = await orderService.getOrders(1, 20)
        setOrders(response?.data ?? [])
      } catch {
        setError('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>My Orders</h1>
      </div>

      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="mx-auto max-w-3xl">
            {/* Loading */}
            {isLoading && (
              <div className="flex min-h-[30vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="border-2 border-error/30 bg-error/5 p-4 text-center text-sm text-error">
                {error}
              </div>
            )}

            {/* Orders List */}
            {!isLoading && !error && (
              <>
                {orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <h3 className="text-text-muted">No orders yet</h3>
                    <p className="mt-2 text-sm text-text-muted">
                      Your order history will appear here once you place your
                      first order.
                    </p>
                    <Link to="/menu" className="btn-vincent-filled mt-6 inline-block">
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const itemCount = (order?.order_items ?? []).reduce(
                        (sum, oi) => sum + (oi?.quantity ?? 0),
                        0
                      )
                      return (
                        <Link
                          key={order.id}
                          to={`/orders/${order.id}`}
                          className="group block border-2 border-border bg-bg-card p-5 transition-colors hover:border-link-hover"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h5 className="text-text-primary">
                                  #{order?.order_id ?? '---'}
                                </h5>
                                <span
                                  className={`text-xs uppercase tracking-[2px] ${
                                    statusColors[order.status] ?? 'text-text-muted'
                                  }`}
                                >
                                  {statusLabels[order.status] ?? order.status}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-text-muted">
                                {formatDateTime(order.created_at)}
                              </p>
                            </div>
                            <span className="text-sm text-text-muted transition-colors group-hover:text-link-hover">
                              View
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            <div className="flex items-center gap-4">
                              <span className="text-xs uppercase tracking-[2px] text-text-muted">
                                {orderTypeLabels[order.order_type] ??
                                  order.order_type}
                              </span>
                              <span className="text-xs text-text-muted">
                                {itemCount}{' '}
                                {itemCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <span className="text-accent">
                              {formatPrice(order?.total_amount ?? 0)}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
