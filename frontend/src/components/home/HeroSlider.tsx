import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { cn } from '@/lib/utils'
import type { HeroSlide } from '@/types/websiteContent'

interface HeroSliderProps {
  slides: HeroSlide[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi],
  )

  return (
    <section className="relative bg-bg-primary overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="relative min-w-0 flex-[0_0_100%]" key={slide.id ?? index}>
              {/* Slide 1: Centered pizza image with title below */}
              {slide.type === 'centered' && (
                <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-20">
                  <div className="mb-8 flex justify-center">
                    <img
                      src={slide.image ?? ''}
                      alt={slide.title}
                      className="h-auto w-[320px] max-w-full object-contain drop-shadow-2xl md:w-[420px] lg:w-[500px]"
                    />
                  </div>
                  <h1 className="mb-4 text-center text-text-heading">
                    {slide.title}
                  </h1>
                  <p className="max-w-lg text-center text-base text-text-body tracking-[2px]">
                    {slide.description}
                  </p>
                </div>
              )}

              {/* Slides 2 & 3: Pizza image left, text content right */}
              {slide.type === 'side-text' && (
                <div className="flex min-h-[85vh] items-center px-4 py-20">
                  <div className="vincent-container flex flex-col items-center gap-8 md:flex-row md:gap-12">
                    <div className="flex flex-1 justify-center">
                      <img
                        src={slide.image ?? ''}
                        alt={slide.title}
                        className="h-auto w-[280px] max-w-full object-contain drop-shadow-2xl md:w-[360px] lg:w-[440px]"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="mb-3 text-text-heading">
                        {slide.title}
                      </h1>
                      {slide.heading && (
                        <h2 className="mb-5 text-text-heading">
                          {slide.heading}
                        </h2>
                      )}
                      <p className="mb-8 text-base text-text-body tracking-[2px]">
                        {slide.description}
                      </p>
                      {slide.show_cta && (
                        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                          <Link to="/contact" className="btn-vincent">
                            Book Now
                            <span className="ml-2" aria-hidden="true">&rsaquo;</span>
                          </Link>
                          <Link to="/menu" className="btn-vincent-filled">
                            View Menu
                            <span className="ml-2" aria-hidden="true">&rsaquo;</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 4: Full background image with overlay */}
              {slide.type === 'bg-image' && (
                <div className="relative min-h-[85vh]">
                  <img
                    src={slide.image ?? ''}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-20">
                    <div className="text-center">
                      {slide.heading && (
                        <h2 className="mb-3 text-text-heading">
                          {slide.heading}
                        </h2>
                      )}
                      <h1 className="mb-5 text-text-heading">
                        {slide.title}
                      </h1>
                      <p className="mx-auto mb-8 max-w-lg text-base text-text-body tracking-[2px]">
                        {slide.description}
                      </p>
                      {slide.show_cta && (
                        <Link to="/menu" className="btn-vincent-filled">
                          View Menu
                          <span className="ml-2" aria-hidden="true">&rsaquo;</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={cn(
              'h-2.5 w-2.5 rounded-full border border-white/30 transition-all duration-300',
              selectedIndex === index
                ? 'w-7 bg-accent border-accent'
                : 'bg-white/30 hover:bg-white/50',
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
