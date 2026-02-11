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
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-coffee sm:text-4xl">
            What Our Customers Say
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            Do not just take our word for it. Here is what our valued customers have to say about their experience.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Quote icon */}
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary-200" />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary-400 text-primary-400"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="mt-4 text-sm leading-relaxed text-coffee-light">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-primary-50 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-coffee">{testimonial.name}</p>
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
