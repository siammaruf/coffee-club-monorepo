import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react'
import toast from 'react-hot-toast'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Order Online', href: '/menu' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
]

const menuCategories = [
  { label: 'Hot Drinks', href: '/menu?category=hot-drinks' },
  { label: 'Cold Drinks', href: '/menu?category=cold-drinks' },
  { label: 'Foods', href: '/menu?category=foods' },
  { label: 'Desserts', href: '/menu?category=desserts' },
  { label: 'Specials', href: '/menu?category=specials' },
]

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
    <footer className="bg-dark-light text-cream">
      {/* Newsletter Section */}
      <div className="border-b border-primary-800/30 bg-dark-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <h3 className="font-heading text-2xl font-bold">
                Stay Updated with <span className="text-primary-400">CoffeeClub</span>
              </h3>
              <p className="mt-1 text-coffee-light">
                Subscribe to our newsletter for exclusive offers and updates.
              </p>
            </div>
            <form
              onSubmit={handleNewsletter}
              className="flex w-full max-w-md gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-primary-800/40 bg-dark-card px-4 py-3 text-cream placeholder:text-coffee-light/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 font-bold text-dark transition-all hover:bg-primary-400 hover:shadow-lg"
              >
                <Send className="h-4 w-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: About */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="font-heading text-2xl font-bold tracking-wide">
                Coffee<span className="text-primary-400">Club</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-coffee-light">
              CoffeeClub is your go-to destination for exceptional coffee and delicious cuisine.
              We source the finest beans and ingredients to bring you a memorable dining experience
              every time you visit.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800/30 text-coffee-light transition-all hover:bg-primary-500 hover:text-dark"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading mb-4 text-xl text-primary-400">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-coffee-light transition-colors hover:text-primary-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Menu Categories */}
          <div>
            <h4 className="font-heading mb-4 text-xl text-primary-400">Menu</h4>
            <ul className="space-y-3">
              {menuCategories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    to={cat.href}
                    className="text-sm text-coffee-light transition-colors hover:text-primary-400"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Operating Hours */}
            <h4 className="font-heading mb-3 mt-8 text-xl text-primary-400">Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-coffee-light">
                <Clock className="h-4 w-4 shrink-0 text-primary-500" />
                <span>Mon - Sat: 8 AM - 10 PM</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-coffee-light">
                <Clock className="h-4 w-4 shrink-0 text-primary-500" />
                <span>Sunday: 9 AM - 9 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-heading mb-4 text-xl text-primary-400">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                <span className="text-sm text-coffee-light">
                  123 Coffee Street, Gulshan-2,<br />
                  Dhaka 1212, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary-500" />
                <a
                  href="tel:+8801712345678"
                  className="text-sm text-coffee-light transition-colors hover:text-primary-400"
                >
                  +880 1712-345678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary-500" />
                <a
                  href="mailto:hello@coffeeclub.com"
                  className="text-sm text-coffee-light transition-colors hover:text-primary-400"
                >
                  hello@coffeeclub.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-800/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-coffee-light/60">
            &copy; {new Date().getFullYear()} CoffeeClub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-coffee-light/40">We accept</span>
            <div className="flex items-center gap-3 text-coffee-light/50">
              <span aria-label="Cash"><Banknote className="h-5 w-5" /></span>
              <span aria-label="bKash"><Smartphone className="h-5 w-5" /></span>
              <span aria-label="Bank Card"><CreditCard className="h-5 w-5" /></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
