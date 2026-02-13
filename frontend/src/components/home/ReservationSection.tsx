import { useState } from 'react'
import { Clock, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const openingHours = [
  { day: 'Monday - Thursday', hours: '10:00 AM - 9:00 PM' },
  { day: 'Friday - Saturday', hours: '9:00 AM - 10:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
]

export function ReservationSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    partySize: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success('Reservation request submitted! We will confirm shortly.')
    setFormData({ name: '', email: '', phone: '', date: '', time: '', partySize: '' })
    setIsSubmitting(false)
  }

  const inputClasses =
    'w-full rounded-lg border border-primary-800/30 bg-dark-card px-4 py-3 text-cream placeholder-coffee-light/50 transition-colors duration-200 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/30'

  return (
    <section className="bg-dark-light py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Reservation
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-cream sm:text-4xl">
            Book a Table
          </h2>
          <div className="gold-underline mx-auto mt-3" />
          <p className="mx-auto mt-4 max-w-2xl text-coffee-light">
            Reserve your spot for an unforgettable dining experience. We look forward to serving you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Reservation Form */}
          <div className="rounded-xl border border-primary-800/20 bg-dark-card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="res-name" className="mb-1.5 block text-sm font-medium text-cream">
                    Full Name
                  </label>
                  <input
                    id="res-name"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="res-email" className="mb-1.5 block text-sm font-medium text-cream">
                    Email
                  </label>
                  <input
                    id="res-email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="res-phone" className="mb-1.5 block text-sm font-medium text-cream">
                    Phone Number
                  </label>
                  <input
                    id="res-phone"
                    type="tel"
                    name="phone"
                    placeholder="+880 1XXX-XXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="res-party" className="mb-1.5 block text-sm font-medium text-cream">
                    Party Size
                  </label>
                  <select
                    id="res-party"
                    name="partySize"
                    value={formData.partySize}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n} className="bg-dark-card">
                        {n} {n === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                    <option value="9+" className="bg-dark-card">
                      9+ People
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="res-date" className="mb-1.5 block text-sm font-medium text-cream">
                    Date
                  </label>
                  <input
                    id="res-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="res-time" className="mb-1.5 block text-sm font-medium text-cream">
                    Time
                  </label>
                  <input
                    id="res-time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Book a Table
              </Button>
            </form>
          </div>

          {/* Right: Opening Hours + Info */}
          <div className="flex flex-col justify-center">
            {/* Opening Hours */}
            <div className="rounded-xl border border-primary-800/20 bg-dark-card p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <Clock className="h-5 w-5 text-primary-400" />
                </div>
                <h3 className="font-heading text-xl font-bold text-cream">Opening Hours</h3>
              </div>

              <div className="space-y-4">
                {openingHours.map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex items-center justify-between border-b border-primary-800/15 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm text-coffee-light">{schedule.day}</span>
                    <span
                      className={`text-sm font-medium ${
                        schedule.hours === 'Closed' ? 'text-error' : 'text-primary-400'
                      }`}
                    >
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-primary-800/20 bg-dark-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <Phone className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-coffee-light">Call Us</p>
                  <p className="text-sm font-medium text-cream">+880 1712-345678</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-primary-800/20 bg-dark-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <MapPin className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-coffee-light">Location</p>
                  <p className="text-sm font-medium text-cream">Gulshan, Dhaka</p>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-500/30" />
              <span className="font-heading text-sm italic text-primary-400/60">
                We look forward to your visit
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-500/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
