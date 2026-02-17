import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'
import { useCreateReservation } from '@/services/httpServices/queries/useReservations'
import type { EventType } from '@/types/reservation'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Reserve a Table | CoffeeClub' },
  {
    name: 'description',
    content:
      'Book your table at CoffeeClub. Perfect for dining, celebrations, meetings, and private events.',
  },
  { property: 'og:title', content: 'Reserve a Table | CoffeeClub' },
  {
    property: 'og:description',
    content:
      'Book your table at CoffeeClub. Perfect for dining, celebrations, meetings, and private events.',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Reserve a Table | CoffeeClub' },
  {
    name: 'twitter:description',
    content:
      'Book your table at CoffeeClub. Perfect for dining, celebrations, meetings, and private events.',
  },
  { name: 'robots', content: 'index, follow' },
]

const reservationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  party_size: z.preprocess(
    (val) => (typeof val === 'string' ? Number(val) : val),
    z
      .number()
      .min(1, 'Party size must be at least 1')
      .max(50, 'Party size cannot exceed 50')
  ),
  event_type: z.string().optional(),
  special_requests: z.string().optional(),
})

type ReservationFormData = z.infer<typeof reservationSchema>

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'DINING', label: 'Regular Dining' },
  { value: 'BIRTHDAY', label: 'Birthday Party' },
  { value: 'MEETING', label: 'Business Meeting' },
  { value: 'PRIVATE_EVENT', label: 'Private Event' },
  { value: 'OTHER', label: 'Other' },
]

const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
]

export default function ReservationPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const createReservation = useCreateReservation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    mode: 'onChange',
    defaultValues: {
      party_size: 2,
      event_type: 'DINING',
    },
  })

  const selectedEventType = watch('event_type')

  // Minimum date is tomorrow (SSR-safe: empty on server, computed on client)
  const [minDate] = useState(() => {
    if (typeof window === 'undefined') return ''
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })

  const onSubmit = async (data: ReservationFormData) => {
    try {
      await createReservation.mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        date: data.date,
        time: data.time,
        party_size: data.party_size,
        event_type: (data.event_type as EventType) || undefined,
        special_requests: data.special_requests?.trim() || undefined,
      })
      setIsSuccess(true)
      toast.success('Reservation submitted successfully!')
    } catch {
      toast.error('Failed to submit reservation. Please try again.')
    }
  }

  // Success State
  if (isSuccess) {
    return (
      <>
        <div className="page-title-block">
          <h1>Reservation</h1>
        </div>

        <section className="bg-bg-primary py-16 sm:py-24">
          <div className="vincent-container">
            <div className="mx-auto max-w-lg border-2 border-border bg-bg-card p-8 text-center sm:p-10">
              <h2 className="text-accent">Reservation Submitted!</h2>
              <div className="mx-auto mt-4">
                <img
                  src="/img/separator_dark.png"
                  alt=""
                  className="mx-auto"
                />
              </div>
              <p className="mt-6 text-text-body">
                Thank you for your reservation request. We will confirm your
                booking shortly via email. Please check your inbox for a
                confirmation message.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/menu" className="btn-vincent-filled">
                  Browse Menu
                </Link>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="btn-vincent"
                >
                  Make Another Reservation
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Reserve a Table</h1>
      </div>

      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Info Panel */}
            <div className="lg:col-span-2">
              <h2>Why Reserve With Us?</h2>
              <div className="mt-4 mb-6">
                <img src="/img/separator_dark.png" alt="" />
              </div>
              <p className="text-text-body">
                Enjoy a premium dining experience in a warm, welcoming
                atmosphere. Whether it is a casual dinner, a birthday
                celebration, or a business meeting, we have the perfect setting
                for you.
              </p>

              <div className="mt-8 space-y-6">
                <div className="border-l-2 border-accent pl-4">
                  <h6 className="text-text-primary">Flexible Scheduling</h6>
                  <p className="mt-1 text-sm text-text-body">
                    Reserve for any occasion, from morning coffee to dinner
                    service.
                  </p>
                </div>

                <div className="border-l-2 border-accent pl-4">
                  <h6 className="text-text-primary">Group Friendly</h6>
                  <p className="mt-1 text-sm text-text-body">
                    Accommodate parties of all sizes, from intimate dinners to
                    large gatherings.
                  </p>
                </div>

                <div className="border-l-2 border-accent pl-4">
                  <h6 className="text-text-primary">Special Occasions</h6>
                  <p className="mt-1 text-sm text-text-body">
                    We go the extra mile for birthdays, anniversaries, and
                    celebrations.
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mt-8 border-2 border-border bg-bg-card p-6">
                <h6>Operating Hours</h6>
                <div className="mt-4 space-y-2 text-sm text-text-body">
                  <div className="flex justify-between">
                    <span>Monday - Saturday</span>
                    <span className="text-text-primary">8:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-text-primary">9:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Form */}
            <div className="lg:col-span-3">
              <div className="border-2 border-border bg-bg-card p-6 sm:p-8">
                <h3>Book Your Table</h3>
                <p className="mt-2 text-sm text-text-body">
                  Fill out the form below and we will confirm your reservation.
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-6 space-y-5"
                >
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        {...register('name')}
                      />
                      {errors.name?.message && (
                        <p className="mt-1 text-xs text-error">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        {...register('email')}
                      />
                      {errors.email?.message && (
                        <p className="mt-1 text-xs text-error">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Party Size */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="01712345678"
                        {...register('phone')}
                      />
                      {errors.phone?.message && (
                        <p className="mt-1 text-xs text-error">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                        Party Size *
                      </label>
                      <input
                        type="number"
                        placeholder="2"
                        min={1}
                        max={50}
                        {...register('party_size')}
                      />
                      {errors.party_size?.message && (
                        <p className="mt-1 text-xs text-error">
                          {errors.party_size.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                        Date *
                      </label>
                      <input
                        type="date"
                        min={minDate}
                        {...register('date')}
                        suppressHydrationWarning
                      />
                      {errors.date?.message && (
                        <p className="mt-1 text-xs text-error">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                        Time *
                      </label>
                      <select {...register('time')}>
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                      {errors.time?.message && (
                        <p className="mt-1 text-xs text-error">
                          {errors.time.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[2px] text-text-muted">
                      Event Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('event_type', type.value)}
                          className={`border-2 px-3 py-2 text-xs uppercase tracking-[1px] transition-all ${
                            selectedEventType === type.value
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border text-text-muted hover:border-link-hover/50 hover:text-text-primary'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                      Special Requests
                    </label>
                    <textarea
                      {...register('special_requests')}
                      placeholder="Any dietary requirements, accessibility needs, or special arrangements..."
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={createReservation.isPending}
                    className="btn-vincent-filled w-full text-center disabled:opacity-50"
                  >
                    {createReservation.isPending
                      ? 'Submitting...'
                      : 'Submit Reservation'}
                  </button>

                  <p className="text-center text-xs text-text-muted">
                    Reservations are confirmed within 2 hours during operating
                    hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
