import { useState, useCallback, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { reservationService } from '@/services/httpServices/reservationService'
import { publicService } from '@/services/httpServices/publicService'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { defaultSettings } from '@/lib/defaults'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Contact Us | CoffeeClub' },
  {
    name: 'description',
    content:
      'Get in touch with CoffeeClub. Find our location, contact details, and make a reservation.',
  },
  { property: 'og:title', content: 'Contact Us | CoffeeClub' },
  {
    property: 'og:description',
    content:
      'Get in touch with CoffeeClub. Find our location, contact details, and make a reservation.',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Contact Us | CoffeeClub' },
  {
    name: 'twitter:description',
    content:
      'Get in touch with CoffeeClub. Find our location, contact details, and make a reservation.',
  },
  { name: 'robots', content: 'index, follow' },
]

const galleryImages = [
  '/img/about_4.jpg',
  '/img/about_1-1.jpg',
  '/img/about_3-1.jpg',
]

export default function ContactPage() {
  // -- Website Content --
  const { data: websiteContent } = useWebsiteContent()
  const settings = websiteContent?.settings ?? defaultSettings
  const phone = settings.phone || defaultSettings.phone
  const hours = settings.hours || defaultSettings.hours

  // -- Carousel --
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

  // -- Reservation Form --
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_phone: '',
    reservation_date: '',
    guest_count: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // -- Contact Form --
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = contactData.name?.trim() ?? ''
    const email = contactData.email?.trim() ?? ''
    const message = contactData.message?.trim() ?? ''

    if (!name || !email || !message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsContactSubmitting(true)
    try {
      await publicService.submitContactMessage({
        name,
        email,
        phone: contactData.phone?.trim() || undefined,
        subject: contactData.subject?.trim() || undefined,
        message,
      })
      toast.success('Message sent successfully!')
      setContactData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsContactSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = formData.guest_name?.trim() ?? ''
    const phone = formData.guest_phone?.trim() ?? ''
    const date = formData.reservation_date?.trim() ?? ''
    const count = Number(formData.guest_count) || 0

    if (!name || !phone || !date || count < 1) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await reservationService.createReservation({
        name,
        email: '',
        phone,
        date,
        time: '19:00',
        party_size: count,
        special_requests: formData.notes?.trim() || undefined,
      })
      toast.success('Reservation submitted successfully!')
      setFormData({
        guest_name: '',
        guest_phone: '',
        reservation_date: '',
        guest_count: '',
        notes: '',
      })
    } catch {
      toast.error('Failed to submit reservation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Contact Us</h1>
      </div>

      {/* Image Gallery Carousel */}
      <section className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {galleryImages.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                className="h-[350px] w-full object-cover sm:h-[450px] lg:h-[500px]"
              />
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-2 bg-bg-primary py-6">
          {galleryImages.map((_, i) => (
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

      {/* Reservation + Map Section */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Reservation Form */}
            <div>
              <h2 className="mb-2">Make a Reservation</h2>
              <div className="mb-8 mt-4">
                <img src="/img/separator_dark.png" alt="" />
              </div>

              <form onSubmit={handleReservation} className="space-y-5">
                <div>
                  <input
                    type="text"
                    name="guest_name"
                    placeholder="Your Name *"
                    value={formData.guest_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="guest_phone"
                    placeholder="Your Phone *"
                    value={formData.guest_phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="reservation_date"
                    placeholder="Date *"
                    value={formData.reservation_date}
                    onChange={handleChange}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="guest_count"
                    placeholder="Number of People *"
                    value={formData.guest_count}
                    onChange={handleChange}
                    min={1}
                    max={50}
                  />
                </div>
                <div>
                  <textarea
                    name="notes"
                    placeholder="Special Requests"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-vincent-filled disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Book a Table'}
                </button>
              </form>
            </div>

            {/* Right: Google Maps */}
            <div>
              <div className="h-full min-h-[400px] w-full border-2 border-border">
                <iframe
                  title="CoffeeClub Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902!2d90.4152!3d23.7808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ2JzUxLjAiTiA5MMKwMjQnNTQuNyJF!5e0!3m2!1sen!2sbd!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Send Us a Message Section */}
      <section className="bg-bg-secondary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-2 text-center">Send Us a Message</h2>
            <div className="mx-auto mb-8 mt-4">
              <img src="/img/separator_dark.png" alt="" className="mx-auto" />
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={contactData.name}
                    onChange={handleContactChange}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={contactData.email}
                    onChange={handleContactChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    value={contactData.phone}
                    onChange={handleContactChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={contactData.subject}
                    onChange={handleContactChange}
                  />
                </div>
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  value={contactData.message}
                  onChange={handleContactChange}
                  rows={5}
                />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isContactSubmitting}
                  className="btn-vincent-filled disabled:opacity-50"
                >
                  {isContactSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="mb-12 text-center">
            <h2>Our Branches</h2>
            <div className="mx-auto mt-4">
              <img src="/img/separator_dark.png" alt="" className="mx-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Branch 1 */}
            <div className="border-2 border-border bg-bg-card">
              <img
                src="/img/img_6-1024x801.jpg"
                alt="Gulshan Branch"
                className="h-[250px] w-full object-cover"
              />
              <div className="p-6 text-center">
                <h4 className="mb-2">Gulshan Branch</h4>
                <p className="text-sm text-text-muted">
                  123 Coffee Street, Gulshan-2
                </p>
                <p className="text-sm text-text-muted">Dhaka 1212, Bangladesh</p>
                <p className="mt-2 text-sm text-accent">{phone}</p>
                <p className="mt-1 text-xs text-text-muted">{hours}</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-vincent mt-4 inline-block"
                >
                  Get Directions
                </a>
              </div>
            </div>

            {/* Branch 2 */}
            <div className="border-2 border-border bg-bg-card">
              <img
                src="/img/img_5-1024x801.jpg"
                alt="Dhanmondi Branch"
                className="h-[250px] w-full object-cover"
              />
              <div className="p-6 text-center">
                <h4 className="mb-2">Dhanmondi Branch</h4>
                <p className="text-sm text-text-muted">
                  456 Satmasjid Road, Dhanmondi
                </p>
                <p className="text-sm text-text-muted">Dhaka 1205, Bangladesh</p>
                <p className="mt-2 text-sm text-accent">{phone}</p>
                <p className="mt-1 text-xs text-text-muted">{hours}</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-vincent mt-4 inline-block"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
