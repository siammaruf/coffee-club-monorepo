import { Coffee, Sun, Moon } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'

const offerings = [
  {
    icon: Coffee,
    title: 'Morning Blend',
    time: '6:00 AM - 12:00 PM',
    description:
      'Start your day with our signature breakfast menu paired with freshly brewed artisan coffee. The perfect morning ritual.',
    accent: 'from-primary-400/20 to-primary-300/10',
  },
  {
    icon: Sun,
    title: 'Afternoon Delight',
    time: '12:00 PM - 5:00 PM',
    description:
      'Enjoy our gourmet lunch specials, refreshing iced beverages, and homemade pastries. Ideal for a midday break.',
    accent: 'from-primary-500/20 to-primary-400/10',
  },
  {
    icon: Moon,
    title: 'Evening Special',
    time: '5:00 PM - 10:00 PM',
    description:
      'Unwind with our dinner menu, premium desserts, and specialty drinks. The perfect end to a wonderful day.',
    accent: 'from-primary-600/20 to-primary-500/10',
  },
]

export function OpeningHoursSection() {
  return (
    <section className="section-light-alt py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollFadeIn>
          <SectionHeading
            tagline="Our Schedule"
            title="When We Serve You"
            subtitle="From sunrise espresso to evening indulgence, we are here to make every moment special."
          />
        </ScrollFadeIn>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {offerings.map((item, index) => (
            <ScrollFadeIn key={item.title} delay={index * 150}>
              <div className="group relative overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-primary-400/50">
                {/* Top accent gradient */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="h-8 w-8 text-primary-600" />
                </div>

                {/* Title */}
                <h3 className="mt-6 font-heading text-xl font-bold text-text-primary">
                  {item.title}
                </h3>

                {/* Time */}
                <p className="mt-2 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-600">
                  {item.time}
                </p>

                {/* Description */}
                <p className="mt-4 leading-relaxed text-text-body">
                  {item.description}
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
