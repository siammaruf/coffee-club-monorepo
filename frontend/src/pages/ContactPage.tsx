import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    lines: ['123 Coffee Street, Gulshan-2', 'Dhaka 1212, Bangladesh'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    lines: ['+880 1712-345678', '+880 1812-345678'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: ['hello@coffeeclub.com', 'support@coffeeclub.com'],
  },
  {
    icon: Clock,
    title: 'Opening Hours',
    lines: ['Mon - Sat: 8:00 AM - 10:00 PM', 'Sunday: 9:00 AM - 9:00 PM'],
  },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('Message sent successfully! We will get back to you soon.')
    setName('')
    setEmail('')
    setPhone('')
    setSubject('')
    setMessage('')
    setIsSubmitting(false)
  }

  return (
    <>
      <title>Contact Us | CoffeeClub</title>
      <meta name="description" content="Get in touch with CoffeeClub. Find our location, contact details, and send us a message." />
      <meta property="og:title" content="Contact Us | CoffeeClub" />
      <meta property="og:description" content="Get in touch with CoffeeClub. Find our location, contact details, and send us a message." />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
    <div className="bg-cream">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-primary-950 via-primary-900 to-dark py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            We would love to hear from you. Get in touch with us today.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-coffee">Get in Touch</h2>
            <p className="mt-2 text-coffee-light">
              Whether you have a question, feedback, or a catering inquiry, we are here to help.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="rounded-xl border border-primary-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <info.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-coffee">{info.title}</h3>
                  {info.lines.map((line) => (
                    <p key={line} className="mt-0.5 text-sm text-coffee-light">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-100 to-primary-200 shadow-sm">
              <div className="flex h-56 items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-10 w-10 text-primary-500" />
                  <p className="mt-2 text-sm font-medium text-primary-700">
                    123 Coffee Street, Gulshan-2
                  </p>
                  <p className="text-xs text-primary-600">Dhaka 1212, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-coffee">Send us a Message</h2>
              <p className="mt-1 text-sm text-coffee-light">
                Fill out the form below and we will respond within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="Name *"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />

                <Input
                  label="Email *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />

                <Input
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712345678"
                />

                <Input
                  label="Subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this about?"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-coffee">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need..."
                    rows={5}
                    className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-base text-coffee shadow-sm transition-colors placeholder:text-coffee-light/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
