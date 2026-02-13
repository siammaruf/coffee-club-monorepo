import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

const sampleItems: Item[] = [
  {
    id: 'sample-1',
    name: 'Classic Cappuccino',
    name_bn: '\u0995\u09cd\u09b2\u09be\u09b8\u09bf\u0995 \u0995\u09cd\u09af\u09be\u09aa\u09c1\u099a\u09bf\u09a8\u09cb',
    slug: 'classic-cappuccino',
    description: 'Rich espresso topped with velvety steamed milk foam, perfectly balanced for a smooth finish.',
    type: 'BAR',
    status: 'AVAILABLE',
    regular_price: 280,
    sale_price: null,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-2',
    name: 'Iced Mocha Latte',
    name_bn: '\u0986\u0987\u09b8\u09a1 \u09ae\u09cb\u0995\u09be \u09b2\u09be\u099f\u09c7',
    slug: 'iced-mocha-latte',
    description: 'Chilled espresso blended with rich chocolate and creamy milk over ice.',
    type: 'BAR',
    status: 'AVAILABLE',
    regular_price: 350,
    sale_price: 300,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-3',
    name: 'Grilled Chicken Sandwich',
    name_bn: '\u0997\u09cd\u09b0\u09bf\u09b2\u09a1 \u099a\u09bf\u0995\u09c7\u09a8 \u09b8\u09cd\u09af\u09be\u09a8\u09cd\u09a1\u0989\u0987\u099a',
    slug: 'grilled-chicken-sandwich',
    description: 'Juicy grilled chicken breast with fresh lettuce, tomato, and our signature sauce.',
    type: 'KITCHEN',
    status: 'AVAILABLE',
    regular_price: 420,
    sale_price: null,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-4',
    name: 'Chocolate Brownie',
    name_bn: '\u099a\u0995\u09cb\u09b2\u09c7\u099f \u09ac\u09cd\u09b0\u09be\u0989\u09a8\u09bf',
    slug: 'chocolate-brownie',
    description: 'Rich, fudgy chocolate brownie baked to perfection with a crispy top layer.',
    type: 'KITCHEN',
    status: 'AVAILABLE',
    regular_price: 220,
    sale_price: 180,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-5',
    name: 'Espresso Shot',
    name_bn: '\u098f\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8\u09cb \u09b6\u099f',
    slug: 'espresso-shot',
    description: 'A bold, concentrated shot of our premium house-blend espresso.',
    type: 'BAR',
    status: 'AVAILABLE',
    regular_price: 150,
    sale_price: null,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-6',
    name: 'Club Breakfast Platter',
    name_bn: '\u0995\u09cd\u09b2\u09be\u09ac \u09ac\u09cd\u09b0\u09c7\u0995\u09ab\u09be\u09b8\u09cd\u099f \u09aa\u09cd\u09b2\u09be\u099f\u09be\u09b0',
    slug: 'club-breakfast-platter',
    description: 'Eggs, toast, sausage, baked beans, and hash browns served with fresh orange juice.',
    type: 'KITCHEN',
    status: 'AVAILABLE',
    regular_price: 550,
    sale_price: 480,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-7',
    name: 'Mango Smoothie',
    name_bn: '\u09ae\u09cd\u09af\u09be\u0982\u0997\u09cb \u09b8\u09cd\u09ae\u09c1\u09a6\u09bf',
    slug: 'mango-smoothie',
    description: 'Fresh mango blended with yogurt and honey for a tropical delight.',
    type: 'BAR',
    status: 'AVAILABLE',
    regular_price: 280,
    sale_price: null,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'sample-8',
    name: 'Pasta Alfredo',
    name_bn: '\u09aa\u09be\u09b8\u09cd\u09a4\u09be \u0986\u09b2\u09ab\u09cd\u09b0\u09c7\u09a1\u09cb',
    slug: 'pasta-alfredo',
    description: 'Creamy alfredo pasta with parmesan cheese, garlic, and fresh herbs.',
    type: 'KITCHEN',
    status: 'AVAILABLE',
    regular_price: 480,
    sale_price: 420,
    image: '',
    categories: [],
    created_at: '',
    updated_at: '',
  },
]

export function FeaturedMenu() {
  const { addItem } = useCart()

  const handleAddToCart = (item: Item) => {
    addItem(item, 1)
    toast.success(`${item.name} added to cart!`)
  }

  // Split items into two columns
  const midpoint = Math.ceil(sampleItems.length / 2)
  const leftColumn = sampleItems.slice(0, midpoint)
  const rightColumn = sampleItems.slice(midpoint)

  return (
    <section className="bg-dark-light py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Our Menu
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-cream sm:text-4xl">
            Our Bestsellers
          </h2>
          <div className="gold-underline mx-auto mt-3" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            Discover the favorites that keep our customers coming back for more.
          </p>
        </div>

        {/* 2-Column Menu List */}
        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-0 lg:grid-cols-2">
          {/* Left Column */}
          <div>
            {leftColumn.map((item) => {
              const price = item.sale_price ?? item.regular_price
              return (
                <div
                  key={item.id}
                  className="group border-b border-primary-800/20 py-5 transition-colors duration-200 hover:bg-primary-500/5 first:pt-0 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    {/* Circular thumbnail */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="relative flex-shrink-0"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-800/30 bg-dark-card transition-all duration-200 group-hover:border-primary-500/50">
                        <Coffee className="h-7 w-7 text-primary-500/50" />
                      </div>
                      {item.sale_price && (
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
                          %
                        </div>
                      )}
                    </button>

                    {/* Item details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1">
                        <h3 className="text-base font-medium text-cream transition-colors group-hover:text-primary-400">
                          {item.name}
                        </h3>
                        <div className="mx-2 flex-1 border-b border-dashed border-primary-800/30 self-end mb-1" />
                        <div className="flex items-baseline gap-2 flex-shrink-0">
                          <span className="font-heading text-lg font-bold text-primary-400">
                            {formatPrice(price)}
                          </span>
                          {item.sale_price && (
                            <span className="text-xs text-coffee-light/60 line-through">
                              {formatPrice(item.regular_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-coffee-light">
                        {item.description}
                      </p>
                    </div>

                    {/* Add to Cart icon button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="mt-1 flex-shrink-0 rounded-lg border border-primary-800/30 p-2 text-coffee-light opacity-0 transition-all duration-200 hover:border-primary-500/50 hover:bg-primary-500/10 hover:text-primary-400 group-hover:opacity-100"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column */}
          <div>
            {rightColumn.map((item) => {
              const price = item.sale_price ?? item.regular_price
              return (
                <div
                  key={item.id}
                  className="group border-b border-primary-800/20 py-5 transition-colors duration-200 hover:bg-primary-500/5 first:pt-0 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    {/* Circular thumbnail */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="relative flex-shrink-0"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-800/30 bg-dark-card transition-all duration-200 group-hover:border-primary-500/50">
                        <Coffee className="h-7 w-7 text-primary-500/50" />
                      </div>
                      {item.sale_price && (
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
                          %
                        </div>
                      )}
                    </button>

                    {/* Item details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1">
                        <h3 className="text-base font-medium text-cream transition-colors group-hover:text-primary-400">
                          {item.name}
                        </h3>
                        <div className="mx-2 flex-1 border-b border-dashed border-primary-800/30 self-end mb-1" />
                        <div className="flex items-baseline gap-2 flex-shrink-0">
                          <span className="font-heading text-lg font-bold text-primary-400">
                            {formatPrice(price)}
                          </span>
                          {item.sale_price && (
                            <span className="text-xs text-coffee-light/60 line-through">
                              {formatPrice(item.regular_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-coffee-light">
                        {item.description}
                      </p>
                    </div>

                    {/* Add to Cart icon button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="mt-1 flex-shrink-0 rounded-lg border border-primary-800/30 p-2 text-coffee-light opacity-0 transition-all duration-200 hover:border-primary-500/50 hover:bg-primary-500/10 hover:text-primary-400 group-hover:opacity-100"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* View Full Menu */}
        <div className="mt-12 text-center">
          <Link to="/menu">
            <Button variant="outline" size="lg">
              View Full Menu
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
