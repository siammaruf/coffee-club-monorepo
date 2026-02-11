import { Link } from 'react-router-dom'
import { Coffee, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { label: 'Years', value: '10+' },
  { label: 'Items', value: '50+' },
  { label: 'Customers', value: '10K+' },
]

export function AboutSection() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Image Placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <Coffee className="h-24 w-24 text-white/60" />
                <p className="mt-4 text-lg font-semibold text-white/80">
                  CoffeeClub
                </p>
                <p className="text-sm text-white/50">Since 2014</p>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-2xl bg-primary-200/50 -z-10" />
            <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-primary-300/30 -z-10" />
          </div>

          {/* Right: Text Content */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              About Us
            </span>
            <h2 className="mt-2 text-3xl font-bold text-coffee sm:text-4xl">
              Our Story
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />

            <p className="mt-6 text-coffee-light leading-relaxed">
              Founded in 2014, CoffeeClub started as a small corner cafe in Dhaka with
              a simple mission: serve the best coffee and food in town. What began as
              a passion project has grown into a beloved community hub where people
              gather to enjoy exceptional coffee, delicious meals, and warm hospitality.
            </p>

            <p className="mt-4 text-coffee-light leading-relaxed">
              We source our beans directly from premium farms, ensuring every cup
              delivers the rich, full-bodied flavor our customers love. Our kitchen
              team crafts each dish with fresh, locally sourced ingredients and a
              commitment to quality that you can taste in every bite.
            </p>

            <p className="mt-4 text-coffee-light leading-relaxed">
              Today, CoffeeClub is more than just a coffee shop. It is a place where
              friendships are forged, ideas are born, and every visit feels like
              coming home.
            </p>

            {/* Stats */}
            <div className="mt-8 flex gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black text-primary-600">{stat.value}</p>
                  <p className="text-sm font-medium text-coffee-light">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link to="/about">
                <Button variant="outline">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
