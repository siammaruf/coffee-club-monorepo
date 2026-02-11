import { cn } from '@/lib/utils'
import type { Category } from '@/types/item'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | undefined
  onSelect: (slug: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const allCategories = [
    { slug: '', name: 'All', name_bn: 'সব', id: 'all', description: '' },
    ...categories,
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((category) => {
        const isActive = category.slug === (selected ?? '')
        return (
          <button
            key={category.slug || 'all'}
            onClick={() => onSelect(category.slug)}
            className={cn(
              'flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                : 'border border-primary-200 bg-white text-coffee hover:border-primary-400 hover:text-primary-700'
            )}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
