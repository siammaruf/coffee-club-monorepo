import { Users, UtensilsCrossed, Clock, ShoppingBag } from 'lucide-react'

const stats = [
  { label: 'Happy Customers', value: '10,000+', icon: Users },
  { label: 'Menu Items', value: '50+', icon: UtensilsCrossed },
  { label: 'Years Experience', value: '10+', icon: Clock },
  { label: 'Daily Orders', value: '500+', icon: ShoppingBag },
]

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-dark py-16 sm:py-20">
      {/* Subtle gold radial gradient accents */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(197,150,26,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(197,150,26,0.04) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            By The Numbers
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-cream sm:text-4xl">
            Our Achievements
          </h2>
          <div className="gold-underline mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-500/20">
                <stat.icon className="h-8 w-8 text-primary-400" />
              </div>
              <p className="mt-4 font-heading text-3xl font-bold text-primary-400 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-coffee-light">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
