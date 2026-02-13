import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Ahmed',
    role: 'Regular Customer',
    rating: 5,
    text: 'CoffeeClub has become my second home. The cappuccino is hands down the best in Dhaka, and the breakfast platter is always fresh and perfectly prepared. The staff makes you feel like family.',
    initials: 'SA',
  },
  {
    name: 'Rahul Islam',
    role: 'Food Blogger',
    rating: 5,
    text: 'As a food blogger, I have visited hundreds of cafes. CoffeeClub stands out for their consistency and quality. Their grilled chicken sandwich is a must-try, and the ambiance is perfect for both work and relaxation.',
    initials: 'RI',
  },
  {
    name: 'Nadia Khan',
    role: 'Loyal Customer',
    rating: 5,
    text: 'The online ordering system is so convenient! I order my morning coffee every day and it is always ready on time. The loyalty points program is a nice bonus too. Highly recommended!',
    initials: 'NK',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-dark-light py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Testimonials
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-cream sm:text-4xl">
            What Our Customers Say
          </h2>
          <div className="gold-underline mx-auto mt-3" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            Do not just take our word for it. Here is what our valued customers have to say about their experience.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative rounded-xl border border-primary-800/30 bg-dark-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5"
            >
              {/* Large gold quote icon */}
              <Quote className="absolute right-6 top-6 h-10 w-10 text-primary-500/20" />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary-500 text-primary-500"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="mt-4 text-sm leading-relaxed text-coffee-light">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-primary-800/20 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-sm font-bold text-dark">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-cream">{testimonial.name}</p>
                  <p className="text-xs text-coffee-light">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
