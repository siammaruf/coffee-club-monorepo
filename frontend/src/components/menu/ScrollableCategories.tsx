import { useState, useRef, useEffect, useCallback } from 'react'
import { LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Category } from '@/types/item'

interface ScrollableCategoriesProps {
  categories: Category[]
  activeTab: string
  onTabClick: (slug: string) => void
}

const pillBase =
  'shrink-0 rounded-full px-5 py-2.5 font-heading text-xs uppercase tracking-[2px] transition-all duration-300'
const pillActive =
  'bg-accent text-bg-primary shadow-[0_0_20px_rgba(255,200,81,0.15)]'
const pillInactive =
  'border border-border bg-bg-card text-text-muted hover:border-accent/40 hover:text-text-primary'

export function ScrollableCategories({
  categories,
  activeTab,
  onTabClick,
}: ScrollableCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkOverflow()
    el.addEventListener('scroll', checkOverflow)
    const resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', checkOverflow)
      resizeObserver.disconnect()
    }
  }, [checkOverflow, categories])

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!activeTab || activeTab === 'all') return
    const el = scrollRef.current
    if (!el) return

    const activeButton = el.querySelector(
      `[data-slug="${activeTab}"]`,
    ) as HTMLElement | null
    if (activeButton) {
      const containerRect = el.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      if (
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right
      ) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }
  }, [activeTab])

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -250, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: 250, behavior: 'smooth' })
  }, [])

  return (
    <div className="mb-12 flex items-center justify-center gap-3">
      {/* Fixed ALL button */}
      <button
        onClick={() => onTabClick('all')}
        className={`flex items-center gap-2 ${pillBase} ${activeTab === 'all' ? pillActive : pillInactive}`}
      >
        <LayoutGrid className="h-4 w-4" />
        All
      </button>

      {/* Scrollable categories with arrows */}
      <div className="relative flex min-w-0 flex-1 items-center">
        {/* Left arrow - desktop only */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute -left-1 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted transition-all duration-200 hover:border-accent/40 hover:text-accent md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Left fade */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-[5] h-full w-8 bg-gradient-to-r from-bg-primary to-transparent" />
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto px-1 py-1"
        >
          {categories?.map((cat) => (
            <button
              key={cat.id}
              data-slug={cat.slug}
              onClick={() => onTabClick(cat.slug)}
              className={`${pillBase} ${activeTab === cat.slug ? pillActive : pillInactive}`}
            >
              {cat.name ?? ''}
            </button>
          ))}
        </div>

        {/* Right fade */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-[5] h-full w-8 bg-gradient-to-l from-bg-primary to-transparent" />
        )}

        {/* Right arrow - desktop only */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute -right-1 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted transition-all duration-200 hover:border-accent/40 hover:text-accent md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
