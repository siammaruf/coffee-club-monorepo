import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CalendarDays,
  Clock,
  Users,
  User,
  Mail,
  Phone,
  Sparkles,
  CheckCircle,
  PartyPopper,
} from 'lucide-react'
import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'
import { PageBanner } from '@/components/ui/PageBanner'

export const meta: MetaFunction = () => [
  { title: 'Reserve a Table | CoffeeClub' },
  { name: 'description', content: 'Book your table at CoffeeClub. Perfect for dining, celebrations, meetings, and private events.' },
  { property: 'og:title', content: 'Reserve a Table | CoffeeClub' },
  { property: 'og:description', content: 'Book your table at CoffeeClub. Perfect for dining, celebrations, meetings, and private events.' },
  { property: 'og:type', content: 'website' },
]
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateReservation } from '@/services/httpServices/queries/useReservations'
import type { EventType } from '@/types/reservation'
import toast from 'react-hot-toast'

const reservationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  party_size: z.preprocess(
    (val) => (typeof val === 'string' ? Number(val) : val),
    z.number().min(1, 'Party size must be at least 1').max(50, 'Party size cannot exceed 50')
  ),
  event_type: z.string().optional(),
  special_requests: z.string().optional(),
})

type ReservationFormData = z.infer<typeof reservationSchema>

const eventTypes: { value: EventType; label: string; icon: React.ReactNode }[] = [
  { value: 'DINING', label: 'Regular Dining', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'BIRTHDAY', label: 'Birthday Party', icon: <PartyPopper className="h-4 w-4" /> },
  { value: 'MEETING', label: 'Business Meeting', icon: <Users className="h-4 w-4" /> },
  { value: 'PRIVATE_EVENT', label: 'Private Event', icon: <CalendarDays className="h-4 w-4" /> },
  { value: 'OTHER', label: 'Other', icon: <Sparkles className="h-4 w-4" /> },
]

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00',
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

  // Minimum date is tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

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

  if (isSuccess) {
    return (
      <>
        <PageBanner
          title="Reservation"
          subtitle="Book your table at CoffeeClub."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reservation' }]}
        />

        <div className="bg-warm-bg">
          <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="font-heading mt-6 text-2xl font-bold text-text-primary">
                Reservation Submitted!
              </h2>
              <p className="mt-3 text-text-body">
                Thank you for your reservation request. We will confirm your booking shortly
                via email. Please check your inbox for a confirmation message.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link to="/menu">
                  <Button>Browse Menu</Button>
                </Link>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  Make Another Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageBanner
        title="Reserve a Table"
        subtitle="Secure your spot for a memorable dining experience."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reservation' }]}
      />

      <div className="bg-warm-bg">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            {/* Info Panel */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                Why Reserve With Us?
              </h2>
              <p className="mt-3 text-text-body">
                Enjoy a premium dining experience in a warm, welcoming atmosphere. Whether
                it is a casual dinner, a birthday celebration, or a business meeting, we
                have the perfect setting for you.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <CalendarDays className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Flexible Scheduling</h3>
                    <p className="mt-1 text-sm text-text-body">
                      Reserve for any occasion, from morning coffee to dinner service.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Group Friendly</h3>
                    <p className="mt-1 text-sm text-text-body">
                      Accommodate parties of all sizes, from intimate dinners to large gatherings.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <Sparkles className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Special Occasions</h3>
                    <p className="mt-1 text-sm text-text-body">
                      We go the extra mile for birthdays, anniversaries, and celebrations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Operating Hours
                </h3>
                <div className="mt-4 space-y-2 text-sm text-text-body">
                  <div className="flex justify-between">
                    <span>Monday - Saturday</span>
                    <span className="font-medium text-text-primary">8:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-text-primary">9:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
                <h2 className="font-heading text-xl font-bold text-text-primary">
                  Book Your Table
                </h2>
                <p className="mt-1 text-sm text-text-body">
                  Fill out the form below and we will confirm your reservation.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Full Name *"
                      type="text"
                      placeholder="Your name"
                      icon={<User className="h-5 w-5" />}
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="Email *"
                      type="email"
                      placeholder="your@email.com"
                      icon={<Mail className="h-5 w-5" />}
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  {/* Phone & Party Size */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Phone *"
                      type="tel"
                      placeholder="01712345678"
                      icon={<Phone className="h-5 w-5" />}
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Input
                      label="Party Size *"
                      type="number"
                      placeholder="2"
                      min={1}
                      max={50}
                      icon={<Users className="h-5 w-5" />}
                      error={errors.party_size?.message}
                      {...register('party_size')}
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Date *"
                      type="date"
                      min={minDate}
                      icon={<CalendarDays className="h-5 w-5" />}
                      error={errors.date?.message}
                      {...register('date')}
                    />
                    <div className="w-full">
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">
                        Time *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                          <Clock className="h-5 w-5" />
                        </div>
                        <select
                          {...register('time')}
                          className="flex h-11 w-full appearance-none rounded-lg border border-border bg-white pl-10 pr-4 py-2 text-base text-text-primary shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.time?.message && (
                        <p className="mt-1.5 text-sm text-error">{errors.time.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Event Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('event_type', type.value)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                            selectedEventType === type.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-border bg-white text-text-body hover:border-primary-300 hover:bg-warm-surface'
                          }`}
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      Special Requests
                    </label>
                    <textarea
                      {...register('special_requests')}
                      placeholder="Any dietary requirements, accessibility needs, or special arrangements..."
                      rows={4}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-base text-text-primary shadow-sm transition-colors placeholder:text-text-muted/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    isLoading={createReservation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    <CalendarDays className="h-5 w-5" />
                    Submit Reservation
                  </Button>

                  <p className="text-center text-xs text-text-muted">
                    Reservations are confirmed within 2 hours during operating hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
