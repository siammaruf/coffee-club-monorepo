import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Coffee,
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
    <footer className="bg-dark text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                Stay Updated with <span className="text-primary-400">CoffeeClub</span>
              </h3>
              <p className="mt-1 text-white/60">
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
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold text-white transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-lg"
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
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Coffee className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">
                Coffee<span className="text-primary-400">Club</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-all hover:bg-primary-500 hover:text-white"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-bold text-primary-400">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-primary-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Menu Categories */}
          <div>
            <h4 className="mb-4 text-lg font-bold text-primary-400">Menu</h4>
            <ul className="space-y-3">
              {menuCategories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    to={cat.href}
                    className="text-sm text-white/60 transition-colors hover:text-primary-400"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="mb-4 text-lg font-bold text-primary-400">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />
                <span className="text-sm text-white/60">
                  123 Coffee Street, Gulshan-2,<br />
                  Dhaka 1212, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary-400" />
                <a
                  href="tel:+8801712345678"
                  className="text-sm text-white/60 transition-colors hover:text-primary-400"
                >
                  +880 1712-345678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary-400" />
                <a
                  href="mailto:hello@coffeeclub.com"
                  className="text-sm text-white/60 transition-colors hover:text-primary-400"
                >
                  hello@coffeeclub.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />
                <div className="text-sm text-white/60">
                  <p>Mon - Sat: 8:00 AM - 10:00 PM</p>
                  <p>Sunday: 9:00 AM - 9:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} CoffeeClub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">We accept</span>
            <div className="flex items-center gap-3 text-white/50">
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
