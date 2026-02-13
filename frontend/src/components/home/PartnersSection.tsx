import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'

import 'swiper/css'

const partners = [
  { name: 'Bean Origins', initials: 'BO' },
  { name: 'Dairy Fresh', initials: 'DF' },
  { name: 'Spice Route', initials: 'SR' },
  { name: 'Farm Table', initials: 'FT' },
  { name: 'Golden Roast', initials: 'GR' },
  { name: 'Brew Masters', initials: 'BM' },
  { name: 'Pure Harvest', initials: 'PH' },
  { name: 'Cup & Saucer', initials: 'CS' },
]

export function PartnersSection() {
  return (
    <section className="section-light py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollFadeIn>
          <SectionHeading
            tagline="Our Partners"
            title="Trusted By The Best"
            subtitle="We collaborate with premium brands and suppliers to bring you the finest quality in every cup and every dish."
          />
        </ScrollFadeIn>

        <ScrollFadeIn delay={200}>
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            spaceBetween={32}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
            loop
            speed={600}
          >
            {partners.map((partner) => (
              <SwiperSlide key={partner.name}>
                <div className="flex flex-col items-center justify-center py-4">
                  {/* Logo placeholder */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary-400/50 hover:shadow-md">
                    <span className="font-heading text-xl font-bold text-primary-400/60">
                      {partner.initials}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-text-muted">{partner.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </ScrollFadeIn>
      </div>
    </section>
  )
}
