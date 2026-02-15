import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router'
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
    <div className="flex min-h-screen flex-col bg-bg-primary">
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
          'fixed bottom-[50px] right-[50px] z-40 flex h-[60px] w-[60px] items-center justify-center bg-accent text-bg-primary transition-all duration-300 hover:opacity-70',
          showBackToTop
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  )
}
