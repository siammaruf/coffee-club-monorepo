import { Link } from 'react-router-dom'
import { ArrowRight, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-dark">
      {/* Subtle gold radial gradients */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(197,150,26,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(197,150,26,0.05) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(197,150,26,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Decorative circular elements */}
      <div className="absolute right-[10%] top-[15%] h-72 w-72 rounded-full border border-primary-500/10 opacity-60" />
      <div className="absolute right-[8%] top-[13%] h-80 w-80 rounded-full border border-primary-500/5 opacity-40" />
      <div className="absolute -left-20 bottom-[20%] h-64 w-64 rounded-full bg-gradient-to-br from-primary-500/5 to-transparent" />

      {/* Floating particles */}
      <div className="absolute left-[15%] top-1/4 h-2 w-2 rounded-full bg-primary-400/30 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute right-[25%] top-1/3 h-1.5 w-1.5 rounded-full bg-primary-300/20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute left-[30%] bottom-1/4 h-2.5 w-2.5 rounded-full bg-primary-500/15 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute right-[15%] top-[45%] h-2 w-2 rounded-full bg-primary-400/20 animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-4 pt-32 pb-20 sm:px-6 lg:flex-row lg:px-8 lg:pt-40 lg:pb-32">
        {/* Left: Text Content */}
        <div className="max-w-2xl text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-2 text-sm text-primary-400">
            <Coffee className="h-4 w-4" />
            <span>Premium Coffee & Cuisine</span>
          </div>

          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-cream sm:text-5xl lg:text-6xl xl:text-7xl">
            The Art of{' '}
            <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
              Fine Dining
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-coffee-light sm:text-xl">
            Experience the finest coffee and cuisine at CoffeeClub. Order online
            for pickup, delivery, or dine-in. Every cup tells a story, every
            dish is a masterpiece.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/menu">
              <Button variant="gold" size="lg" className="w-full sm:w-auto">
                Order Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Menu
              </Button>
            </Link>
          </div>

          {/* Gold Stats Mini-Bar */}
          <div className="mt-12 flex items-center justify-center gap-8 lg:justify-start">
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-primary-400">50+</p>
              <p className="text-sm text-coffee-light">Menu Items</p>
            </div>
            <div className="h-8 w-px bg-primary-800/50" />
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-primary-400">10K+</p>
              <p className="text-sm text-coffee-light">Happy Customers</p>
            </div>
            <div className="h-8 w-px bg-primary-800/50" />
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-primary-400">4.9</p>
              <p className="text-sm text-coffee-light">Rating</p>
            </div>
          </div>
        </div>

        {/* Right: Decorative Illustration */}
        <div className="relative hidden lg:block">
          <div className="relative h-[500px] w-[500px]">
            {/* Large decorative circle with gold border */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="h-72 w-72 rounded-full border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-dark-card shadow-2xl animate-pulse-glow" />
                <div className="absolute inset-6 rounded-full border border-primary-500/10 bg-dark-light/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coffee className="h-28 w-28 text-primary-500/60" />
                </div>
              </div>
            </div>

            {/* Smaller decorative circles */}
            <div className="absolute left-0 top-16 h-20 w-20 rounded-full border border-primary-500/15 bg-gradient-to-br from-primary-500/5 to-transparent animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute right-4 top-24 h-14 w-14 rounded-full border border-primary-400/10 bg-gradient-to-br from-primary-400/5 to-transparent animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-20 left-8 h-16 w-16 rounded-full border border-primary-500/10 bg-gradient-to-br from-primary-600/5 to-transparent animate-float" style={{ animationDelay: '0.8s' }} />

            {/* Steam effects */}
            <div className="absolute left-1/2 top-8 -translate-x-6 opacity-40">
              <div className="h-10 w-0.5 rounded-full bg-primary-400/30 animate-steam" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute left-1/2 top-6 translate-x-2 opacity-30">
              <div className="h-12 w-0.5 rounded-full bg-primary-400/20 animate-steam" style={{ animationDelay: '0.6s' }} />
            </div>
            <div className="absolute left-1/2 top-10 translate-x-8 opacity-35">
              <div className="h-8 w-0.5 rounded-full bg-primary-400/25 animate-steam" style={{ animationDelay: '1.2s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom transition - dark to dark-light */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#1A1A1A"
          />
        </svg>
      </div>
    </section>
  )
}
