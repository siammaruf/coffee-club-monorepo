import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Layout() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  const handleScroll = useCallback(() => {
    setShowBackToTop(window.scrollY > 400)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm-bg">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all duration-300 hover:bg-primary-700 hover:shadow-xl',
          showBackToTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}
