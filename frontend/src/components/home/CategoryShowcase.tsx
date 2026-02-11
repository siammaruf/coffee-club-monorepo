import { Link } from 'react-router-dom'
import { Coffee, IceCreamCone, UtensilsCrossed, Cake, Sparkles, Sunrise } from 'lucide-react'

const categories = [
  { name: 'Hot Drinks', slug: 'hot-drinks', icon: Coffee, gradient: 'from-orange-500 to-red-500' },
  { name: 'Cold Drinks', slug: 'cold-drinks', icon: IceCreamCone, gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Foods', slug: 'foods', icon: UtensilsCrossed, gradient: 'from-green-500 to-emerald-500' },
  { name: 'Desserts', slug: 'desserts', icon: Cake, gradient: 'from-pink-500 to-rose-500' },
  { name: 'Specials', slug: 'specials', icon: Sparkles, gradient: 'from-primary-500 to-primary-600' },
  { name: 'Breakfast', slug: 'breakfast', icon: Sunrise, gradient: 'from-amber-500 to-orange-500' },
]

export function CategoryShowcase() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-coffee sm:text-4xl">
            Explore Our Menu
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            From freshly brewed coffees to delicious meals, explore our wide range of categories.
          </p>
        </div>

        {/* Scrollable Category Row */}
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/menu?category=${category.slug}`}
              className="group flex-shrink-0"
            >
              <div className="relative flex w-40 flex-col items-center rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:w-auto">
                {/* Gradient border accent on top */}
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${category.gradient}`} />

                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <category.icon className="h-7 w-7 text-white" />
                </div>

                {/* Name */}
                <h3 className="mt-4 text-sm font-bold text-coffee">
                  {category.name}
                </h3>

                {/* Explore link */}
                <span className="mt-2 text-xs font-medium text-primary-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
