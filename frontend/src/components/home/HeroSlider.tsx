import { Link } from 'react-router'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import { ArrowRight, ArrowLeft, Coffee, Utensils, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

const slides = [
  {
    tagline: 'Welcome to CoffeeClub',
    heading: 'The Art of Fine Coffee & Dining',
    description:
      'Experience the finest hand-crafted coffee and exquisite cuisine in a warm, inviting atmosphere. Every cup tells a story, every dish is a masterpiece.',
    primaryCta: { label: 'Explore Menu', link: '/menu', icon: Coffee },
    secondaryCta: { label: 'Book a Table', link: '/reservation', icon: CalendarDays },
    gradient: 'from-dark via-dark/95 to-dark-light/90',
  },
  {
    tagline: 'Crafted with Passion',
    heading: 'Premium Beans, Exceptional Taste',
    description:
      'We source our beans from the finest farms around the world. Each blend is roasted to perfection, delivering a rich, full-bodied flavor in every sip.',
    primaryCta: { label: 'Order Now', link: '/menu', icon: ArrowRight },
    secondaryCta: { label: 'Our Story', link: '/about', icon: ArrowRight },
    gradient: 'from-dark-light via-dark/95 to-dark/90',
  },
  {
    tagline: 'A Culinary Journey',
    heading: 'Savor Every Moment with Us',
    description:
      'From artisan breakfasts to gourmet dinners, our chefs create dishes that delight the senses. Pair your meal with our signature beverages for the perfect experience.',
    primaryCta: { label: 'View Specials', link: '/menu', icon: Utensils },
    secondaryCta: { label: 'Private Events', link: '/reservation', icon: CalendarDays },
    gradient: 'from-dark via-dark-light/95 to-dark/90',
  },
]

export function HeroSlider() {
  return (
    <section className="relative min-h-screen">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white/40 !w-3 !h-3 !rounded-full transition-all duration-300',
          bulletActiveClass: '!bg-primary-400 !w-8 !rounded-full',
        }}
        navigation={{
          prevEl: '.hero-prev',
          nextEl: '.hero-next',
        }}
        loop
        speed={800}
        className="h-screen min-h-[90vh]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative flex min-h-screen items-center">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />

              {/* Subtle radial accents */}
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 30%, rgba(160,120,44,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(196,144,62,0.06) 0%, transparent 50%)',
                  }}
                />
              </div>

              {/* Decorative circles */}
              <div className="absolute right-[10%] top-[15%] h-72 w-72 rounded-full border border-primary-500/10 opacity-40" />
              <div className="absolute -left-20 bottom-[20%] h-64 w-64 rounded-full bg-gradient-to-br from-primary-500/5 to-transparent" />
              <div className="absolute left-[15%] top-1/4 h-2 w-2 rounded-full bg-primary-400/30 animate-float" style={{ animationDelay: '0s' }} />
              <div className="absolute right-[25%] top-1/3 h-1.5 w-1.5 rounded-full bg-primary-300/20 animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute left-[30%] bottom-1/4 h-2.5 w-2.5 rounded-full bg-primary-500/15 animate-float" style={{ animationDelay: '0.5s' }} />

              {/* Content */}
              <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="font-script text-xl text-primary-400 md:text-2xl animate-fade-in">
                    {slide.tagline}
                  </p>

                  <h1
                    className="mt-4 font-heading text-4xl font-bold leading-tight text-text-light sm:text-5xl lg:text-6xl xl:text-7xl animate-fade-up"
                    style={{ animationDelay: '0.15s' }}
                  >
                    {slide.heading}
                  </h1>

                  <p
                    className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-light/70 sm:text-xl animate-fade-up"
                    style={{ animationDelay: '0.3s' }}
                  >
                    {slide.description}
                  </p>

                  <div
                    className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up"
                    style={{ animationDelay: '0.45s' }}
                  >
                    <Link to={slide.primaryCta.link}>
                      <Button variant="gold" size="lg" className="w-full sm:w-auto">
                        {slide.primaryCta.label}
                        <slide.primaryCta.icon className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to={slide.secondaryCta.link}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-text-light/30 text-text-light hover:bg-text-light/10 sm:w-auto"
                      >
                        {slide.secondaryCta.label}
                        <slide.secondaryCta.icon className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation arrows */}
      <button
        className="hero-prev absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-dark/40 text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-400/50 hover:bg-dark/60 hover:text-primary-400 lg:left-8"
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        className="hero-next absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-dark/40 text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-400/50 hover:bg-dark/60 hover:text-primary-400 lg:right-8"
        aria-label="Next slide"
      >
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 32C840 40 960 48 1080 48C1200 48 1320 40 1380 36L1440 32V80H0Z"
            fill="#FDF8F3"
          />
        </svg>
      </div>
    </section>
  )
}
