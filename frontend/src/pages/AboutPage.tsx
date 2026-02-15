import { useCallback, useEffect, useState } from 'react'
import type { MetaFunction } from 'react-router'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FaFacebook, FaTwitter, FaPinterest } from 'react-icons/fa'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { defaultSettings, defaultTestimonials } from '@/lib/defaults'

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

const teamMembers = [
  {
    name: 'John Williams',
    role: 'House Chef',
    image: '/img/team_1-1600x1600.jpg',
  },
  {
    name: 'Sara Welch',
    role: 'Waitress',
    image: '/img/team_2-1600x1600.jpg',
  },
  {
    name: 'Edward Gray',
    role: 'Barmen',
    image: '/img/team_3-1600x1600.jpg',
  },
]

const partners = [
  '/img/partner_5.jpg',
  '/img/partner_4.jpg',
  '/img/partner_3.jpg',
  '/img/partner_2.jpg',
  '/img/partner_1.jpg',
  '/img/partner_6.jpg',
]

export default function AboutPage() {
  const { data: websiteContent } = useWebsiteContent()
  const about = websiteContent?.settings?.about ?? defaultSettings.about
  const testimonials = websiteContent?.testimonials ?? defaultTestimonials
  const aboutTitle = about.title || defaultSettings.about.title
  const aboutSubtitle = about.subtitle || defaultSettings.about.subtitle
  const aboutParagraph1 = about.paragraph1 || defaultSettings.about.paragraph1
  const aboutParagraph2 = about.paragraph2 || defaultSettings.about.paragraph2

  // Image carousel
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

  // Testimonials carousel
  const [testIndex, setTestIndex] = useState(0)
  const [testRef, testApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ])

  const onTestSelect = useCallback(() => {
    if (!testApi) return
    setTestIndex(testApi.selectedScrollSnap())
  }, [testApi])

  useEffect(() => {
    if (!testApi) return
    testApi.on('select', onTestSelect)
    onTestSelect()
    return () => {
      testApi.off('select', onTestSelect)
    }
  }, [testApi, onTestSelect])

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>About Our Pizzeria</h1>
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

      {/* We Are CoffeeClub - matching template */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container text-center">
          <h2>{aboutTitle}</h2>
          <h6 className="mt-4 text-text-body">{aboutSubtitle}</h6>
          <div className="mx-auto mt-6 mb-8">
            <img
              src="/img/separator_light.png"
              alt=""
              className="mx-auto"
            />
          </div>
          <div className="mx-auto max-w-3xl space-y-4 text-text-body">
            <p>{aboutParagraph1}</p>
            {aboutParagraph2 && <p>{aboutParagraph2}</p>}
          </div>
        </div>
      </section>

      {/* Branch Cards - matching about1.html */}
      <section className="bg-bg-primary pb-16 sm:pb-24">
        <div className="vincent-container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="text-center">
              <img
                src="/img/img_6-1024x801.jpg"
                alt="Brooklyn"
                className="mb-6 w-full object-cover"
              />
              <h4 className="mb-3">Brooklyn</h4>
              <p className="text-text-body">
                St Johns Pl/Nostrand Av, Brooklyn, NY 11216, USA
              </p>
              <p className="text-text-body">
                +1 215 456 15 15 brooklyn@vincent.com
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-vincent mt-4 inline-block"
              >
                Get Directions &rsaquo;
              </a>
            </div>
            <div className="text-center">
              <img
                src="/img/img_5-1024x801.jpg"
                alt="Queens"
                className="mb-6 w-full object-cover"
              />
              <h4 className="mb-3">Queens</h4>
              <p className="text-text-body">
                Hillside Av/162 St, Queens, NY, Queens, New York 11432, USA
              </p>
              <p className="text-text-body">
                +1 079 385 4690 queens@vincent.com
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-vincent mt-4 inline-block"
              >
                Get Directions &rsaquo;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel - matching about1.html */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container text-center">
          <h6 className="mb-3 text-text-body">
            Not just a pizza, but Lifestyle
          </h6>
          <h1 className="mb-4">Our Clients Say</h1>
          <img
            src="/img/separator_dark.png"
            alt=""
            className="mx-auto mb-10"
            aria-hidden="true"
          />

          <div className="mx-auto max-w-3xl overflow-hidden" ref={testRef}>
            <div className="flex">
              {testimonials.map((t, i) => (
                <div key={t.id ?? i} className="min-w-0 flex-[0_0_100%] px-4">
                  <p className="mb-8 text-lg italic text-text-body">
                    {t.quote}
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={t.image ?? ''}
                      alt={t.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-heading text-sm uppercase tracking-[3px] text-text-heading">
                        {t.name}
                      </div>
                      <div className="text-sm text-text-muted">
                        {t.position}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => testApi?.scrollTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === testIndex ? 'bg-accent' : 'bg-border'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Partners - matching about1.html */}
      <section className="bg-bg-secondary py-12">
        <div className="vincent-container">
          <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
            {partners.map((src, i) => (
              <div key={i} className="flex items-center justify-center">
                <img
                  src={src}
                  alt={`Partner ${i + 1}`}
                  className="max-h-20 w-auto opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - matching about1.html */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container text-center">
          <h2 className="mb-10">Meet Our Team</h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="aspect-square w-full object-cover"
                  />
                  {/* Hover overlay with social links */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                    <div className="flex gap-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <a
                        href="https://www.facebook.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-accent"
                      >
                        <FaFacebook className="h-5 w-5" />
                      </a>
                      <a
                        href="https://twitter.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-accent"
                      >
                        <FaTwitter className="h-5 w-5" />
                      </a>
                      <a
                        href="https://www.pinterest.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-accent"
                      >
                        <FaPinterest className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h5>{member.name}</h5>
                  <p className="mt-1 text-text-muted">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="/about" className="btn-vincent mt-10 inline-block">
            View All Staff &rsaquo;
          </a>
        </div>
      </section>

      {/* Advantages with Parallax - matching about1.html */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div
          className="absolute inset-0 bg-cover bg-fixed bg-center"
          style={{ backgroundImage: "url('/img/back_1.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="vincent-container relative z-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            <div className="text-center">
              <div className="mb-5 flex justify-center">
                <img src="/img/icon_1.png" alt="Quality Foods" className="h-16 w-auto" />
              </div>
              <h4 className="mb-4 text-text-heading">Quality Foods</h4>
              <p className="text-text-body">
                Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-5 flex justify-center">
                <img src="/img/icon_3.png" alt="Fastest Delivery" className="h-16 w-auto" />
              </div>
              <h4 className="mb-4 text-text-heading">Fastest Delivery</h4>
              <p className="text-text-body">
                Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-5 flex justify-center">
                <img src="/img/icon_2.png" alt="Original Recipes" className="h-16 w-auto" />
              </div>
              <h4 className="mb-4 text-text-heading">Original Recipes</h4>
              <p className="text-text-body">
                Sit amet, consectetur adipiscing elit quisque eget maximus velit, non eleifend libero curabitur dapibus mauris sed leo cursus aliquetcras suscipit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
