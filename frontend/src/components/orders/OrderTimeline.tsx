import { Check, Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types/order'

interface OrderTimelineProps {
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

const timelineSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle },
]

const statusOrder: Record<string, number> = {
  PENDING: 0,
  PREPARING: 1,
  COMPLETED: 2,
  CANCELLED: -1,
}

export function OrderTimeline({ status, createdAt, updatedAt }: OrderTimelineProps) {
  const currentIndex = statusOrder[status] ?? 0
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <h3 className="text-lg font-bold text-coffee">Order Timeline</h3>
        <div className="mt-6 space-y-6">
          {/* Placed */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <Check className="h-5 w-5 text-primary-600" />
              </div>
              <div className="mt-1 h-full w-0.5 bg-error/30" />
            </div>
            <div className="pb-6">
              <p className="text-sm font-bold text-coffee">Order Placed</p>
              <p className="text-xs text-coffee-light">{formatDateTime(createdAt)}</p>
            </div>
          </div>

          {/* Cancelled */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
                <XCircle className="h-5 w-5 text-error" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-error">Cancelled</p>
              <p className="text-xs text-coffee-light">{formatDateTime(updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      <h3 className="text-lg font-bold text-coffee">Order Timeline</h3>
      <div className="mt-6 space-y-0">
        {timelineSteps.map((step, index) => {
          const stepIndex = statusOrder[step.status] ?? 0
          const isActive = stepIndex <= currentIndex
          const isCurrent = stepIndex === currentIndex
          const isLast = index === timelineSteps.length - 1

          return (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    isCurrent
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-md'
                      : isActive
                        ? 'bg-primary-100'
                        : 'bg-gray-100'
                  )}
                >
                  <step.icon
                    className={cn(
                      'h-5 w-5',
                      isCurrent
                        ? 'text-white'
                        : isActive
                          ? 'text-primary-600'
                          : 'text-gray-400'
                    )}
                  />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'mt-1 h-10 w-0.5',
                      isActive && stepIndex < currentIndex
                        ? 'bg-primary-400'
                        : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-sm font-bold',
                    isActive ? 'text-coffee' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-coffee-light">
                    {isCurrent ? formatDateTime(updatedAt) : formatDateTime(createdAt)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
