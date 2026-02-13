import { Link } from 'react-router'
import { ArrowRight, Coffee } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'

export function AboutSection() {
  return (
    <section className="section-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Overlapping images with decorative border */}
          <ScrollFadeIn>
            <div className="relative mx-auto max-w-md lg:mx-0">
              {/* Main image placeholder */}
              <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-warm-surface shadow-xl">
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <Coffee className="h-24 w-24 text-primary-400/40" />
                  <p className="mt-4 font-heading text-xl font-semibold text-text-primary">
                    CoffeeClub
                  </p>
                  <p className="mt-1 text-sm text-text-muted">Crafted Since 2014</p>
                </div>
              </div>

              {/* Secondary overlapping image placeholder */}
              <div className="absolute -bottom-6 -right-6 z-20 h-48 w-40 overflow-hidden rounded-xl border-4 border-white bg-warm-card shadow-lg sm:h-56 sm:w-48">
                <div className="flex h-full flex-col items-center justify-center bg-primary-50 p-4 text-center">
                  <span className="font-heading text-3xl font-bold text-primary-600">15+</span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-wider text-primary-500">
                    Years of Excellence
                  </span>
                </div>
              </div>

              {/* Decorative border frame */}
              <div className="absolute -top-4 -left-4 z-0 h-full w-full rounded-2xl border-2 border-dashed border-primary-300/40" />

              {/* Decorative dots */}
              <div className="absolute -top-8 -right-8 grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-primary-400/20"
                  />
                ))}
              </div>
            </div>
          </ScrollFadeIn>

          {/* Right: Text content */}
          <ScrollFadeIn delay={200}>
            <div>
              <SectionHeading
                tagline="About Us"
                title="Our Story & Passion"
                align="left"
              />

              <div className="-mt-6 space-y-4">
                <p className="leading-relaxed text-text-body">
                  Founded in 2014, CoffeeClub started as a small corner cafe in Dhaka with
                  a simple mission: serve the best coffee and food in town. What began as
                  a passion project has grown into a beloved community hub where people
                  gather to enjoy exceptional coffee, delicious meals, and warm hospitality.
                </p>

                <p className="leading-relaxed text-text-body">
                  We source our beans directly from premium farms across Ethiopia, Colombia,
                  and Brazil, ensuring every cup delivers the rich, full-bodied flavor our
                  customers love. Our kitchen team crafts each dish with fresh, locally
                  sourced ingredients and an unwavering commitment to quality.
                </p>

                <p className="leading-relaxed text-text-body">
                  Today, CoffeeClub is more than just a coffee shop. It is a place where
                  friendships are forged, ideas are born, and every visit feels like
                  coming home.
                </p>
              </div>

              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-primary-600 transition-colors duration-200 hover:text-primary-700"
              >
                Learn More About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  )
}
