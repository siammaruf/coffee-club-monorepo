import { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import { OrderCard } from '@/components/orders/OrderCard'
import { Loading } from '@/components/ui/loading'
import { orderService } from '@/services/httpServices/orderService'
import type { Order } from '@/types/order'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const response = await orderService.getOrders(1, 20)
        setOrders(response.data)
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
      <title>My Orders | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-coffee sm:text-3xl">My Orders</h1>
        <p className="mt-1 text-sm text-coffee-light">
          Track and view your order history.
        </p>

        {/* Loading */}
        {isLoading && (
          <div className="mt-12">
            <Loading fullPage text="Loading your orders..." />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
            {error}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                  <ClipboardList className="h-10 w-10 text-primary-400" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-coffee">No orders yet</h3>
                <p className="mt-1 text-sm text-coffee-light">
                  Your order history will appear here once you place your first order.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}
