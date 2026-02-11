import { UtensilsCrossed } from 'lucide-react'
import { MenuCard } from './MenuCard'
import { LoadingSkeleton } from '@/components/ui/loading'
import type { Item } from '@/types/item'

interface MenuGridProps {
  items: Item[]
  isLoading: boolean
  onViewDetail: (item: Item) => void
}

export function MenuGrid({ items, isLoading, onViewDetail }: MenuGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-primary-100 bg-white">
            <LoadingSkeleton className="h-44 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <LoadingSkeleton className="h-5 w-3/4" />
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-1/2" />
              <div className="flex items-center justify-between pt-2">
                <LoadingSkeleton className="h-6 w-20" />
                <LoadingSkeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
          <UtensilsCrossed className="h-10 w-10 text-primary-400" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-coffee">No items found</h3>
        <p className="mt-1 text-sm text-coffee-light">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} onViewDetail={onViewDetail} />
      ))}
    </div>
  )
}
