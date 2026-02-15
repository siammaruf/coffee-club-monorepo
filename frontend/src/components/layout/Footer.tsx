import { Link } from 'react-router'
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { defaultSettings } from '@/lib/defaults'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  const { data: content } = useWebsiteContent()
  const phone = content?.settings?.phone ?? defaultSettings.phone
  const hours = content?.settings?.hours ?? defaultSettings.hours
  const social = content?.settings?.social ?? defaultSettings.social

  const socialLinks = [
    { icon: FaTwitter, href: social.twitter || 'https://twitter.com/', label: 'Twitter' },
    { icon: FaFacebook, href: social.facebook || 'https://www.facebook.com/', label: 'Facebook' },
    { icon: FaInstagram, href: social.instagram || 'https://www.instagram.com/', label: 'Instagram' },
  ]

  return (
    <footer className="bg-bg-primary border-t border-border py-14">
      <div className="vincent-container text-center">
        {/* Logo */}
        <div className="mb-6">
          <Link to="/" className="inline-block">
            <img src="/img/logo.png" alt="CoffeeClub" className="w-[200px] h-auto" />
          </Link>
        </div>

        {/* Phone & Hours */}
        <div className="mb-8 text-sm tracking-[2px] text-text-muted">
          {phone}. <span>{hours}</span>
        </div>

        {/* Navigation Links */}
        <ul className="mb-8 flex flex-wrap items-center justify-center gap-6">
          {footerLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                className="text-xs font-bold uppercase tracking-[3px] text-text-primary transition-colors hover:text-link-hover"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Social Icons */}
        <ul className="mb-8 flex items-center justify-center gap-4">
          {socialLinks.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-link-hover"
              >
                <item.icon className="h-5 w-5" />
              </a>
            </li>
          ))}
        </ul>

        {/* Copyright */}
        <div className="text-xs tracking-[2px] text-text-muted" suppressHydrationWarning>
          Copyright &copy; {new Date().getFullYear()} CoffeeClub. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
