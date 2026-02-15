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
    <section className="bg-bg-primary py-16 md:py-24">
      <div className="vincent-container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
          {/* Left column: About CoffeeClub */}
          <div>
            <h1 className="mb-4 text-text-heading">{aboutData.title}</h1>
            <h6 className="mb-5 text-text-body">{aboutData.subtitle}</h6>
            <img
              src="/img/separator_dark.png"
              alt=""
              className="mb-6"
              aria-hidden="true"
            />
            <p className="mb-4 text-text-body">{aboutData.paragraph1}</p>
            <p className="text-text-body">{aboutData.paragraph2}</p>
          </div>

          {/* Right column: Testimonials */}
          <div className="space-y-8">
            {testimonials.map((t) => (
              <div key={t.id ?? t.name}>
                <blockquote className="mb-4 border-l-2 border-border pl-5 italic text-text-muted">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  <img
                    src={t.image ?? ''}
                    alt={t.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-heading text-sm uppercase tracking-[3px] text-text-heading">
                      {t.name}
                    </div>
                    <div className="text-sm text-text-muted">{t.position}</div>
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
