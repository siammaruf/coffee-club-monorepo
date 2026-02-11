import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import type { Item } from '@/types/item'
import toast from 'react-hot-toast'

const sampleItems: Item[] = [
  {
    id: 'sample-1',
    name: 'Classic Cappuccino',
    name_bn: 'ক্লাসিক ক্যাপুচিনো',
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
    name_bn: 'আইসড মোকা লাটে',
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
    name_bn: 'গ্রিলড চিকেন স্যান্ডউইচ',
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
    name_bn: 'চকোলেট ব্রাউনি',
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
    name_bn: 'এসপ্রেসো শট',
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
    name_bn: 'ক্লাব ব্রেকফাস্ট প্লাটার',
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
    name_bn: 'ম্যাংগো স্মুদি',
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
    name_bn: 'পাস্তা আলফ্রেডো',
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

const gradientPatterns = [
  'from-primary-400 to-primary-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-green-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-red-400 to-orange-500',
  'from-teal-400 to-emerald-500',
]

export function FeaturedMenu() {
  const { addItem } = useCart()

  const handleAddToCart = (item: Item) => {
    addItem(item, 1)
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-coffee sm:text-4xl">
            Our Bestsellers
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            Discover the favorites that keep our customers coming back for more.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sampleItems.map((item, index) => {
            const price = item.sale_price ?? item.regular_price
            const gradient = gradientPatterns[index % gradientPatterns.length]

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Image / Gradient Placeholder */}
                <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <div className="text-4xl font-black text-white/30">
                    {item.name.charAt(0)}
                  </div>
                  {item.sale_price && (
                    <div className="absolute right-3 top-3 rounded-full bg-error px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      Sale
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-coffee transition-colors group-hover:text-primary-700">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-coffee-light">
                    {item.description}
                  </p>

                  {/* Price */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(price)}
                    </span>
                    {item.sale_price && (
                      <span className="text-sm text-coffee-light line-through">
                        {formatPrice(item.regular_price)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-[0.98]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )
          })}
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
