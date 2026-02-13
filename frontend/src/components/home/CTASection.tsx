import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-dark py-16 sm:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(197,150,26,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(197,150,26,0.05) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Decorative border line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
          Get Started
        </span>
        <h2 className="mt-3 font-heading text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
          Ready to Order?
        </h2>
        <div className="gold-underline mx-auto mt-4" />
        <p className="mx-auto mt-6 max-w-xl text-lg text-coffee-light">
          Experience the finest coffee and cuisine delivered right to your doorstep,
          or reserve your table for an unforgettable dining experience.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/menu">
            <Button variant="gold" size="lg">
              Order Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <a href="tel:+8801712345678">
            <Button variant="outline" size="lg">
              <Phone className="h-5 w-5" />
              Call Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
