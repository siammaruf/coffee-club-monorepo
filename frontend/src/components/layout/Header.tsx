import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  ShoppingCart,
  X,
  User,
  LogOut,
  ClipboardList,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import { defaultSettings } from '@/lib/defaults'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  {
    label: 'Shop',
    href: '#',
    children: [
      { label: 'Cart', href: '/cart' },
      { label: 'Checkout', href: '/checkout' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const { isAuthenticated, customer, logout } = useAuth()
  const { itemCount, total, openDrawer } = useCart()
  const { data: content } = useWebsiteContent()
  const phone = content?.settings?.phone ?? defaultSettings.phone
  const hours = content?.settings?.hours ?? defaultSettings.hours
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setIsMobileOpen(false)
    setIsDropdownOpen(false)
    setActiveSubmenu(null)
  }, [location.pathname])

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
    if (href === '#') return false
    return location.pathname.startsWith(href)
  }

  return (
    <header className="bg-bg-primary">
      <div className="flex items-stretch">
        {/* Left: Phone + Hours */}
        <div className="hidden w-1/4 items-center justify-center border-b border-border px-4 py-4 lg:flex">
          <div className="flex items-center gap-4">
            <img
              src="/img/icon_phone.png"
              alt=""
              className="h-[41px] w-[28px]"
              aria-hidden="true"
            />
            <div>
              <div className="font-heading text-[16px] font-bold tracking-[3px] text-white">
                {phone}
              </div>
              <div className="mt-1 text-[13px] tracking-[3px] text-text-primary opacity-50">
                {hours}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Logo + Nav */}
        <div className="flex-1 border-b border-border lg:w-1/2">
          {/* Desktop Nav */}
          <div className="hidden lg:block">
            {/* Logo */}
            <div className="flex justify-center" style={{ padding: '55px 0 45px' }}>
              <Link to="/" className="block">
                <img src="/img/logo.png" alt="CoffeeClub" className="h-[99px] w-[176px]" />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex justify-center border-t border-border">
              <ul className="flex items-center">
                {navLinks.map((link) => (
                  <li
                    key={link.label}
                    className="relative group"
                    onMouseEnter={() =>
                      link.children && setActiveSubmenu(link.label)
                    }
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    {link.children ? (
                      <button
                        className={cn(
                          'nav-item-link px-[15px] pt-[10px] pb-[29px] font-heading text-[14px] font-normal uppercase tracking-[4px] leading-[14px] transition-colors',
                          isActive(link.href)
                            ? 'active text-accent'
                            : 'text-white hover:text-accent'
                        )}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className={cn(
                          'nav-item-link block px-[15px] pt-[10px] pb-[29px] font-heading text-[14px] font-normal uppercase tracking-[4px] leading-[14px] transition-colors',
                          isActive(link.href)
                            ? 'active text-accent'
                            : 'text-white hover:text-accent'
                        )}
                      >
                        {link.label}
                      </Link>
                    )}

                    {/* Submenu */}
                    {link.children && activeSubmenu === link.label && (
                      <ul className="absolute top-[53px] left-1/2 z-[10000] w-[210px] -translate-x-1/2 bg-bg-secondary pt-[15px] pb-[14px] text-left">
                        {/* Triangle arrow */}
                        <div
                          className="absolute -top-[12px] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-bg-secondary"
                          aria-hidden="true"
                        />
                        {link.children.map((child, idx) => (
                          <li key={child.label} className="px-[28px]">
                            <Link
                              to={child.href}
                              className={cn(
                                'block pt-[11px] pb-[13px] text-[14px] font-normal leading-[15px] tracking-normal text-white transition-colors hover:text-accent',
                                idx < (link.children?.length ?? 0) - 1
                                  ? 'border-b border-[#2c3235]'
                                  : 'border-b border-transparent'
                              )}
                              style={{ fontFamily: "'Open Sans', sans-serif" }}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}

                {/* Auth Links in Nav */}
                {isAuthenticated && customer ? (
                  <li
                    className="relative group"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <button className="nav-item-link flex items-center px-[15px] pt-[10px] pb-[29px] font-heading text-[14px] font-normal uppercase tracking-[4px] leading-[14px] text-white hover:text-accent transition-colors">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {customer.name?.split(' ')[0] ?? 'Account'}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                    {isDropdownOpen && (
                      <ul className="absolute right-0 top-[53px] z-[10000] w-[210px] bg-bg-secondary pt-[15px] pb-[14px] text-left">
                        {/* Triangle arrow */}
                        <div
                          className="absolute -top-[12px] right-[20px] border-[6px] border-transparent border-b-bg-secondary"
                          aria-hidden="true"
                        />
                        <li className="px-[28px]">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 pt-[11px] pb-[13px] text-[14px] font-normal leading-[15px] tracking-normal text-white transition-colors hover:text-accent border-b border-[#2c3235]"
                            style={{ fontFamily: "'Open Sans', sans-serif" }}
                          >
                            <User className="h-3.5 w-3.5" />
                            Profile
                          </Link>
                        </li>
                        <li className="px-[28px]">
                          <Link
                            to="/orders"
                            className="flex items-center gap-2 pt-[11px] pb-[13px] text-[14px] font-normal leading-[15px] tracking-normal text-white transition-colors hover:text-accent border-b border-[#2c3235]"
                            style={{ fontFamily: "'Open Sans', sans-serif" }}
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            Orders
                          </Link>
                        </li>
                        <li className="px-[28px]">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 pt-[11px] pb-[13px] text-[14px] font-normal leading-[15px] tracking-normal text-error transition-colors hover:text-accent border-b border-transparent"
                            style={{ fontFamily: "'Open Sans', sans-serif" }}
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="nav-item-link block px-[15px] pt-[10px] pb-[29px] font-heading text-[14px] font-normal uppercase tracking-[4px] leading-[14px] text-white hover:text-accent transition-colors"
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="nav-item-link block px-[15px] pt-[10px] pb-[29px] font-heading text-[14px] font-normal uppercase tracking-[4px] leading-[14px] text-white hover:text-accent transition-colors"
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>

          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-4 lg:hidden">
            <Link to="/" className="block">
              <img src="/img/logo.png" alt="CoffeeClub" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              {/* Mobile Cart */}
              <button
                onClick={openDrawer}
                className="relative p-2 text-text-primary"
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg-primary">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
              {/* Hamburger */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 text-text-primary"
                aria-label="Toggle mobile menu"
              >
                {isMobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <div className="space-y-1.5">
                    <span className="block h-0.5 w-6 bg-text-primary" />
                    <span className="block h-0.5 w-6 bg-text-primary" />
                    <span className="block h-0.5 w-6 bg-text-primary" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cart Widget */}
        <div className="hidden w-1/4 items-center justify-center border-b border-border px-4 py-4 lg:flex">
          <button onClick={openDrawer} className="group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-heading text-[16px] font-bold tracking-[3px] text-text-primary transition-colors group-hover:text-accent">
                  {formatPrice(total)}
                </div>
                <div className="text-[13px] tracking-[3px] text-text-primary opacity-50 transition-all group-hover:opacity-100">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} - View Cart
                </div>
              </div>
              <div className="relative">
                <img
                  src="/img/icon_cart.png"
                  alt="Cart"
                  className="h-[37px] w-[35px]"
                />
                {itemCount > 0 && (
                  <span className="absolute -top-[6px] -right-[3px] flex h-[19px] w-[19px] items-center justify-center rounded-full bg-accent font-heading text-[10px] leading-[18px] tracking-normal text-bg-primary">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-[300px] max-w-[85vw] bg-bg-secondary shadow-2xl transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <img src="/img/logo.png" alt="CoffeeClub" className="h-8 w-auto" />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-text-muted hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <div className="px-4 py-3 text-xs font-bold uppercase tracking-[3px] text-text-muted">
                        {link.label}
                      </div>
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-6 py-2 text-sm text-text-primary hover:text-accent transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      className={cn(
                        'block px-4 py-3 text-xs font-bold uppercase tracking-[3px] transition-colors',
                        isActive(link.href)
                          ? 'text-accent'
                          : 'text-text-primary hover:text-accent'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <hr className="my-4 border-border" />

            {isAuthenticated && customer ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-bg-primary">
                    {customer.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {customer.name ?? 'User'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {customer.email ?? ''}
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:text-accent"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:text-accent"
                >
                  <ClipboardList className="h-4 w-4" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-error"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full border-2 border-border py-3 text-center text-xs font-bold uppercase tracking-[3px] text-text-primary hover:border-accent hover:text-accent transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full border-2 border-accent bg-accent py-3 text-center text-xs font-bold uppercase tracking-[3px] text-bg-primary hover:bg-accent-hover transition-colors"
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
