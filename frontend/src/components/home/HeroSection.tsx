import { Link } from 'react-router-dom'
import { ArrowRight, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-dark">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(251,191,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(251,191,36,0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute left-10 top-1/4 h-3 w-3 rounded-full bg-primary-400/40 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute right-20 top-1/3 h-2 w-2 rounded-full bg-primary-300/30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute left-1/4 bottom-1/4 h-4 w-4 rounded-full bg-primary-500/20 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute right-1/3 top-1/5 h-2.5 w-2.5 rounded-full bg-primary-400/25 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute left-1/2 bottom-1/3 h-3.5 w-3.5 rounded-full bg-primary-300/20 animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-4 pt-32 pb-20 sm:px-6 lg:flex-row lg:px-8 lg:pt-40 lg:pb-32">
        {/* Left: Text Content */}
        <div className="max-w-2xl text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-4 py-2 text-sm text-primary-300">
            <Coffee className="h-4 w-4" />
            <span>Premium Coffee &amp; Cuisine</span>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Freshly Brewed,{' '}
            <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
              Perfectly Served
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">
            Experience the finest coffee and cuisine at CoffeeClub. Order online
            for pickup, delivery, or dine-in. Every cup tells a story, every
            dish is a masterpiece.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/menu">
              <Button size="lg" className="w-full sm:w-auto">
                Order Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline-white" size="lg" className="w-full sm:w-auto">
                View Menu
              </Button>
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="mt-12 flex items-center justify-center gap-8 lg:justify-start">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">50+</p>
              <p className="text-sm text-white/50">Menu Items</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">10K+</p>
              <p className="text-sm text-white/50">Happy Customers</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">4.9</p>
              <p className="text-sm text-white/50">Rating</p>
            </div>
          </div>
        </div>

        {/* Right: Hero Illustration */}
        <div className="relative hidden lg:block">
          <div className="relative h-[500px] w-[500px]">
            {/* Main coffee cup shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="h-72 w-72 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-700/20 shadow-2xl animate-pulse-glow" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-600/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coffee className="h-32 w-32 text-primary-400/80" />
                </div>
              </div>
            </div>

            {/* Steam effects */}
            <div className="absolute left-1/2 top-8 -translate-x-6 opacity-60">
              <div className="h-10 w-1 rounded-full bg-primary-300/40 animate-steam" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute left-1/2 top-6 translate-x-2 opacity-40">
              <div className="h-12 w-1 rounded-full bg-primary-300/30 animate-steam" style={{ animationDelay: '0.6s' }} />
            </div>
            <div className="absolute left-1/2 top-10 translate-x-8 opacity-50">
              <div className="h-8 w-1 rounded-full bg-primary-300/35 animate-steam" style={{ animationDelay: '1.2s' }} />
            </div>

            {/* Orbiting coffee beans */}
            <div className="absolute left-4 top-20 h-6 w-4 rotate-45 rounded-full bg-primary-700/40 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute right-8 top-32 h-5 w-3 -rotate-30 rounded-full bg-primary-600/30 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-24 left-12 h-5 w-3.5 rotate-60 rounded-full bg-primary-700/35 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-32 right-16 h-4 w-3 -rotate-45 rounded-full bg-primary-600/25 animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
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
            fill="#fefce8"
          />
        </svg>
      </div>
    </section>
  )
}
