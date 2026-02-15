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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section
      className="vincent-corners relative bg-bg-primary bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/img/slide_1.jpg')" }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="relative min-w-0 flex-[0_0_100%]" key={slide.id ?? index}>
              {/* Slide 1: Centered pizza image with title below */}
              {slide.type === 'centered' && (
                <div className="flex min-h-[500px] md:min-h-[800px] flex-col items-center justify-center px-4 py-20">
                  <div className="mb-12 flex justify-center">
                    <img
                      src={slide.image ?? ''}
                      alt={slide.title}
                      className="h-auto w-[320px] max-w-full object-contain drop-shadow-2xl md:w-[420px] lg:w-[500px]"
                    />
                  </div>
                  <h1 className="mb-8 text-center font-heading text-[32px] uppercase leading-[1] tracking-[8px] text-white md:text-[60px] md:tracking-[12px]">
                    {slide.title}
                  </h1>
                  <p className="max-w-lg text-center text-[17px] leading-[30px] tracking-[2px] text-white">
                    {slide.description}
                  </p>
                </div>
              )}

              {/* Slides 2 & 3: Pizza image + text content side by side */}
              {slide.type === 'side-text' && (
                <div className="flex min-h-[500px] md:min-h-[800px] items-center px-4 py-20">
                  <div className="vincent-container flex w-full flex-col items-center md:flex-row">
                    {/* Text content - 50% */}
                    <div className="order-2 w-full text-center md:order-1 md:w-1/2 md:text-left">
                      <div className="mx-auto max-w-[555px] md:ml-auto md:mr-0">
                        <h1 className="mb-5 font-heading text-[32px] uppercase leading-[1] tracking-[8px] text-white md:text-[60px] md:leading-[60px] md:tracking-[12px]">
                          {slide.title}
                        </h1>
                        {slide.heading && (
                          <h2 className="mb-8 inline-block border-b-[3px] border-white pb-4 font-heading text-[20px] uppercase leading-[30px] tracking-[6px] text-white md:mb-12 md:text-[30px]">
                            {slide.heading}
                          </h2>
                        )}
                        <p className="mb-7 text-[17px] leading-[30px] tracking-[2px] text-white">
                          {slide.description}
                        </p>
                        {slide.show_cta && (
                          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                            <Link to="/contact" className="btn-vincent mr-4">
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
                    {/* Image - 50% */}
                    <div className="order-1 mb-8 flex w-full justify-center md:order-2 md:mb-0 md:w-1/2">
                      <img
                        src={slide.image ?? ''}
                        alt={slide.title}
                        className="h-auto w-[280px] max-w-[500px] object-contain drop-shadow-2xl md:w-[360px] lg:w-[440px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 4: Full background image with overlay */}
              {slide.type === 'bg-image' && (
                <div className="relative min-h-[500px] md:min-h-[800px]">
                  <img
                    src={slide.image ?? ''}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="relative flex min-h-[500px] md:min-h-[800px] items-center justify-center px-4 py-20">
                    <div className="text-center">
                      {slide.heading && (
                        <h2 className="mb-3 font-heading text-[20px] uppercase leading-[30px] tracking-[6px] text-white md:text-[30px]">
                          {slide.heading}
                        </h2>
                      )}
                      <h1 className="mb-5 font-heading text-[32px] uppercase leading-[1] tracking-[8px] text-white md:text-[60px] md:leading-[60px] md:tracking-[12px]">
                        {slide.title}
                      </h1>
                      <p className="mx-auto mb-8 max-w-lg text-[17px] leading-[30px] tracking-[2px] text-white">
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

      {/* Prev/Next arrows */}
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-6 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 hover:opacity-50 md:left-12"
        aria-label="Previous slide"
      >
        <img src="/img/left_nav.png" alt="" className="h-[26px] w-[30px]" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-6 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 hover:opacity-50 md:right-12"
        aria-label="Next slide"
      >
        <img src="/img/right_nav.png" alt="" className="h-[26px] w-[30px]" />
      </button>

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
