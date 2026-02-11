import { Users, UtensilsCrossed, Clock, ShoppingBag } from 'lucide-react'

const stats = [
  { label: 'Happy Customers', value: '10,000+', icon: Users },
  { label: 'Menu Items', value: '50+', icon: UtensilsCrossed },
  { label: 'Years Experience', value: '10+', icon: Clock },
  { label: 'Daily Orders', value: '500+', icon: ShoppingBag },
]

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-dark to-dark-light py-16 sm:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-500/30">
                <stat.icon className="h-8 w-8 text-primary-400" />
              </div>
              <p className="mt-4 text-3xl font-black text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
