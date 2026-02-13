import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { Star, Quote } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'

import 'swiper/css'
import 'swiper/css/pagination'

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
  {
    name: 'Tanvir Hasan',
    role: 'Business Professional',
    rating: 5,
    text: 'Perfect place for client meetings. The private dining area is elegant, the coffee is outstanding, and the service is always impeccable. CoffeeClub never disappoints.',
    initials: 'TH',
  },
  {
    name: 'Anika Rahman',
    role: 'Coffee Enthusiast',
    rating: 5,
    text: 'I am very particular about my coffee, and CoffeeClub consistently delivers the best espresso shots in the city. Their bean selection and brewing techniques are truly world-class.',
    initials: 'AR',
  },
]

export function TestimonialsSection() {
  return (
    <section className="section-light-alt py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollFadeIn>
          <SectionHeading
            tagline="Testimonials"
            title="What Our Customers Say"
            subtitle="Do not just take our word for it. Here is what our valued customers have to say about their experience."
          />
        </ScrollFadeIn>

        <ScrollFadeIn delay={200}>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-primary-300 !w-2.5 !h-2.5 !rounded-full transition-all duration-300',
              bulletActiveClass: '!bg-primary-600 !w-7 !rounded-full',
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop
            speed={600}
            className="!pb-14"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.name}>
                <div className="relative h-full rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-400/50 sm:p-8">
                  {/* Quote icon */}
                  <Quote className="absolute right-6 top-6 h-10 w-10 text-primary-200/60" />

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
                  <p className="mt-4 leading-relaxed text-text-body">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-sm font-bold text-white">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{testimonial.name}</p>
                      <p className="text-xs text-text-muted">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </ScrollFadeIn>
      </div>
    </section>
  )
}
