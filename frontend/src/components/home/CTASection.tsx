import { Link } from 'react-router'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="section-dark relative overflow-hidden py-20 sm:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(160,120,44,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(196,144,62,0.07) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Top decorative line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      {/* Floating accents */}
      <div className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-primary-400/20 animate-float" />
      <div className="absolute right-[15%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-primary-300/15 animate-float" style={{ animationDelay: '1s' }} />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-script text-xl text-primary-400 md:text-2xl">
          Do Not Miss Out
        </p>

        <h2 className="mt-4 font-heading text-3xl font-bold text-text-light sm:text-4xl lg:text-5xl">
          Ready for an Extraordinary Experience?
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-light/70">
          Whether you are craving a perfect cup of coffee, a gourmet meal, or a
          memorable dining experience, we are here to make it happen.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/reservation">
            <Button variant="gold" size="lg">
              <CalendarDays className="h-5 w-5" />
              Book a Table
            </Button>
          </Link>
          <Link to="/menu">
            <Button
              variant="outline"
              size="lg"
              className="border-text-light/30 text-text-light hover:bg-text-light/10"
            >
              View Menu
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
