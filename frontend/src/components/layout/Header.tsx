import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Coffee,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  ClipboardList,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
    setIsDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-dark/95 backdrop-blur-md shadow-lg'
          : 'bg-dark/80 backdrop-blur-sm'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white transition-opacity hover:opacity-90"
        >
          <Coffee className="h-8 w-8 text-primary-400" />
          <span className="text-xl font-bold">
            Coffee<span className="text-primary-400">Club</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                location.pathname === link.href
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={openDrawer}
            className="relative rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Auth Section */}
          {isAuthenticated && customer ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{customer.name.split(' ')[0]}</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isDropdownOpen && 'rotate-180')} />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-primary-100 bg-white py-2 shadow-xl animate-fade-in">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-coffee hover:bg-primary-50"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-coffee hover:bg-primary-50"
                    >
                      <ClipboardList className="h-4 w-4" />
                      My Orders
                    </Link>
                    <hr className="my-1 border-primary-100" />
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="border-t border-white/10 bg-dark/95 backdrop-blur-md md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-3 border-white/10" />

            {isAuthenticated && customer ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <ClipboardList className="h-5 w-5" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-error hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex-1 rounded-lg border border-white/20 py-3 text-center text-base font-medium text-white transition-colors hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-center text-base font-semibold text-white shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
