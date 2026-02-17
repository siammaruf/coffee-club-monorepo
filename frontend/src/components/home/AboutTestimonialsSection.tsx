import type { Testimonial, WebsiteSettings } from '@/types/websiteContent'
import { defaultSettings } from '@/lib/defaults'

interface AboutTestimonialsSectionProps {
  about?: WebsiteSettings['about']
  testimonials: Testimonial[]
}

export function AboutTestimonialsSection({
  about,
  testimonials,
}: AboutTestimonialsSectionProps) {
  const aboutData = about ?? defaultSettings.about

  return (
    <section
      className="py-16 md:py-24 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/back_1.jpg')" }}
    >
      <div className="vincent-container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
          {/* Left column: About CoffeeClub */}
          <div>
            <h1 className="mb-4 text-bg-primary">{aboutData.title}</h1>
            <h6 className="mb-5 text-bg-primary">{aboutData.subtitle}</h6>
            <img
              src="/img/separator_dark.png"
              alt=""
              className="mb-6"
              aria-hidden="true"
            />
            <p className="mb-4 text-bg-primary">{aboutData.paragraph1}</p>
            <p className="text-bg-primary">{aboutData.paragraph2}</p>
          </div>

          {/* Right column: Testimonials */}
          <div className="space-y-8">
            {testimonials.map((t) => (
              <div key={t.id ?? t.name}>
                <blockquote className="mb-4 border-l-2 border-bg-primary/30 pl-5 italic text-bg-primary/80">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  <img
                    src={t.image ?? ''}
                    alt={t.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-heading text-sm uppercase tracking-[3px] text-bg-primary">
                      {t.name}
                    </div>
                    <div className="text-sm text-bg-primary/70">{t.position}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
