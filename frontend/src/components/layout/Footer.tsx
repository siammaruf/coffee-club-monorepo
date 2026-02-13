import { useState } from 'react'
import { Link } from 'react-router'
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    toast.success('Thank you for subscribing!')
    setEmail('')
  }

  return (
    <footer className="border-t-2 border-primary-500 bg-dark text-text-light">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <Link to="/" className="inline-block">
              <span className="font-heading text-2xl font-bold tracking-wide">
                Coffee<span className="text-primary-400">Club</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-light/70">
              CoffeeClub is your go-to destination for exceptional coffee and
              delicious cuisine. We source the finest beans and ingredients to
              bring you a memorable dining experience every time you visit.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-text-light/70 transition-all hover:bg-primary-500 hover:text-white"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-primary-400">
              Contact Info
            </h4>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />
                <span className="text-sm text-text-light/70">
                  123 Coffee Street, Gulshan-2,
                  <br />
                  Dhaka 1212, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary-400" />
                <a
                  href="tel:+8801712345678"
                  className="text-sm text-text-light/70 transition-colors hover:text-primary-400"
                >
                  +880 1712-345678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary-400" />
                <a
                  href="mailto:hello@coffeeclub.com"
                  className="text-sm text-text-light/70 transition-colors hover:text-primary-400"
                >
                  hello@coffeeclub.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Opening Hours */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-primary-400">
              Opening Hours
            </h4>
            <ul className="mt-5 space-y-3">
              <li className="flex items-center gap-3 text-sm text-text-light/70">
                <Clock className="h-4 w-4 shrink-0 text-primary-400" />
                <div>
                  <span className="block font-medium text-text-light/90">
                    Monday - Friday
                  </span>
                  <span>8:00 AM - 10:00 PM</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-light/70">
                <Clock className="h-4 w-4 shrink-0 text-primary-400" />
                <div>
                  <span className="block font-medium text-text-light/90">
                    Saturday - Sunday
                  </span>
                  <span>9:00 AM - 11:00 PM</span>
                </div>
              </li>
            </ul>
            <div className="mt-6 rounded-lg bg-white/5 px-4 py-3">
              <p className="font-script text-lg text-primary-400">
                Freshly brewed, always!
              </p>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-primary-400">
              Stay Updated
            </h4>
            <p className="mt-4 text-sm text-text-light/70">
              Subscribe to our newsletter for exclusive offers, new menu items,
              and special events.
            </p>
            <form onSubmit={handleNewsletter} className="mt-5 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-text-light placeholder:text-text-light/40 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-500 hover:shadow-lg"
              >
                <Send className="h-4 w-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-text-light/50">
            &copy; {new Date().getFullYear()} CoffeeClub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
