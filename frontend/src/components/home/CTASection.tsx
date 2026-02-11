import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 py-16 sm:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
          Ready to Order?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Experience the finest coffee and cuisine delivered right to your doorstep,
          or reserve your table for an unforgettable dining experience.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-bold text-primary-700 shadow-lg transition-all hover:bg-cream hover:shadow-xl active:scale-[0.98]"
          >
            Order Now
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="tel:+8801712345678"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            <Phone className="h-5 w-5" />
            Call Us
          </a>
        </div>
      </div>
    </section>
  )
}
