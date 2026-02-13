import { Clock, Utensils, Users, ChefHat } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCountUp } from '@/hooks/useCountUp'

interface StatCardProps {
  icon: React.ElementType
  end: number
  suffix: string
  label: string
  delay: number
}

function StatCard({ icon: Icon, end, suffix, label, delay }: StatCardProps) {
  const { ref, count } = useCountUp(end, 2000)

  return (
    <div
      ref={ref}
      className="group text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-500/20 group-hover:border-primary-400/40">
        <Icon className="h-9 w-9 text-primary-400" />
      </div>
      <p className="mt-5 font-heading text-4xl font-bold text-primary-400 sm:text-5xl">
        {count}
        <span className="text-primary-400/80">{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium tracking-wide text-text-light/70">
        {label}
      </p>
    </div>
  )
}

const stats: Omit<StatCardProps, 'delay'>[] = [
  { icon: Clock, end: 15, suffix: '+', label: 'Years Experience' },
  { icon: Utensils, end: 50, suffix: '+', label: 'Menu Items' },
  { icon: Users, end: 10, suffix: 'K+', label: 'Happy Customers' },
  { icon: ChefHat, end: 25, suffix: '+', label: 'Expert Chefs' },
]

export function WhyChooseUs() {
  return (
    <section className="section-dark relative overflow-hidden py-20 sm:py-28">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(160,120,44,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(196,144,62,0.06) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Decorative floating particles */}
      <div className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-primary-400/20 animate-float" />
      <div className="absolute right-[15%] top-[30%] h-1.5 w-1.5 rounded-full bg-primary-300/15 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute left-[25%] bottom-[25%] h-2.5 w-2.5 rounded-full bg-primary-500/10 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute right-[20%] bottom-[15%] h-2 w-2 rounded-full bg-primary-400/15 animate-float" style={{ animationDelay: '0.5s' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tagline="Why Choose Us"
          title="Numbers Speak for Themselves"
          subtitle="We take pride in our commitment to quality, craftsmanship, and customer satisfaction."
          dark
        />

        <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              delay={index * 150}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
