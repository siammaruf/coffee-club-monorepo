import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface PageBannerProps {
  title: string
  subtitle?: string
  breadcrumbs: { label: string; href?: string }[]
}

export function PageBanner({ title, subtitle, breadcrumbs }: PageBannerProps) {
  return (
    <section className="relative bg-dark-light py-20 sm:py-28 overflow-hidden">
      {/* Decorative gold gradient accent */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-500 to-transparent rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Breadcrumb */}
        <nav className="flex items-center justify-center gap-2 text-sm mb-6">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 text-coffee-light" />}
              {crumb.href ? (
                <Link to={crumb.href} className="text-coffee-light hover:text-primary-400 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-primary-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Title */}
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-cream">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 text-lg text-coffee-light max-w-2xl mx-auto">{subtitle}</p>
        )}

        {/* Gold decorative line */}
        <div className="mx-auto mt-6 h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-400" />
      </div>
    </section>
  )
}
