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
                ? 'bg-primary-500 text-dark font-semibold shadow-md'
                : 'border border-primary-800/40 bg-dark-card text-coffee-light hover:border-primary-500/50 hover:text-primary-400'
            )}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
