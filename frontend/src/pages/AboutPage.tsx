import { useCallback, useEffect, useState } from 'react'
import type { MetaFunction } from 'react-router'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { defaultSettings } from '@/lib/defaults'

export const meta: MetaFunction = () => [
  { title: 'About Us | CoffeeClub' },
  {
    name: 'description',
    content:
      "Learn about CoffeeClub's story, our passion for premium coffee, and our commitment to quality dining experiences.",
  },
  { property: 'og:title', content: 'About Us | CoffeeClub' },
  {
    property: 'og:description',
    content:
      "Learn about CoffeeClub's story, our passion for premium coffee, and our commitment to quality dining experiences.",
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'About Us | CoffeeClub' },
  {
    name: 'twitter:description',
    content:
      "Learn about CoffeeClub's story, our passion for premium coffee, and our commitment to quality dining experiences.",
  },
  { name: 'robots', content: 'index, follow' },
]

const carouselImages = [
  '/img/about_4.jpg',
  '/img/about_1-1.jpg',
  '/img/about_3-1.jpg',
]

export default function AboutPage() {
  const { data: websiteContent } = useWebsiteContent()
  const about = websiteContent?.settings?.about ?? defaultSettings.about
  const aboutTitle = about.title || defaultSettings.about.title
  const aboutDescription = [about.paragraph1, about.paragraph2]
    .filter(Boolean)
    .join('\n\n')
  const aboutParagraphs = (aboutDescription || `${defaultSettings.about.paragraph1}\n\n${defaultSettings.about.paragraph2}`)
    .split('\n\n')
    .filter(Boolean)

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>About CoffeeClub</h1>
      </div>

      {/* Image Carousel */}
      <section className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {carouselImages.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <img
                src={src}
                alt={`Restaurant view ${i + 1}`}
                className="h-[350px] w-full object-cover sm:h-[450px] lg:h-[500px]"
              />
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 bg-bg-primary py-6">
          {carouselImages.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === selectedIndex ? 'bg-accent' : 'bg-border'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* We Are CoffeeClub */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container text-center">
          <h1>{aboutTitle}</h1>

          <div className="mx-auto mt-6 mb-8">
            <img
              src="/img/separator_dark.png"
              alt=""
              className="mx-auto"
            />
          </div>

          <div className="mx-auto max-w-3xl space-y-6 text-text-body">
            {aboutParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
