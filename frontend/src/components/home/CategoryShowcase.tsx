import { Link } from 'react-router-dom'
import { Coffee, IceCreamCone, UtensilsCrossed, Cake, Sparkles, Sunrise } from 'lucide-react'

const categories = [
  { name: 'Hot Drinks', slug: 'hot-drinks', icon: Coffee },
  { name: 'Cold Drinks', slug: 'cold-drinks', icon: IceCreamCone },
  { name: 'Foods', slug: 'foods', icon: UtensilsCrossed },
  { name: 'Desserts', slug: 'desserts', icon: Cake },
  { name: 'Specials', slug: 'specials', icon: Sparkles },
  { name: 'Breakfast', slug: 'breakfast', icon: Sunrise },
]

export function CategoryShowcase() {
  return (
    <section className="bg-dark py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Categories
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-cream sm:text-4xl">
            Explore Our Menu
          </h2>
          <div className="gold-underline mx-auto mt-3" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            From freshly brewed coffees to delicious meals, explore our wide range of categories.
          </p>
        </div>

        {/* Category Cards */}
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/menu?category=${category.slug}`}
              className="group flex-shrink-0"
            >
              <div className="relative flex w-40 flex-col items-center rounded-2xl border border-primary-800/30 bg-dark-card p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5 sm:w-auto">
                {/* Gold accent line on top */}
                <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500/10 transition-all duration-300 group-hover:bg-primary-500/20 group-hover:scale-110">
                  <category.icon className="h-7 w-7 text-primary-400" />
                </div>

                {/* Name */}
                <h3 className="mt-4 text-sm font-bold text-cream">
                  {category.name}
                </h3>

                {/* Explore link */}
                <span className="mt-2 text-xs font-medium text-primary-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
