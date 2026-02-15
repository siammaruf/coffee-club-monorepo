import type { Advantage } from '@/types/websiteContent'

interface AdvantagesSectionProps {
  advantages: Advantage[]
}

export function AdvantagesSection({ advantages }: AdvantagesSectionProps) {
  return (
    <section className="relative bg-bg-secondary py-16 md:py-24">
      <div className="vincent-container">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {advantages.map((item) => (
            <div key={item.id ?? item.title} className="text-center">
              <div className="mb-5 flex justify-center">
                <img
                  src={item.icon ?? ''}
                  alt={item.title}
                  className="h-16 w-auto"
                />
              </div>
              <h4 className="mb-4 text-text-heading">{item.title}</h4>
              <p className="text-text-body">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
