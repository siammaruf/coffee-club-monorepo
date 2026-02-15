import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { reservationService } from '@/services/httpServices/reservationService'
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

const mapSrc =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1184224942954!2d-73.93064768436976!3d40.75942004264959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzMzLjkiTiA3M8KwNTUnNDIuNSJX!5e0!3m2!1sru!2sua!4v1556096427906!5m2!1sru!2sua'

const locations = [
  {
    name: 'Brooklyn',
    address: 'St Johns Pl/Nostrand Av, Brooklyn, NY 11216, USA',
    phone: '+1 215 456 15 15',
    email: 'brooklyn@vincent.com',
    weekday: 'Monday \u2013 Friday from 8:00 am to 11:30 pm',
    weekend: 'Weekends from 9:00 am to 11:00 pm',
    image: '/img/img_4.jpg',
    reversed: false,
  },
  {
    name: 'Queens',
    address: 'Hillside Av/162 St, Queens, NY, Queens, 11432',
    phone: '+1 079 385 4690',
    email: 'queens@vincent.com',
    weekday: 'Monday \u2013 Friday from 8:00 am to 11:30 pm',
    weekend: 'Weekends from 9:00 am to 11:00 pm',
    image: '/img/img_5.jpg',
    reversed: true,
  },
  {
    name: 'New Jersey',
    address: '172 Park Ave, East Orange, NJ 07017, USA',
    phone: '+1 215 456 15 15',
    email: 'newjersey@vincent.com',
    weekday: 'Monday \u2013 Friday from 8:00 am to 11:30 pm',
    weekend: 'Weekends from 9:00 am to 11:00 pm',
    image: '/img/img_6.jpg',
    reversed: false,
  },
]

export default function ContactPage() {
  const { data: websiteContent } = useWebsiteContent()
  const _settings = websiteContent?.settings ?? defaultSettings

  // Reservation Form
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_phone: '',
    reservation_date: '',
    guest_count: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      {/* Info Boxes - matching contact-multiple-maps.html */}
      <section className="bg-bg-primary py-12">
        <div className="vincent-container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                image: '/img/info_3.jpg',
                title: 'Quality Foods',
                text: 'Sit amet, consectetur adipiscing elit quisque eget maximus velit non.',
              },
              {
                image: '/img/info_1.jpg',
                title: 'Fastest Delivery',
                text: 'Sit amet, consectetur adipiscing elit quisque eget maximus velit non.',
              },
              {
                image: '/img/info_2.jpg',
                title: 'Original Recipes',
                text: 'Sit amet, consectetur adipiscing elit quisque eget maximus velit non.',
              },
            ].map((box) => (
              <div key={box.title} className="relative overflow-hidden group">
                <img
                  src={box.image}
                  alt={box.title}
                  className="h-[250px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 group-hover:bg-black/60">
                  <div className="text-center px-6">
                    <h5 className="mb-2 text-white">{box.title}</h5>
                    <p className="text-sm text-white/80">{box.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Form with Parallax Background */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div
          className="absolute inset-0 bg-cover bg-fixed bg-center"
          style={{ backgroundImage: "url('/img/back_1.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="vincent-container relative z-10">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-8 text-center text-text-heading">
              Make a Reservation
            </h2>

            <form onSubmit={handleReservation} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <input
                  type="text"
                  name="guest_name"
                  placeholder="Your Name"
                  value={formData.guest_name}
                  onChange={handleChange}
                />
                <input
                  type="tel"
                  name="guest_phone"
                  placeholder="Your Phone"
                  value={formData.guest_phone}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <input
                  type="date"
                  name="reservation_date"
                  placeholder="Date"
                  value={formData.reservation_date}
                  onChange={handleChange}
                  min={
                    new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  }
                />
                <input
                  type="number"
                  name="guest_count"
                  placeholder="Number of People"
                  value={formData.guest_count}
                  onChange={handleChange}
                  min={1}
                  max={50}
                />
              </div>
              <textarea
                name="notes"
                placeholder="Special Requests"
                value={formData.notes}
                onChange={handleChange}
              />
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-vincent disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Book a Table'} &rsaquo;
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Our Pizzerias Title */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container text-center">
          <h6 className="mb-3 text-text-body">
            Not just a pizza, but Lifestyle
          </h6>
          <h1 className="mb-4">Our Pizzerias</h1>
          <img
            src="/img/separator_light.png"
            alt=""
            className="mx-auto mb-6"
          />
          <p className="mx-auto max-w-2xl text-text-body">
            And yes, we&apos;re pizza people. But we&apos;re also human people,
            we lead with our hearts, we believe in giving back to the global
            community. Join us, welcome to our pizzerias!
          </p>
        </div>
      </section>

      {/* Location Blocks with Maps - matching contact-multiple-maps.html */}
      {locations.map((loc) => (
        <section key={loc.name} className="bg-bg-primary">
          <div
            className={`flex flex-col ${
              loc.reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
            }`}
          >
            {/* Map */}
            <div className="h-[350px] w-full lg:h-auto lg:w-1/2">
              <iframe
                title={`${loc.name} Location`}
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '350px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact Details + Image */}
            <div className="flex w-full flex-col lg:w-1/2 lg:flex-row">
              <div className="flex flex-1 flex-col justify-center bg-bg-secondary p-8 lg:p-12">
                <h5 className="mb-4">{loc.name}</h5>
                <p className="mb-1 text-text-body">{loc.address}</p>
                <p className="mb-1 text-text-body">{loc.phone}</p>
                <p className="mb-4 text-accent">{loc.email}</p>
                <h5 className="mb-2">Working Hours</h5>
                <p className="text-text-body">{loc.weekday}</p>
                <p className="text-text-body">{loc.weekend}</p>
              </div>
              <div className="hidden lg:block lg:w-1/2">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
