import type { Advantage } from '@/types/websiteContent'

interface AdvantagesSectionProps {
  advantages: Advantage[]
}

export function AdvantagesSection({ advantages }: AdvantagesSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-fixed bg-center"
        style={{ backgroundImage: "url('/img/back_1.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="vincent-container relative z-10">
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
