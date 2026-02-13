import { Link } from 'react-router-dom'
import { Coffee, ArrowRight, Award, Leaf, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { label: 'Years', value: '10+' },
  { label: 'Items', value: '50+' },
  { label: 'Customers', value: '10K+' },
]

const features = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the finest beans and freshest ingredients.',
  },
  {
    icon: Leaf,
    title: 'Sustainably Sourced',
    description: 'Direct from premium farms around the world.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every dish crafted with passion and care.',
  },
]

export function AboutSection() {
  return (
    <section className="bg-dark-light py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Image / Decorative */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-primary-800/20 bg-dark-card shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <Coffee className="h-24 w-24 text-primary-500/40" />
                <p className="mt-4 text-lg font-semibold text-cream/80">
                  CoffeeClub
                </p>
                <p className="text-sm text-coffee-light">Since 2014</p>
              </div>
            </div>

            {/* 30+ Years Experience Badge */}
            <div className="absolute -right-4 -top-4 flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-primary-500 bg-dark-card shadow-xl">
              <span className="font-heading text-2xl font-bold text-primary-400">30+</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-coffee-light">Years Exp.</span>
            </div>

            {/* Decorative accents */}
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-2xl border border-primary-800/20 bg-dark/50 -z-10" />
          </div>

          {/* Right: Text Content */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
              About Us
            </span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-cream sm:text-4xl">
              Our Story
            </h2>
            <div className="gold-underline mt-3" />

            <p className="mt-6 leading-relaxed text-coffee-light">
              Founded in 2014, CoffeeClub started as a small corner cafe in Dhaka with
              a simple mission: serve the best coffee and food in town. What began as
              a passion project has grown into a beloved community hub where people
              gather to enjoy exceptional coffee, delicious meals, and warm hospitality.
            </p>

            <p className="mt-4 leading-relaxed text-coffee-light">
              We source our beans directly from premium farms, ensuring every cup
              delivers the rich, full-bodied flavor our customers love. Our kitchen
              team crafts each dish with fresh, locally sourced ingredients and a
              commitment to quality that you can taste in every bite.
            </p>

            <p className="mt-4 leading-relaxed text-coffee-light">
              Today, CoffeeClub is more than just a coffee shop. It is a place where
              friendships are forged, ideas are born, and every visit feels like
              coming home.
            </p>

            {/* Feature icons */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
                    <feature.icon className="h-6 w-6 text-primary-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-cream">{feature.title}</p>
                  <p className="mt-1 text-xs text-coffee-light">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 flex gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-3xl font-bold text-primary-400">{stat.value}</p>
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
