import type { Advantage } from '@/types/websiteContent'

interface AdvantagesSectionProps {
  advantages: Advantage[]
}

export function AdvantagesSection({ advantages }: AdvantagesSectionProps) {
  return (
    <section className="vincent-advantages vincent-corners-bottom">
      {/* Gold parallax background */}
      <div className="vincent-advantages-bg" />

      <div className="vincent-container relative z-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {advantages.map((item) => (
            <div key={item.id ?? item.title} className="text-center">
              <div className="mb-9 flex justify-center">
                <img
                  src={item.icon ?? ''}
                  alt={item.title}
                  className="h-[100px] w-auto"
                />
              </div>
              <h4 className="mb-6 text-bg-primary">{item.title}</h4>
              <p className="m-0 text-[15px] text-bg-primary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
