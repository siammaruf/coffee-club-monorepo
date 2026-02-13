import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  ClipboardList,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Reservation', href: '/reservation' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isAuthenticated, customer, logout } = useAuth()
  const { itemCount, openDrawer } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setIsMobileOpen(false)
    setIsDropdownOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar - hidden on mobile */}
      <div className="hidden bg-dark text-text-light md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-text-light/80">
            <MapPin className="h-3.5 w-3.5 text-primary-400" />
            <span>123 Coffee Street, Gulshan-2, Dhaka 1212</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-light/80">
            <a
              href="tel:+8801712345678"
              className="flex items-center gap-1.5 transition-colors hover:text-primary-400"
            >
              <Phone className="h-3.5 w-3.5 text-primary-400" />
              +880 1712-345678
            </a>
            <a
              href="mailto:hello@coffeeclub.com"
              className="flex items-center gap-1.5 transition-colors hover:text-primary-400"
            >
              <Mail className="h-3.5 w-3.5 text-primary-400" />
              hello@coffeeclub.com
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={cn(
          'transition-all duration-300',
          isScrolled
            ? 'bg-white/95 shadow-sm backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <span
              className={cn(
                'font-heading text-2xl font-bold tracking-wide',
                isScrolled ? 'text-text-primary' : 'text-white'
              )}
            >
              Coffee
              <span className="text-primary-500">Club</span>
            </span>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary-500'
                    : isScrolled
                      ? 'text-text-body hover:text-primary-500'
                      : 'text-white/90 hover:text-white'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 bg-primary-500" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Book a Table CTA - Hidden on mobile */}
            <Link
              to="/reservation"
              className="hidden rounded-lg bg-primary-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md md:inline-flex"
            >
              Book a Table
            </Link>

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className={cn(
                'relative rounded-lg p-2 transition-colors',
                isScrolled
                  ? 'text-text-body hover:bg-warm-surface hover:text-primary-600'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              )}
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Auth Section - Desktop */}
            {isAuthenticated && customer ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                    isScrolled
                      ? 'text-text-body hover:bg-warm-surface'
                      : 'text-white/90 hover:bg-white/10'
                  )}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">
                    {customer.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white py-2 shadow-xl animate-fade-in">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-body hover:bg-warm-surface hover:text-primary-600"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-body hover:bg-warm-surface hover:text-primary-600"
                      >
                        <ClipboardList className="h-4 w-4" />
                        My Orders
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/login"
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isScrolled
                      ? 'text-text-body hover:bg-warm-surface hover:text-primary-600'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg border-2 border-primary-500 bg-transparent px-4 py-2 text-sm font-semibold text-primary-500 transition-all hover:bg-primary-500 hover:text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn(
                'rounded-lg p-2 transition-colors lg:hidden',
                isScrolled
                  ? 'text-text-body hover:bg-warm-surface'
                  : 'text-white/90 hover:bg-white/10'
              )}
              aria-label="Toggle mobile menu"
            >
              {isMobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-[300px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="font-heading text-xl font-bold text-text-primary">
              Coffee<span className="text-primary-500">Club</span>
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-warm-surface hover:text-text-primary"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Nav Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-text-body hover:bg-warm-surface hover:text-primary-600'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Book a Table */}
            <div className="mt-4">
              <Link
                to="/reservation"
                className="block rounded-lg bg-primary-600 px-4 py-3 text-center text-base font-bold text-white transition-all hover:bg-primary-700"
              >
                Book a Table
              </Link>
            </div>

            <hr className="my-4 border-border" />

            {/* Mobile Auth Section */}
            {isAuthenticated && customer ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {customer.name}
                    </p>
                    <p className="text-xs text-text-muted">{customer.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-text-body hover:bg-warm-surface hover:text-primary-600"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-text-body hover:bg-warm-surface hover:text-primary-600"
                >
                  <ClipboardList className="h-5 w-5" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-error hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="flex-1 rounded-lg border-2 border-border py-3 text-center text-base font-medium text-text-body transition-colors hover:border-primary-300 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-lg bg-primary-600 py-3 text-center text-base font-semibold text-white shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
