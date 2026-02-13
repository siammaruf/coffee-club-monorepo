import { Link } from 'react-router'
import { ChevronRight, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types/order'

interface OrderCardProps {
  order: Order
}

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

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = (order.order_items || []).reduce((sum, oi) => sum + oi.quantity, 0)

  return (
    <Link
      to={`/orders/${order.id}`}
      className="group block rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100">
            <Package className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">
                #{order.order_id}
              </h3>
              <Badge variant={statusVariantMap[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {orderTypeLabels[order.order_type]}
          </Badge>
          <span className="text-xs text-text-muted">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        <span className="font-heading text-base font-bold text-primary-600">
          {formatPrice(order.total_amount)}
        </span>
      </div>
    </Link>
  )
}
