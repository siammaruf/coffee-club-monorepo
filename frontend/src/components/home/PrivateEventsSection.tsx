import { Link } from 'react-router'
import { PartyPopper, Briefcase, Heart, Utensils, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'
import { Button } from '@/components/ui/button'

const eventTypes = [
  { icon: PartyPopper, label: 'Birthday Celebrations' },
  { icon: Briefcase, label: 'Corporate Events' },
  { icon: Heart, label: 'Wedding Receptions' },
  { icon: Utensils, label: 'Private Dining' },
]

export function PrivateEventsSection() {
  return (
    <section className="section-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Image placeholder with decorative elements */}
          <ScrollFadeIn>
            <div className="relative mx-auto max-w-lg lg:mx-0">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-warm-surface shadow-xl">
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <PartyPopper className="h-20 w-20 text-primary-400/30" />
                  <p className="mt-4 font-heading text-lg font-semibold text-text-primary">
                    Memorable Events
                  </p>
                  <p className="mt-1 text-sm text-text-muted">Your special moments, our passion</p>
                </div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -bottom-3 -left-3 h-24 w-24 rounded-xl border-2 border-primary-300/30 -z-10" />
              <div className="absolute -top-3 -right-3 h-24 w-24 rounded-xl border-2 border-primary-300/30 -z-10" />
            </div>
          </ScrollFadeIn>

          {/* Right: Content */}
          <ScrollFadeIn delay={200}>
            <div>
              <SectionHeading
                tagline="Special Occasions"
                title="Private Events & Dining"
                align="left"
              />

              <div className="-mt-6 space-y-4">
                <p className="leading-relaxed text-text-body">
                  Make your special occasions truly extraordinary at CoffeeClub. Whether
                  you are planning an intimate dinner, a birthday celebration, or a
                  corporate gathering, our dedicated team will ensure every detail is
                  perfect.
                </p>

                <p className="leading-relaxed text-text-body">
                  We offer customizable menus, elegant private dining spaces, and
                  personalized service tailored to your needs. Let us create an
                  unforgettable experience for you and your guests.
                </p>
              </div>

              {/* Event types */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {eventTypes.map((event) => (
                  <div
                    key={event.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 transition-all duration-200 hover:border-primary-400/50 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                      <event.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{event.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link to="/reservation">
                  <Button variant="gold" size="lg">
                    Book Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  )
}
